const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const ExamResult = require('../models/ExamResult');
const mongoose = require('mongoose');

/**
 * @swagger
 * /api/results/upload:
 *   post:
 *     summary: Upload exam results for a student (admin only)
 *     tags: [Exam Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - examName
 *               - year
 *               - scores
 *             properties:
 *               userId:
 *                 type: string
 *               examName:
 *                 type: string
 *               year:
 *                 type: integer
 *               scores:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *     responses:
 *       201:
 *         description: Exam result uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Exam result uploaded
 *                 examResultId:
 *                   type: string
 *                   example: 649ab1234c5678d9012ef345
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/upload', auth, adminOnly, async (req, res) => {
  try {
    const { userId, examName, year, scores } = req.body;

    // Basic validation
    if (!userId || !examName || !year || !scores || Object.keys(scores).length === 0) {
      return res.status(400).json({ message: 'Missing or invalid fields' });
    }

    // Optional: Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const examResult = new ExamResult({ userId, examName, year, scores });
    await examResult.save();

    res.status(201).json({ 
      message: 'Exam result uploaded',
      examResultId: examResult._id 
    });
  } catch (err) {
    console.error('Upload ExamResult Error:', err)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
