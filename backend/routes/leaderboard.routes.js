const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

router.get('/', protect, async (req,res,next) => {
  try {
    const {period='weekly'} = req.query;
    let dateFilter = {};
    if(period==='daily') dateFilter = {lastActiveDate:{$gte:new Date(Date.now()-86400000)}};
    else if(period==='weekly') dateFilter = {lastActiveDate:{$gte:new Date(Date.now()-7*86400000)}};
    else if(period==='monthly') dateFilter = {lastActiveDate:{$gte:new Date(Date.now()-30*86400000)}};

    const users = await User.find({role:'student', isActive:true, ...dateFilter})
      .select('fullName avatar xp level streak placementScore stats')
      .sort('-xp').limit(50);

    const myRank = await User.countDocuments({role:'student',xp:{$gt:req.user.xp}}) + 1;
    res.json({success:true,data:users,myRank});
  } catch(e){next(e);}
});
module.exports = router;
