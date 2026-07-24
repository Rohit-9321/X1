const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input:          { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden:       { type: Boolean, default: false },
  explanation:    String,
});

const codingProblemSchema = new mongoose.Schema({
  title:       { type: String, required: true, unique: true },
  slug:        { type: String, unique: true },
  description: { type: String, required: true },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  company:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  topic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  tags:        [String],
  constraints: String,
  hints:       [String],
  examples: [{
    input:       String,
    output:      String,
    explanation: String,
  }],
  testCases:   [testCaseSchema],
  starterCode: {
    javascript: String,
    python:     String,
    java:       String,
    cpp:        String,
    c:          String,
  },
  solution: {
    javascript: String,
    python:     String,
  },
  timeLimit:   { type: Number, default: 2 },    // seconds
  memoryLimit: { type: Number, default: 256 },  // MB
  acceptedCount:  { type: Number, default: 0 },
  submissionCount:{ type: Number, default: 0 },
  isPremium:   { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

codingProblemSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

codingProblemSchema.virtual('acceptanceRate').get(function () {
  if (!this.submissionCount) return 0;
  return ((this.acceptedCount / this.submissionCount) * 100).toFixed(1);
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
