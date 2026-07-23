const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Passport config
require('./config/passport');

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Tighter limiter for auth endpoints (login/signup/forgot-password) — these
// are the routes credential-stuffing and brute-force scripts actually target,
// so the generic 200-req/15min budget above is far too loose for them.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// ── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({
  limit: '10mb',
  // Razorpay signs the exact raw bytes of the webhook payload. Re-serializing
  // req.body with JSON.stringify() later isn't guaranteed to match that byte
  // sequence (key order/whitespace can differ), which caused signature
  // verification to fail unpredictably. Stash the raw buffer here so the
  // webhook handler can HMAC the exact bytes Razorpay sent.
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Passport ─────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/companies',     require('./routes/company.routes'));
app.use('/api/topics',        require('./routes/topic.routes'));
app.use('/api/notes',         require('./routes/note.routes'));
app.use('/api/questions',     require('./routes/question.routes'));
app.use('/api/coding',        require('./routes/coding.routes'));
app.use('/api/tests',         require('./routes/test.routes'));
app.use('/api/subscriptions', require('./routes/subscription.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/analytics',     require('./routes/analytics.routes'));
app.use('/api/leaderboard',   require('./routes/leaderboard.routes'));
app.use('/api/ai',            require('./routes/ai.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));

// ── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global Error Handler ─────────────────────────────────────────────────
app.use(require('./middleware/error.middleware'));

// ── DB + Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ DB Error:', err); process.exit(1); });

module.exports = app;
