const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Note = require('../models/Note.model');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits:{fileSize:50*1024*1024} });

router.get('/', protect, async (req,res,next) => {
  try {
    const {company,topic} = req.query;
    const filter = {isActive:true};
    if(company) filter.company = company;
    if(topic) filter.topic = topic;
    const notes = await Note.find(filter).populate('topic','name').sort('order');
    res.json({ success:true, data:notes });
  } catch(e){next(e);}
});

router.post('/', protect, authorize('admin','superadmin'), upload.single('file'), async (req,res,next) => {
  try {
    let fileUrl, fileSize;
    if(req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, { folder:'x1/notes', resource_type:'auto' });
      fileUrl = result.secure_url;
      fileSize = req.file.size;
    }
    const note = await Note.create({...req.body, fileUrl, fileSize, createdBy:req.user._id});
    res.status(201).json({ success:true, data:note });
  } catch(e){next(e);}
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try {
    await Note.findByIdAndUpdate(req.params.id, {isActive:false});
    res.json({ success:true, message:'Note deleted' });
  } catch(e){next(e);}
});
module.exports = router;
