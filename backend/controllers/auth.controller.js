const crypto = require('crypto');
const User = require('../models/User.model');
const { sendTokenResponse } = require('../utils/jwt.util');
const { sendEmail, emailTemplates } = require('../utils/email.util');

// ── Signup ─────────────────────────────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      fullName, email, phone, password, role: 'student',
      emailVerifyToken,
      emailVerifyExpire: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerifyToken}`;
    try { await sendEmail({ to: email, subject: 'Verify your X1 account', html: emailTemplates.verify(fullName, verifyUrl) }); }
    catch (e) { console.error('Email error:', e.message); }

    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

// ── Login ──────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!await user.matchPassword(password)) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// ── Verify Email ───────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      emailVerifyToken: req.params.token,
      emailVerifyExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();
    try { await sendEmail({ to: user.email, subject: 'Welcome to X1!', html: emailTemplates.welcome(user.fullName) }); }
    catch (e) {}
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

// ── Forgot Password ────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = token;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: user.email, subject: 'Reset your X1 password', html: emailTemplates.resetPassword(user.fullName, url) });
    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (err) { next(err); }
};

// ── Reset Password ─────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// ── Change Password ────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!await user.matchPassword(req.body.currentPassword))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

// ── Get Me ─────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => res.json({ success: true, user: req.user });

// ── Logout ─────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

// ── Refresh Token ───────────────────────────────────────────────────────────
// The access token (JWT_EXPIRE, default 7d) is short-lived by design; the
// refreshToken returned at login/signup lets the client silently get a new
// one without forcing a full re-login once the access token expires.
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'refreshToken is required' });

    const { verifyRefreshToken, generateToken } = require('../utils/jwt.util');
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });

    const token = generateToken(user._id, user.role);
    res.json({ success: true, token });
  } catch (err) { next(err); }
};

// ── OAuth Callback ─────────────────────────────────────────────────────────
exports.oauthCallback = (req, res) => {
  const { generateToken } = require('../utils/jwt.util');
  const token = generateToken(req.user._id, req.user.role);
  res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
};
