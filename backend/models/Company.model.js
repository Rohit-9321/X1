const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, unique: true },
  logo:        { type: String },
  color:       { type: String, default: '#5B3BF5' },
  description: { type: String },
  website:     { type: String },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  category:    { type: String, enum: ['service', 'product', 'startup'], default: 'service' },
  price:       { type: Number, default: 299 },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  totalStudents: { type: Number, default: 0 },
  selectionRate: { type: Number, default: 0 },
  hiringProcess: { type: String },
  examPattern:   { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

companySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
