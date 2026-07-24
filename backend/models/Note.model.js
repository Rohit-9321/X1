const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  company:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  topic:    { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  type:     { type: String, enum: ['pdf', 'image', 'video', 'youtube', 'text'], required: true },
  content:  String,           // text content or YouTube URL
  fileUrl:  String,           // Cloudinary URL
  fileSize: Number,
  duration: Number,           // video duration in seconds
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
