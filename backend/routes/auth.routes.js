const router = require('express').Router();
const passport = require('passport');
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/signup',           ctrl.signup);
router.post('/login',            ctrl.login);
router.post('/refresh',          ctrl.refreshToken);
router.get('/me',      protect,  ctrl.getMe);
router.post('/logout', protect,  ctrl.logout);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/forgot-password',  ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);
router.put('/change-password', protect, ctrl.changePassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }), ctrl.oauthCallback);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }), ctrl.oauthCallback);

module.exports = router;
