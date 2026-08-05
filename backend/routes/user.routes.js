const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Bookmark = require('../models/Bookmark.model');

router.get('/profile', protect, async (req,res,next) => {
  try { res.json({ success:true, data: req.user }); } catch(e){next(e);}
});
router.put('/profile', protect, async (req,res,next) => {
  try {
    const allowed = ['fullName','phone','avatar'];
    const updates = {};
    allowed.forEach(f => { if(req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, {new:true}).select('-password');
    res.json({ success:true, data: user });
  } catch(e){next(e);}
});
router.get('/bookmarks', protect, async (req,res,next) => {
  try {
    const bookmarks = await Bookmark.find({user:req.user._id}).populate('itemId');
    res.json({ success:true, data: bookmarks });
  } catch(e){next(e);}
});
router.post('/bookmarks', protect, async (req,res,next) => {
  try {
    const { type, itemId, itemModel } = req.body;
    const bm = await Bookmark.findOneAndUpdate({user:req.user._id, type, itemId}, {user:req.user._id,type,itemId,itemModel}, {upsert:true,new:true});
    res.json({ success:true, data: bm });
  } catch(e){next(e);}
});
router.delete('/bookmarks/:id', protect, async (req,res,next) => {
  try {
    await Bookmark.findOneAndDelete({_id:req.params.id, user:req.user._id});
    res.json({ success:true, message:'Bookmark removed' });
  } catch(e){next(e);}
});
// Admin: list users
router.get('/', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try {
    const { page=1, limit=20, search } = req.query;
    const filter = { role:'student' };
    if(search) filter.$or = [{fullName:{$regex:search,$options:'i'}},{email:{$regex:search,$options:'i'}}];
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip((page-1)*limit).limit(+limit).sort('-createdAt'),
      User.countDocuments(filter),
    ]);
    res.json({ success:true, data:users, pagination:{page:+page,limit:+limit,total} });
  } catch(e){next(e);}
});
module.exports = router;
