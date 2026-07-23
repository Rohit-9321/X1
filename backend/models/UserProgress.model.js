const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  topic:   { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  category: String,
  questionsAttempted: { type: Number, default: 0 },
  questionsCorrect:   { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  lastPracticed: Date,
}, { timestamps: true });

userProgressSchema.index({ user: 1, company: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
