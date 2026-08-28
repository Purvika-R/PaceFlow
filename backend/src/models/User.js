const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ['developer', 'manager'], default: 'developer' },
}, { timestamps: true, toJSON: { transform: (doc, ret) => { delete ret.passwordHash; return ret; } } }));
