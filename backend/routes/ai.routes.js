const router = require('express').Router();
const ctrl = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/doubt',       protect, ctrl.askDoubt);
router.post('/study-plan',  protect, ctrl.generateStudyPlan);
module.exports = router;
