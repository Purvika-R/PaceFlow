const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, description: { type: String, trim: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, dueDate: Date,
  aiGenerated: { type: Boolean, default: false }, aiGenerationId: { type: String, trim: true }, aiGenerationGoal: { type: String, trim: true },
}, { timestamps: true });
taskSchema.index({ project: 1, aiGenerationId: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('Task', taskSchema);
