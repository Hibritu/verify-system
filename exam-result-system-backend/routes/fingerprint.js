const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Fingerprint = require('../models/Fingerprint');
const Certificate = require('../models/Certificate');
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

    // Prevent duplicate enrollments for same user and fingerprint data
    const exists = await Fingerprint.findOne({ userId, data });
    if (exists) {
      return res.status(409).json({ message: 'Fingerprint already enrolled' });
    }

    // Save fingerprint data linked to the user
    const fp = new Fingerprint({ userId, data });
    await fp.save();

    res
      .status(201)
      .json({ message: 'Fingerprint enrolled', fingerprintId: fp._id });
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

    // Find a fingerprint by userId and data
    const fingerprint = await Fingerprint.findOne({ userId, data });

    const isMatch = !!fingerprint;

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
