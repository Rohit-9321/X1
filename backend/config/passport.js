const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User.model');

// ── JWT Strategy ─────────────────────────────────────────────────────────
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password');
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) { return done(err, false); }
}));

// ── Google Strategy ───────────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.isEmailVerified = true;
        await user.save();
      } else {
        user = await User.create({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          role: 'student',
        });
      }
    }
    return done(null, user);
  } catch (err) { return done(err, false); }
}));

// ── GitHub Strategy ───────────────────────────────────────────────────────
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.githubId = profile.id;
        await user.save();
      } else {
        user = await User.create({
          fullName: profile.displayName || profile.username,
          email,
          githubId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          role: 'student',
        });
      }
    }
    return done(null, user);
  } catch (err) { return done(err, false); }
}));
