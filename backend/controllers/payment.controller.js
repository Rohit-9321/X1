const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const Company = require('../models/Company.model');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_PRICES = { single: null /* dynamic */, bundle: 99900, premium: 199900 }; // in paise

exports.createOrder = async (req, res, next) => {
  try {
    const { plan, companies = [] } = req.body;

    let amount;
    let companyDocs = [];
    if (plan === 'single') {
      companyDocs = await Company.find({ _id: { $in: companies } });
      amount = companyDocs.reduce((sum, c) => sum + (c.price * 100), 0);
    } else if (plan === 'bundle') {
      amount = PLAN_PRICES.bundle;
      companyDocs = await Company.find({ _id: { $in: companies } });
    } else if (plan === 'premium') {
      amount = PLAN_PRICES.premium;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `x1_${Date.now()}` });

    const payment = await Payment.create({
      user: req.user._id, orderId: order.id, plan, companies: companyDocs.map(c => c._id), amount,
    });

    res.json({
      success: true,
      data: {
        orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID,
        user: { name: req.user.fullName, email: req.user.email },
      },
    });
  } catch (err) { next(err); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (sign !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Payment verification failed' });

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ success: false, message: 'Order not found' });

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'paid';
    payment.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await payment.save();

    // Update user subscription
    const user = await User.findById(payment.user);
    user.subscription.plan = payment.plan;
    user.subscription.expiresAt = payment.validUntil;
    if (payment.plan === 'premium') {
      user.subscription.companies = [];  // all access
    } else {
      const existing = new Set(user.subscription.companies.map(c => c.toString()));
      payment.companies.forEach(c => existing.add(c.toString()));
      user.subscription.companies = [...existing];
    }
    await user.save();

    res.json({ success: true, message: 'Payment verified', data: { subscription: user.subscription } });
  } catch (err) { next(err); }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id, status: 'paid' })
      .populate('companies', 'name logo').sort('-createdAt');
    res.json({ success: true, data: payments });
  } catch (err) { next(err); }
};

exports.webhookHandler = async (req, res, next) => {
  try {
    if (!req.rawBody) {
      // Should never happen if express.json()'s verify hook ran, but fail
      // safe rather than falling back to a re-serialized (unreliable) body.
      return res.status(400).json({ success: false, message: 'Missing raw body for signature verification' });
    }

    const sign = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody).digest('hex');
    if (sign !== req.headers['x-razorpay-signature'])
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;

    // Keep our Payment record in sync even if the client never called
    // /verify (e.g. user closed the tab after paying) — the webhook is the
    // source of truth Razorpay guarantees will fire.
    if (event === 'payment.captured' && paymentEntity?.order_id) {
      const payment = await Payment.findOne({ orderId: paymentEntity.order_id });
      if (payment && payment.status !== 'paid') {
        payment.paymentId = paymentEntity.id;
        payment.status = 'paid';
        payment.validUntil = payment.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await payment.save();

        const user = await User.findById(payment.user);
        if (user) {
          user.subscription.plan = payment.plan;
          user.subscription.expiresAt = payment.validUntil;
          if (payment.plan === 'premium') {
            user.subscription.companies = [];
          } else {
            const existing = new Set(user.subscription.companies.map(c => c.toString()));
            payment.companies.forEach(c => existing.add(c.toString()));
            user.subscription.companies = [...existing];
          }
          await user.save();
        }
      }
    } else if (event === 'payment.failed' && paymentEntity?.order_id) {
      await Payment.findOneAndUpdate({ orderId: paymentEntity.order_id }, { status: 'failed' });
    }

    res.json({ received: true });
  } catch (err) { next(err); }
};
