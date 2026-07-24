const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  company:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  type:       { type: String, enum: ['aptitude', 'english', 'mixed', 'coding', 'full'], required: true },
  duration:   { type: Number, required: true },   // minutes
  questions:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  codingProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem' }],
  totalMarks: { type: Number, default: 0 },
  passingMarks:{ type: Number, default: 0 },
  instructions: String,
  isActive:   { type: Boolean, default: true },
  attemptCount:{ type: Number, default: 0 },
  isPremium:  { type: Boolean, default: false },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
