const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7);
  if (!token) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication is required.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Your session is invalid or has expired.' });
  }
};
