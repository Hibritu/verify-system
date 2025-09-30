const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const PdfCertificate = require('../models/PdfCertificate');
const { auth, adminOnly } = require('../middleware/auth');

// --- Ensure Encryption Key Exists ---
if (!process.env.PDF_ENCRYPTION_KEY) {
  throw new Error('PDF_ENCRYPTION_KEY is not set in .env');
}
const keyHex = process.env.PDF_ENCRYPTION_KEY.trim();
if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
  throw new Error('PDF_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}
const ENCRYPTION_KEY = Buffer.from(keyHex, 'hex'); // 32 bytes hex
const IV_LENGTH = 16;

// --- Encryption Helpers ---
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// --- Multer Storage Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// --- Route: Upload PDF (Admin Only) ---
router.post('/upload', auth, adminOnly, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const pdf = new PdfCertificate({
      title: req.body.title || 'Untitled',
      filename: req.file.filename,
      uploadedBy: req.user.id,
    });

    // Encrypt ID and save
    const encryptedId = encrypt(pdf._id.toString());
    pdf.encryptedUrl = encryptedId;
    await pdf.save();

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(encryptedId);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfUrl = `${baseUrl}/api/pdf/${encodeURIComponent(pdf.filename)}`;
    const downloadUrl = `${baseUrl}/api/pdf/by-id/${pdf._id.toString()}`;

    return res.json({ pdf, qrCodeData, pdfUrl, downloadUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// --- Route: Safer download by ID (Place BEFORE :filename) ---
router.get('/by-id/:id', auth, async (req, res) => {
  try {
    const pdf = await PdfCertificate.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    const filePath = path.join(__dirname, '../uploads', pdf.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    const mode = req.query.mode === 'inline' ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `${mode}; filename="${encodeURIComponent(pdf.filename)}"`);
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Serve PDF by-id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Route: Download PDF by filename ---
router.get('/:filename', auth, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    const mode = req.query.mode === 'inline' ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `${mode}; filename="${encodeURIComponent(req.params.filename)}"`);
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Serve PDF error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Route: Decrypt encrypted string and return file URLs ---
router.post('/decrypt', auth, async (req, res) => {
  try {
    const { encrypted } = req.body;
    if (!encrypted) return res.status(400).json({ error: 'No encrypted data provided' });

    const pdfId = decrypt(encrypted);
    const pdf = await PdfCertificate.findById(pdfId);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfUrl = `${baseUrl}/api/pdf/${encodeURIComponent(pdf.filename)}`;
    const downloadUrl = `${baseUrl}/api/pdf/by-id/${pdf._id.toString()}`;

    return res.json({ pdfUrl, downloadUrl });
  } catch (err) {
    console.error('Decrypt error:', err);
    return res.status(400).json({ error: 'Invalid encrypted string' });
  }
});

module.exports = router;
