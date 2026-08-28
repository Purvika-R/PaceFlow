const mongoose = require('mongoose');
module.exports = mongoose.model('Project', new mongoose.Schema({
  name: { type: String, required: true, trim: true }, description: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
}, { timestamps: true }));
