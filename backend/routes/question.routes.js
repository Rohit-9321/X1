const router = require('express').Router();
const ctrl = require('../controllers/question.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { requireSubscription } = require('../middleware/subscription.middleware');

router.get('/',             protect, requireSubscription, ctrl.getQuestions);
router.get('/:id',          protect, ctrl.getQuestion);
router.post('/submit',      protect, ctrl.submitAnswer);
router.post('/',            protect, authorize('admin','superadmin'), ctrl.createQuestion);
router.post('/bulk',        protect, authorize('admin','superadmin'), ctrl.bulkCreateQuestions);
router.put('/:id',          protect, authorize('admin','superadmin'), ctrl.updateQuestion);
router.delete('/:id',       protect, authorize('admin','superadmin'), ctrl.deleteQuestion);
module.exports = router;
