const Question = require('../models/Question.model');
const UserProgress = require('../models/UserProgress.model');
const Bookmark = require('../models/Bookmark.model');
const { awardXP } = require('../utils/gamification.util');
const { checkCompanyAccess } = require('../middleware/subscription.middleware');

exports.getQuestions = async (req, res, next) => {
  try {
    const { company, topic, category, difficulty, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (company)    filter.company = company;
    if (topic)      filter.topic = topic;
    if (category)   filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(filter).populate('topic', 'name').skip(skip).limit(+limit).select('-correctIndex'),
      Question.countDocuments(filter),
    ]);

    res.json({ success: true, data: questions, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id).populate('topic company', 'name');
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
    if (!checkCompanyAccess(req.user, q.company?._id || q.company)) {
      return res.status(403).json({ success: false, message: 'Please purchase this company pack to access this content.', code: 'ACCESS_DENIED' });
    }
    // Don't send correctIndex in the response — only send it after submission
    const data = q.toObject();
    delete data.correctIndex;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedIndex } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    if (!checkCompanyAccess(req.user, question.company)) {
      return res.status(403).json({ success: false, message: 'Please purchase this company pack to access this content.', code: 'ACCESS_DENIED' });
    }

    const isCorrect = selectedIndex === question.correctIndex;

    // Update question stats
    question.attemptCount += 1;
    if (isCorrect) question.correctCount += 1;
    await question.save();

    // Update user progress
    await UserProgress.findOneAndUpdate(
      { user: req.user._id, company: question.company, topic: question.topic },
      {
        $inc: { questionsAttempted: 1, questionsCorrect: isCorrect ? 1 : 0 },
        $set: { lastPracticed: new Date(), category: question.category },
      },
      { upsert: true }
    );

    // Award XP
    const xpResult = await awardXP(req.user._id, isCorrect ? 'questionCorrect' : 'questionAttempt');

    res.json({
      success: true,
      data: {
        isCorrect,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        xp: xpResult,
      },
    });
  } catch (err) { next(err); }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: question });
  } catch (err) { next(err); }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: question });
  } catch (err) { next(err); }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) { next(err); }
};

exports.bulkCreateQuestions = async (req, res, next) => {
  try {
    const questions = await Question.insertMany(req.body.questions.map(q => ({ ...q, createdBy: req.user._id })));
    res.status(201).json({ success: true, data: questions, count: questions.length });
  } catch (err) { next(err); }
};
