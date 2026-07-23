const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: String,
  icon:        String,
  type:        { type: String, enum: ['streak', 'questions', 'coding', 'tests', 'special'] },
  condition: {
    metric:    String,   // e.g. "questionsCorrect", "streak"
    threshold: Number,
  },
  xpReward:  { type: Number, default: 100 },
  color:     String,
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
