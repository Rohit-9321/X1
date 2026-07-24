const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test:    { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  answers: [{
    question:    { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selected:    Number,    // index chosen
    isCorrect:   Boolean,
    timeTaken:   Number,    // seconds
  }],
  score:       { type: Number, default: 0 },
  totalMarks:  { type: Number, default: 0 },
  percentage:  { type: Number, default: 0 },
  timeTaken:   Number,    // total seconds
  rank:        Number,
  analysis: {
    correct:     Number,
    wrong:       Number,
    skipped:     Number,
    topicWise:   mongoose.Schema.Types.Mixed,
  },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
