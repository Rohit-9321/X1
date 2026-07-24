const router = require('express').Router();
const ctrl = require('../controllers/coding.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// NOTE: the list endpoint only returns metadata (title/slug/difficulty/tags/
// counts) — no problem statement or test cases — so it's intentionally left
// open to browse. The paywall guard lives in ctrl.getProblem (single-problem
// detail), ctrl.runCode and ctrl.submitCode, where real content is exposed.
router.get('/',                protect, ctrl.getProblems);
router.get('/:slug',           protect, ctrl.getProblem);
router.post('/run',            protect, ctrl.runCode);
router.post('/submit',         protect, ctrl.submitCode);
router.get('/:problemId/submissions', protect, ctrl.getUserSubmissions);
router.post('/',               protect, authorize('admin','superadmin'), ctrl.createProblem);
router.put('/:id',             protect, authorize('admin','superadmin'), ctrl.updateProblem);
module.exports = router;
