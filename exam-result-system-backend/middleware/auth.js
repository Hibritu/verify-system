const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  let token = req.header('Authorization');
  if (!token && req.query && req.query.token) token = req.query.token;
  if (token && token.startsWith('Bearer ')) token = token.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // {id, role}
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}

module.exports = { auth, adminOnly };
