const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  category:  { type: String, enum: ['aptitude', 'reasoning', 'english', 'coding', 'interview'], required: true },
  description: String,
  order:     { type: Number, default: 0 },
  icon:      String,
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
