const router = require('express').Router();
const ctrl = require('../controllers/company.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/',           optionalAuth, ctrl.getAllCompanies);
router.get('/:slug',      optionalAuth, ctrl.getCompany);
router.post('/',          protect, authorize('admin','superadmin'), ctrl.createCompany);
router.put('/:id',        protect, authorize('admin','superadmin'), ctrl.updateCompany);
router.delete('/:id',     protect, authorize('admin','superadmin'), ctrl.deleteCompany);
module.exports = router;
