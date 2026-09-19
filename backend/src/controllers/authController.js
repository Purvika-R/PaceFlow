const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, role: user.role, theme: user.theme, remindersEnabled: user.remindersEnabled, avatarUrl: user.avatarUrl, createdAt: user.createdAt });
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

exports.updateSettings = async (req, res, next) => {
  try {
    const { theme, remindersEnabled } = req.body;
    const updates = {};
    if (theme !== undefined) updates.theme = theme;
    if (remindersEnabled !== undefined) updates.remindersEnabled = remindersEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: publicUser(user) });
  } catch (error) { next(error); }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'Avatar data is required.' });
    }

    // Validate it's a data URL
    if (!avatarUrl.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Avatar must be a valid image data URL.' });
    }

    // Check size (base64 is roughly 4/3 the size of the original)
    // 2MB limit = ~2.67MB base64
    const MAX_SIZE = 2 * 1024 * 1024 * (4 / 3);
    if (avatarUrl.length > MAX_SIZE) {
      return res.status(400).json({ success: false, message: 'Avatar image must be under 2MB.' });
    }

    // Validate MIME type from data URL
    const mimeMatch = avatarUrl.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/);
    if (!mimeMatch) {
      return res.status(400).json({ success: false, message: 'Avatar must be a JPEG, PNG, GIF, or WebP image.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    next(error);
  }
};
