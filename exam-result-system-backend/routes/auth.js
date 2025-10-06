const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

// Allowed roles
const allowedRoles = ['student', 'verifier'];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: User role (student, verifier)
 *                 example: student
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Bad request (e.g. invalid role or missing fields)
 */
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // Registration disabled by default; enable temporarily with ALLOW_REGISTER=true
    if (process.env.ALLOW_REGISTER !== 'true') {
      return res.status(403).json({ message: 'Registration disabled' });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users(name,email,password,role,is_approved) VALUES($1,$2,$3,$4,$5) RETURNING id, role`,
      [name, email, hashed, role || 'student', false]
    );
    const user = { _id: result.rows[0].id, role: result.rows[0].role };

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'User registered, pending approval',
      token,
      role: user.role,
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, return token, user role, and user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 role:
 *                   type: string
 *                   example: student
 *                 _id:
 *                   type: string
 *                   example: 689786f646807b771f52a9cc
 *       401:
 *         description: Unauthorized (invalid credentials or user not approved for non-admins)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const dbRes = await query('SELECT id, email, password, role, is_approved FROM users WHERE email=$1', [email]);
    if (dbRes.rowCount === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = dbRes.rows[0];

    // Only non-admin users must be approved
    if (user.role !== 'admin' && !user.is_approved)
      return res.status(401).json({ message: 'User not approved yet' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      role: user.role,
      _id: user.id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/approve/{id}:
 *   patch:
 *     summary: Approve a user (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User approved successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch('/approve/:id', auth, adminOnly, async (req, res) => {
  try {
    const result = await query('UPDATE users SET is_approved=true WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/unapproved (admin only)
router.get('/unapproved', auth, adminOnly, async (req, res) => {
  try {
    const users = await query(
      'SELECT id as "_id", name, email, role, is_approved as "isApproved", created_at as "createdAt" FROM users WHERE is_approved=false ORDER BY created_at DESC'
    );
    res.json(users.rows);
  } catch (err) {
    console.error('Fetch unapproved users error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;