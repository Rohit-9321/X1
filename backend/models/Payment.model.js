const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId:   { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },
  plan:      { type: String, enum: ['single', 'bundle', 'premium'], required: true },
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  amount:    { type: Number, required: true },   // in paise
  currency:  { type: String, default: 'INR' },
  status:    { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  validUntil:{ type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
