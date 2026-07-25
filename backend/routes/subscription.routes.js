const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

router.get('/my', protect, async (req,res,next) => {
  try {
    const user = await User.findById(req.user._id).populate('subscription.companies','name logo color');
    res.json({success:true,data:user.subscription});
  } catch(e){next(e);}
});
module.exports = router;
