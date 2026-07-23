const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: String, required: true },   // "YYYY-MM-DD"
  questionsAttempted: { type: Number, default: 0 },
  codingSolved:       { type: Number, default: 0 },
  testsAttempted:     { type: Number, default: 0 },
  notesRead:          { type: Number, default: 0 },
  xpEarned:           { type: Number, default: 0 },
  studyMinutes:       { type: Number, default: 0 },
}, { timestamps: true });

dailyActivitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyActivity', dailyActivitySchema);
