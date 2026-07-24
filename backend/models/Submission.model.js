const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
  code:    { type: String, required: true },
  language:{ type: String, required: true },
  status:  { type: String, enum: ['pending', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error'], default: 'pending' },
  runtime:     Number,   // ms
  memory:      Number,   // KB
  testsPassed: Number,
  testsTotal:  Number,
  error:       String,
  judge0Token: String,
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
