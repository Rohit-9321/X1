const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create-order',  protect, ctrl.createOrder);
router.post('/verify',        protect, ctrl.verifyPayment);
router.get('/my-payments',    protect, ctrl.getMyPayments);
router.post('/webhook',       ctrl.webhookHandler);
module.exports = router;
