const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const ExamResult = require('../models/ExamResult');
const crypto = require('crypto');
const QRCode = require("qrcode");
const User = require('../models/User'); // adjust path if different
const mongoose = require('mongoose');

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

    // Validate ObjectId formats to avoid CastError 500s
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }
    if (!mongoose.Types.ObjectId.isValid(examResultId)) {
      return res.status(400).json({ message: 'Invalid examResultId' });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch exam result
    const examResult = await ExamResult.findById(examResultId);
    if (!examResult) return res.status(404).json({ message: 'Exam result not found' });

    // Generate unique certificate ID
    const certificateId = crypto.randomBytes(8).toString('hex');

    // Save certificate
    const certificate = new Certificate({
      userId,
      examResultId,
      certificateId,
      issuedAt: new Date()
    });
    await certificate.save();

    // Generate QR code containing verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateId}`;
    const qrCodeData = await QRCode.toDataURL(verificationUrl);

    // Send rich data for UI with fields that exist in models
    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: {
        certificateId,
        issuedAt: certificate.issuedAt,
        user: {
          name: user.name,
          email: user.email
        },
        exam: {
          examName: examResult.examName,
          year: examResult.year,
          scores: examResult.scores
        },
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

    const certificate = await Certificate.findOne({ certificateId }).populate('userId examResultId');
    if (!certificate || certificate.revoked)
      return res.status(404).json({ message: 'Certificate not valid' });

    res.json({
      certificateId: certificate.certificateId,
      user: certificate.userId,
      userId: certificate.userId, // compatibility for frontend expecting userId
      examResult: certificate.examResultId,
      examResultId: certificate.examResultId, // compatibility for frontend expecting examResultId
      issuedAt: certificate.issuedAt,
      revoked: certificate.revoked,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's certificates
router.get('/my-certificates', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId in token' });
    }

    const certs = await Certificate.find({ userId }).populate('examResultId');

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

    const payload = certs.map((c) => {
      const exam = c.examResultId || {};
      const scores = exam.scores || {};
      const average = computeAverage(scores);
      const grade = computeGrade(average);
      return {
        _id: c._id,
        certificateId: c.certificateId,
        examName: exam.examName,
        year: exam.year,
        issuedAt: c.issuedAt,
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
