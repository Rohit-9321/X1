const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName:        { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  phone:           { type: String, trim: true },
  password:        { type: String, minlength: 6 },
  role:            { type: String, enum: ['student', 'admin', 'superadmin'], default: 'student' },
  avatar:          { type: String },

  // OAuth
  googleId:        { type: String },
  githubId:        { type: String },

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken:{ type: String },
  emailVerifyExpire:{ type: Date },

  // Password reset
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },

  // Subscription
  subscription: {
    plan:        { type: String, enum: ['free', 'single', 'bundle', 'premium'], default: 'free' },
    companies:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
    expiresAt:   { type: Date },
    razorpaySubscriptionId: String,
  },

  // Gamification
  xp:     { type: Number, default: 0 },
  level:  { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

  // Stats
  stats: {
    questionsAttempted: { type: Number, default: 0 },
    questionsSolved:    { type: Number, default: 0 },
    codingAttempted:    { type: Number, default: 0 },
    codingSolved:       { type: Number, default: 0 },
    testsAttempted:     { type: Number, default: 0 },
    totalScore:         { type: Number, default: 0 },
  },

  placementScore: { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (typeof this.password !== 'string' || !this.password.trim()) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.hasAccessToCompany = function (companyId) {
  if (this.subscription.plan === 'premium') return true;
  if (this.subscription.expiresAt && this.subscription.expiresAt < new Date()) return false;
  return this.subscription.companies.some(c => c.toString() === companyId.toString());
};

module.exports = mongoose.model('User', userSchema);
