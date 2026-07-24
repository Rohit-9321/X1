const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const MockTest = require('../models/MockTest.model');
const TestResult = require('../models/TestResult.model');
const Question = require('../models/Question.model');
const { awardXP } = require('../utils/gamification.util');
const User = require('../models/User.model');
const { checkCompanyAccess } = require('../middleware/subscription.middleware');

// NOTE: list endpoint strips questions/codingProblems (metadata only), so it's
// intentionally left open to browse. Real content is gated in the detail and
// submit routes below via checkCompanyAccess.
router.get('/', protect, async (req,res,next) => {
  try {
    const {company} = req.query;
    const filter = {isActive:true};
    if(company) filter.company = company;
    const tests = await MockTest.find(filter).populate('company','name color').select('-questions -codingProblems');
    res.json({success:true,data:tests});
  } catch(e){next(e);}
});

router.get('/:id', protect, async (req,res,next) => {
  try {
    const test = await MockTest.findById(req.params.id).populate({path:'questions',select:'-correctIndex'}).populate('company','name');
    if(!test) return res.status(404).json({success:false,message:'Test not found'});
    if(!checkCompanyAccess(req.user, test.company?._id || test.company)) {
      return res.status(403).json({success:false,message:'Please purchase this company pack to access this test.',code:'ACCESS_DENIED'});
    }
    res.json({success:true,data:test});
  } catch(e){next(e);}
});

router.post('/:id/submit', protect, async (req,res,next) => {
  try {
    const test = await MockTest.findById(req.params.id).populate('questions');
    if(!test) return res.status(404).json({success:false,message:'Test not found'});
    if(!checkCompanyAccess(req.user, test.company)) {
      return res.status(403).json({success:false,message:'Please purchase this company pack to access this test.',code:'ACCESS_DENIED'});
    }
    const {answers, timeTaken} = req.body;

    let score=0, correct=0, wrong=0, skipped=0;
    const topicWise = {};
    const resultAnswers = answers.map(a => {
      const q = test.questions.find(q=>q._id.toString()===a.questionId);
      if(!q) return null;
      const isCorrect = a.selected !== undefined && a.selected === q.correctIndex;
      if(a.selected === undefined || a.selected === null) skipped++;
      else if(isCorrect) { correct++; score++; }
      else wrong++;
      const tKey = q.topic?.toString() || 'general';
      if(!topicWise[tKey]) topicWise[tKey]={correct:0,wrong:0};
      if(isCorrect) topicWise[tKey].correct++; else topicWise[tKey].wrong++;
      return {question:q._id, selected:a.selected, isCorrect, timeTaken:a.timeTaken};
    }).filter(Boolean);

    const pct = Math.round((score/(test.questions.length||1))*100);
    const result = await TestResult.create({user:req.user._id,test:test._id,answers:resultAnswers,score,totalMarks:test.questions.length,percentage:pct,timeTaken,analysis:{correct,wrong,skipped,topicWise}});
    await MockTest.findByIdAndUpdate(test._id, {$inc:{attemptCount:1}});
    const xpResult = await awardXP(req.user._id,'testCompleted');
    await User.findByIdAndUpdate(req.user._id,{$inc:{'stats.testsAttempted':1,'stats.totalScore':pct}});
    res.json({success:true,data:{result,xp:xpResult}});
  } catch(e){next(e);}
});

router.post('/', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try {
    const test = await MockTest.create({...req.body,createdBy:req.user._id});
    res.status(201).json({success:true,data:test});
  } catch(e){next(e);}
});
router.put('/:id', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try {
    const test = await MockTest.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.json({success:true,data:test});
  } catch(e){next(e);}
});
router.delete('/:id', protect, authorize('admin','superadmin'), async (req,res,next) => {
  try { await MockTest.findByIdAndUpdate(req.params.id,{isActive:false}); res.json({success:true}); } catch(e){next(e);}
});
module.exports = router;
