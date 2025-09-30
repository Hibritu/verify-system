const mongoose = require('mongoose');

const ExamResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examName: { type: String, required: true },
  year: { type: Number, required: true },
  scores: { type: Object, required: true }, // Example: {math: 90, physics: 85}
  createdAt: { type: Date, default: Date.now },
});

// Useful index for per-user queries
ExamResultSchema.index({ userId: 1, year: -1, createdAt: -1 });

module.exports = mongoose.model('ExamResult', ExamResultSchema);
