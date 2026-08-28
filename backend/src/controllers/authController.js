const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
const tokenFor = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ success: true, data: { user: publicUser(user), token: tokenFor(user) } });
  } catch (error) { next(error); }
};
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
    if (!user?.passwordHash || !await bcrypt.compare(req.body.password, user.passwordHash)) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    res.json({ success: true, data: { user: publicUser(user), token: tokenFor(user) } });
  } catch (error) { next(error); }
};
exports.me = (req, res) => res.json({ success: true, data: publicUser(req.user) });
