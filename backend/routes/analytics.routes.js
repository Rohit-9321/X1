const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/me',     protect, ctrl.getMyAnalytics);
router.get('/admin',  protect, authorize('admin','superadmin'), ctrl.getAdminAnalytics);
module.exports = router;
