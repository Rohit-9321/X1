const Company = require('../models/Company.model');
const Topic = require('../models/Topic.model');
const Question = require('../models/Question.model');
const CodingProblem = require('../models/CodingProblem.model');
const MockTest = require('../models/MockTest.model');
const UserProgress = require('../models/UserProgress.model');

exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ isActive: true }).sort({ isFeatured: -1, totalStudents: -1 });
    res.json({ success: true, data: companies });
  } catch (err) { next(err); }
};

exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const [topics, questionCount, codingCount, testCount] = await Promise.all([
      Topic.find({ company: company._id, isActive: true }).sort({ order: 1 }),
      Question.countDocuments({ company: company._id, isActive: true }),
      CodingProblem.countDocuments({ company: company._id, isActive: true }),
      MockTest.countDocuments({ company: company._id, isActive: true }),
    ]);

    let progress = null;
    if (req.user) {
      const progressDocs = await UserProgress.find({ user: req.user._id, company: company._id });
      const totalQ = questionCount || 1;
      const solvedQ = progressDocs.reduce((sum, p) => sum + p.questionsCorrect, 0);
      progress = { percentage: Math.round((solvedQ / totalQ) * 100), topicProgress: progressDocs };
    }

    res.json({ success: true, data: { company, topics, stats: { questionCount, codingCount, testCount }, progress } });
  } catch (err) { next(err); }
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create({ ...req.body, createdBy: req.user._id });
    // Create default topics
    const defaultTopics = [
      { name: 'Percentages', category: 'aptitude', order: 1 },
      { name: 'Profit and Loss', category: 'aptitude', order: 2 },
      { name: 'Time and Work', category: 'aptitude', order: 3 },
      { name: 'Probability', category: 'aptitude', order: 4 },
      { name: 'Seating Arrangement', category: 'reasoning', order: 1 },
      { name: 'Blood Relations', category: 'reasoning', order: 2 },
      { name: 'Grammar', category: 'english', order: 1 },
      { name: 'Vocabulary', category: 'english', order: 2 },
      { name: 'Arrays', category: 'coding', order: 1 },
      { name: 'Strings', category: 'coding', order: 2 },
      { name: 'HR Questions', category: 'interview', order: 1 },
    ];
    await Topic.insertMany(defaultTopics.map(t => ({ ...t, company: company._id })));
    res.status(201).json({ success: true, data: company });
  } catch (err) { next(err); }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (err) { next(err); }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    await Company.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Company deactivated' });
  } catch (err) { next(err); }
};
