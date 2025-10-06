const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { query } = require('../db');
/**
 * @swagger
 * /api/fingerprint/enroll:
 *   post:
 *     summary: Enroll a fingerprint for a user (admin only)
 *     security:
 *       - bearerAuth: []
 *     tags: [Fingerprint]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - data
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to associate the fingerprint with
 *               data:
 *                 type: string
 *                 description: Fingerprint data (e.g., hash or base64)
 *     responses:
 *       201:
 *         description: Fingerprint enrolled successfully
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/enroll', auth, adminOnly, async (req, res) => {
  try {
    const { userId, data } = req.body;
    if (!userId || !data) {
      return res.status(400).json({ message: 'Missing userId or data' });
    }

    const exists = await query('SELECT 1 FROM fingerprints WHERE user_id=$1 AND data=$2', [userId, data]);
    if (exists.rowCount) {
      return res.status(409).json({ message: 'Fingerprint already enrolled' });
    }

    const fp = await query('INSERT INTO fingerprints(user_id, data) VALUES($1,$2) RETURNING id', [userId, data]);

    res
      .status(201)
      .json({ message: 'Fingerprint enrolled', fingerprintId: fp.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
/**
 * @swagger
 * /api/fingerprint/verify:
 *   post:
 *     summary: Verify if fingerprint data belongs to a specific user
 *     tags: [Fingerprint]
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
 *               - data
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to verify
 *               data:
 *                 type: string
 *                 description: Fingerprint data to check
 *     responses:
 *       200:
 *         description: Match result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 match:
 *                   type: boolean
 */

router.post('/verify', auth, async (req, res) => {
  try {
    const { userId, data } = req.body;
    if (!userId || !data) 
      return res.status(400).json({ message: 'Missing userId or data' });

    const r = await query('SELECT 1 FROM fingerprints WHERE user_id=$1 AND data=$2', [userId, data]);
    const isMatch = r.rowCount > 0;

    res.status(200).json({
      message: isMatch ? 'Fingerprint verified' : 'Fingerprint does not match',
      match: isMatch
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
