const axios = require('axios');
const CodingProblem = require('../models/CodingProblem.model');
const Submission = require('../models/Submission.model');
const { awardXP } = require('../utils/gamification.util');
const User = require('../models/User.model');
const { checkCompanyAccess } = require('../middleware/subscription.middleware');

const JUDGE0_LANG_IDS = { javascript: 63, python: 71, java: 62, cpp: 54, c: 50 };

const judge0Submit = async (code, languageId, stdin) => {
  const response = await axios.post(`${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
    source_code: code, language_id: languageId, stdin: stdin || '',
  }, {
    headers: { 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY, 'X-RapidAPI-Host': process.env.JUDGE0_API_HOST },
    timeout: 15000,
  });
  return response.data;
};

exports.getProblems = async (req, res, next) => {
  try {
    const { company, difficulty, tags, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (company)    filter.company = company;
    if (difficulty) filter.difficulty = difficulty;
    if (tags)       filter.tags = { $in: tags.split(',') };

    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
      CodingProblem.find(filter).populate('company', 'name slug color').skip(skip).limit(+limit)
        .select('title slug difficulty company tags acceptedCount submissionCount isPremium'),
      CodingProblem.countDocuments(filter),
    ]);

    // Attach acceptance rate
    const data = problems.map(p => ({
      ...p.toObject(),
      acceptanceRate: p.submissionCount ? ((p.acceptedCount / p.submissionCount) * 100).toFixed(1) : '0.0',
    }));

    res.json({ success: true, data, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getProblem = async (req, res, next) => {
  try {
    const problem = await CodingProblem.findOne({ slug: req.params.slug, isActive: true }).populate('company', 'name color');
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    if (!checkCompanyAccess(req.user, problem.company?._id || problem.company)) {
      return res.status(403).json({ success: false, message: 'Please purchase this company pack to access this problem.', code: 'ACCESS_DENIED' });
    }
    // Hide hidden test cases
    const data = problem.toObject();
    data.testCases = data.testCases.filter(tc => !tc.isHidden);
    data.solution = undefined;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.runCode = async (req, res, next) => {
  try {
    const { code, language, input, problemId } = req.body;
    const langId = JUDGE0_LANG_IDS[language];
    if (!langId) return res.status(400).json({ success: false, message: 'Unsupported language' });

    // Every "run" is tied to a coding problem — this both prevents free-riding
    // on locked (premium/company) problems and stops the endpoint being used
    // as an open, unmetered code-execution proxy against the paid Judge0 quota.
    if (!problemId) return res.status(400).json({ success: false, message: 'problemId is required' });
    const problem = await CodingProblem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    if (!checkCompanyAccess(req.user, problem.company)) {
      return res.status(403).json({ success: false, message: 'Please purchase this company pack to access this problem.', code: 'ACCESS_DENIED' });
    }

    const result = await judge0Submit(code, langId, input);

    res.json({
      success: true,
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status?.description,
        time: result.time,
        memory: result.memory,
        compile_output: result.compile_output,
      },
    });
  } catch (err) { next(err); }
};

exports.submitCode = async (req, res, next) => {
  try {
    const { code, language, problemId } = req.body;
    const problem = await CodingProblem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    if (!checkCompanyAccess(req.user, problem.company)) {
      return res.status(403).json({ success: false, message: 'Please purchase this company pack to access this problem.', code: 'ACCESS_DENIED' });
    }

    const langId = JUDGE0_LANG_IDS[language];
    if (!langId) return res.status(400).json({ success: false, message: 'Unsupported language' });

    const submission = await Submission.create({ user: req.user._id, problem: problemId, code, language, status: 'pending' });

    const testCases = problem.testCases;
    let passed = 0;
    let finalStatus = 'accepted';
    let runtime = 0, memory = 0;

    for (const tc of testCases) {
      const result = await judge0Submit(code, langId, tc.input);
      runtime = Math.max(runtime, parseFloat(result.time || 0) * 1000);
      memory  = Math.max(memory, result.memory || 0);

      const output = (result.stdout || '').trim();
      const expected = tc.expectedOutput.trim();

      if (result.status?.id === 3 && output === expected) {
        passed++;
      } else if (result.status?.id === 6) {
        finalStatus = 'compile_error';
        submission.error = result.compile_output;
        break;
      } else if (result.status?.id === 5) {
        finalStatus = 'time_limit';
        break;
      } else if (result.status?.id >= 7) {
        finalStatus = 'runtime_error';
        submission.error = result.stderr;
        break;
      } else {
        finalStatus = 'wrong_answer';
      }
    }

    if (passed < testCases.length && finalStatus === 'accepted') finalStatus = 'wrong_answer';

    submission.status = finalStatus;
    submission.testsPassed = passed;
    submission.testsTotal  = testCases.length;
    submission.runtime = runtime;
    submission.memory  = memory;
    await submission.save();

    // Update problem stats
    problem.submissionCount += 1;
    if (finalStatus === 'accepted') problem.acceptedCount += 1;
    await problem.save();

    // Award XP
    let xpResult;
    if (finalStatus === 'accepted') {
      xpResult = await awardXP(req.user._id, 'codingAccepted');
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.codingSolved': 1, 'stats.codingAttempted': 1 } });
    } else {
      await awardXP(req.user._id, 'codingAttempt');
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.codingAttempted': 1 } });
    }

    res.json({ success: true, data: { status: finalStatus, testsPassed: passed, testsTotal: testCases.length, runtime, memory, xp: xpResult } });
  } catch (err) { next(err); }
};

exports.createProblem = async (req, res, next) => {
  try {
    const problem = await CodingProblem.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: problem });
  } catch (err) { next(err); }
};

exports.updateProblem = async (req, res, next) => {
  try {
    const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, data: problem });
  } catch (err) { next(err); }
};

exports.getUserSubmissions = async (req, res, next) => {
  try {
    const subs = await Submission.find({ user: req.user._id, problem: req.params.problemId }).sort('-createdAt').limit(10);
    res.json({ success: true, data: subs });
  } catch (err) { next(err); }
};
