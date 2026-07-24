const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:    { type: String, required: true },
  options:     [{ type: String, required: true }],    // exactly 4
  correctIndex:{ type: Number, required: true },       // 0-3
  explanation: { type: String },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  topic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  category:    { type: String, enum: ['aptitude', 'reasoning', 'english', 'interview'], required: true },
  tags:        [String],
  isPYQ:       { type: Boolean, default: false },      // previous year question
  year:        Number,
  attemptCount:{ type: Number, default: 0 },
  correctCount:{ type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
