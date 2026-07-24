const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Topic = require('../models/Topic.model');

router.get('/', protect, async (req,res,next) => {
  try {
    const topics = await Topic.find({company:req.query.company, isActive:true}).sort('order');
    res.json({ success:true, data:topics });
  } catch(e){next(e);}
});
router.post('/', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try { const t = await Topic.create(req.body); res.status(201).json({success:true,data:t}); } catch(e){next(e);}
});
router.put('/:id', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try { const t = await Topic.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json({success:true,data:t}); } catch(e){next(e);}
});
router.delete('/:id', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try { await Topic.findByIdAndUpdate(req.params.id,{isActive:false}); res.json({success:true}); } catch(e){next(e);}
});
module.exports = router;
