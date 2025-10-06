const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { query } = require('../db');

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

    const insert = await query(
      'INSERT INTO exam_results(user_id, exam_name, year, scores) VALUES($1,$2,$3,$4) RETURNING id',
      [userId, examName, year, scores]
    );
    res.status(201).json({ message: 'Exam result uploaded', examResultId: insert.rows[0].id });
  } catch (err) {
    console.error('Upload ExamResult Error:', err)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /api/results/recent:
 *   get:
 *     summary: Get recent exam results (admin only)
 *     tags: [Exam Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent exam results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examResults:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       examName:
 *                         type: string
 *                       year:
 *                         type: integer
 *                       scores:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/recent', auth, adminOnly, async (req, res) => {
  try {
    const r = await query(
      'SELECT id as "_id", user_id as "userId", exam_name as "examName", year, scores, created_at as "createdAt" FROM exam_results ORDER BY created_at DESC LIMIT 10'
    );
    res.json({ examResults: r.rows });
  } catch (err) {
    console.error('Get Recent ExamResults Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
