const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { query } = require('../db');
const crypto = require('crypto');
const QRCode = require("qrcode");
// Keeping models present per user request; route logic uses Postgres

/**
 * @swagger
 * /api/certificates/generate:
 *   post:
 *     summary: Generate certificate for a user exam result
 *     security:
 *       - bearerAuth: []
 *     tags: [Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - examResultId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64f9a7b12ab4c5d0f1e9d2f3"
 *               examResultId:
 *                 type: string
 *                 example: "64f9a7b12ab4c5d0f1e9d2f4"
 *     responses:
 *       201:
 *         description: Certificate generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Certificate generated
 *                 certificateId:
 *                   type: string
 *                   example: a1b2c3d4e5f67890
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */




router.post('/generate', auth, adminOnly, async (req, res) => {
  try {
    const { userId, examResultId } = req.body;
    if (!userId || !examResultId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const userRes = await query('SELECT id, name, email FROM users WHERE id=$1', [userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    const user = userRes.rows[0];

    const examRes = await query('SELECT id, exam_name, year, scores FROM exam_results WHERE id=$1 AND user_id=$2', [examResultId, userId]);
    if (examRes.rowCount === 0) return res.status(404).json({ message: 'Exam result not found' });
    const examResult = examRes.rows[0];

    // Generate unique certificate ID
    const certificateId = crypto.randomBytes(8).toString('hex');

    // Save certificate
    const insert = await query(
      'INSERT INTO certificates(user_id, exam_result_id, certificate_id, issued_at) VALUES ($1,$2,$3,NOW()) RETURNING issued_at',
      [userId, examResultId, certificateId]
    );

    // Generate QR code containing verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateId}`;
    const qrCodeData = await QRCode.toDataURL(verificationUrl);

    // Send rich data for UI with fields that exist in models
    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: {
        certificateId,
        issuedAt: insert.rows[0].issued_at,
        user: { name: user.name, email: user.email },
        exam: { examName: examResult.exam_name, year: examResult.year, scores: examResult.scores },
        qrCode: qrCodeData
      }
    });

  } catch (err) {
    console.error('Generate certificate error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/certificates/verify:
 *   get:
 *     summary: Verify a certificate by certificateId
 *     tags: [Certificate]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique certificate ID
 *     responses:
 *       200:
 *         description: Certificate is valid
 *       404:
 *         description: Certificate not found or revoked
 */
router.get('/verify', async (req, res) => {
  try {
    const { certificateId } = req.query;
    if (!certificateId) return res.status(400).json({ message: 'certificateId required' });

    const r = await query(
      `SELECT c.certificate_id, c.issued_at, c.revoked,
              u.id as user_id, u.name as user_name, u.email as user_email,
              e.id as exam_result_id, e.exam_name, e.year, e.scores
         FROM certificates c
         JOIN users u ON u.id=c.user_id
         JOIN exam_results e ON e.id=c.exam_result_id
        WHERE c.certificate_id=$1`,
      [certificateId]
    );
    if (r.rowCount === 0 || r.rows[0].revoked) return res.status(404).json({ message: 'Certificate not valid' });
    const row = r.rows[0];
    res.json({
      certificateId: row.certificate_id,
      user: { id: row.user_id, name: row.user_name, email: row.user_email },
      userId: row.user_id,
      examResult: { id: row.exam_result_id, examName: row.exam_name, year: row.year, scores: row.scores },
      examResultId: row.exam_result_id,
      issuedAt: row.issued_at,
      revoked: row.revoked,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's certificates
router.get('/my-certificates', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const certs = await query(
      `SELECT c.id, c.certificate_id, c.issued_at, c.revoked,
              e.exam_name, e.year, e.scores
         FROM certificates c
         JOIN exam_results e ON e.id=c.exam_result_id
        WHERE c.user_id=$1`,
      [userId]
    );

    const computeAverage = (scores = {}) => {
      const vals = Object.values(scores);
      if (!vals.length) return 0;
      return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
    };

    const computeGrade = (avg) => {
      if (avg >= 90) return 'A';
      if (avg >= 80) return 'B';
      if (avg >= 70) return 'C';
      if (avg >= 60) return 'D';
      return 'F';
    };

    const payload = certs.rows.map((c) => {
      const scores = c.scores || {};
      const average = computeAverage(scores);
      const grade = computeGrade(average);
      return {
        _id: c.id,
        certificateId: c.certificate_id,
        examName: c.exam_name,
        year: c.year,
        issuedAt: c.issued_at,
        revoked: c.revoked,
        examResult: { scores, average, grade },
        qrCode: null,
      };
    });

    res.json(payload);
  } catch (err) {
    console.error('my-certificates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
