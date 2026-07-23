const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['question', 'coding', 'note'], required: true },
  itemId:  { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' },
  itemModel: { type: String, enum: ['Question', 'CodingProblem', 'Note'] },
}, { timestamps: true });

bookmarkSchema.index({ user: 1, type: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
