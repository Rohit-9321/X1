const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Payment = require('../models/Payment.model');
const Company = require('../models/Company.model');

router.use(protect, authorize('admin','superadmin'));

router.get('/stats', async (req,res,next) => {
  try {
    const [totalUsers, premiumUsers, totalCompanies, revenueData] = await Promise.all([
      User.countDocuments({role:'student'}),
      User.countDocuments({'subscription.plan':{$ne:'free'}}),
      Company.countDocuments({isActive:true}),
      Payment.aggregate([{$match:{status:'paid'}},{$group:{_id:null,total:{$sum:'$amount'},count:{$sum:1}}}]),
    ]);
    res.json({success:true,data:{totalUsers,premiumUsers,totalCompanies,totalRevenue:revenueData[0]?.total||0,totalOrders:revenueData[0]?.count||0}});
  } catch(e){next(e);}
});

router.get('/users', async (req,res,next) => {
  try {
    const {page=1,limit=20,search,role='student'} = req.query;
    const filter={role};
    if(search) filter.$or=[{fullName:{$regex:search,$options:'i'}},{email:{$regex:search,$options:'i'}}];
    const [users,total] = await Promise.all([
      User.find(filter).select('-password').skip((page-1)*limit).limit(+limit).sort('-createdAt'),
      User.countDocuments(filter),
    ]);
    res.json({success:true,data:users,pagination:{page:+page,limit:+limit,total}});
  } catch(e){next(e);}
});

router.put('/users/:id/toggle', async (req,res,next) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({success:false,message:'User not found'});
    user.isActive = !user.isActive;
    await user.save();
    res.json({success:true,data:user});
  } catch(e){next(e);}
});

router.get('/payments', async (req,res,next) => {
  try {
    const payments = await Payment.find({status:'paid'}).populate('user','fullName email').populate('companies','name').sort('-createdAt').limit(100);
    res.json({success:true,data:payments});
  } catch(e){next(e);}
});

// Only superadmin can create admins
router.post('/create-admin', authorize('superadmin'), async (req,res,next) => {
  try {
    const {fullName,email,password} = req.body;
    if(await User.findOne({email})) return res.status(400).json({success:false,message:'Email already exists'});
    const admin = await User.create({fullName,email,password,role:'admin',isEmailVerified:true});
    res.status(201).json({success:true,data:{_id:admin._id,fullName:admin.fullName,email:admin.email,role:admin.role}});
  } catch(e){next(e);}
});

module.exports = router;
