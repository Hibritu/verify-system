const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { query } = require('../db');
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

    // Insert placeholder to generate ID
    const insert = await query(
      'INSERT INTO pdf_certificates(title, filename, uploaded_by, encrypted_url) VALUES($1,$2,$3,$4) RETURNING id',
      [req.body.title || 'Untitled', req.file.filename, req.user.id, '']
    );
    const pdfId = insert.rows[0].id;

    // Encrypt ID and update row
    const encryptedId = encrypt(pdfId);
    await query('UPDATE pdf_certificates SET encrypted_url=$1 WHERE id=$2', [encryptedId, pdfId]);

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(encryptedId);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfUrl = `${baseUrl}/api/pdf/${encodeURIComponent(req.file.filename)}`;
    const downloadUrl = `${baseUrl}/api/pdf/by-id/${pdfId}`;

    return res.json({ 
      pdf: { id: pdfId, title: req.body.title || 'Untitled', filename: req.file.filename, encryptedUrl: encryptedId },
      qrCodeData, pdfUrl, downloadUrl 
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// --- Route: Safer download by ID (Place BEFORE :filename) ---
router.get('/by-id/:id', auth, async (req, res) => {
  try {
    const r = await query('SELECT filename FROM pdf_certificates WHERE id=$1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'PDF not found' });
    const filename = r.rows[0].filename;

    const filePath = path.join(__dirname, '../uploads', filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    const mode = req.query.mode === 'inline' ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `${mode}; filename="${encodeURIComponent(filename)}"`);
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
  const { encrypted } = req.body;
  if (!encrypted) return res.status(400).json({ error: 'No encrypted data provided' });

  // Basic format check: hex IV + ':' + hex ciphertext
  const isMaybeHex = /^[0-9a-fA-F]+:[0-9a-fA-F]+$/.test(encrypted);
  if (!isMaybeHex) return res.status(400).json({ error: 'Invalid encrypted string format' });

  let pdfId;
  try {
    pdfId = decrypt(encrypted);
  } catch (err) {
    console.error('Decrypt parse error:', err);
    return res.status(400).json({ error: 'Invalid encrypted string' });
  }

  try {
    const r = await query('SELECT filename FROM pdf_certificates WHERE id=$1', [pdfId]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'PDF not found' });
    const filename = r.rows[0].filename;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfUrl = `${baseUrl}/api/pdf/${encodeURIComponent(filename)}`;
    const downloadUrl = `${baseUrl}/api/pdf/by-id/${pdfId}`;

    return res.json({ pdfUrl, downloadUrl });
  } catch (err) {
    console.error('Decrypt DB error:', err);
    return res.status(500).json({ error: 'Server error while resolving PDF' });
  }
});

module.exports = router;
