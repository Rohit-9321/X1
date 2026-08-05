const User = require('../models/User.model');
const UserProgress = require('../models/UserProgress.model');
const DailyActivity = require('../models/DailyActivity.model');
const TestResult = require('../models/TestResult.model');
const Submission = require('../models/Submission.model');
const { calculatePlacementScore } = require('../utils/gamification.util');

exports.getMyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [user, progress, activity, tests, submissions] = await Promise.all([
      User.findById(userId),
      UserProgress.find({ user: userId }).populate('company topic', 'name category color'),
      DailyActivity.find({ user: userId, date: { $gte: last30Days.toISOString().split('T')[0] } }).sort('date'),
      TestResult.find({ user: userId }).populate('test', 'title type company').sort('-createdAt').limit(10),
      Submission.find({ user: userId }).sort('-createdAt').limit(20),
    ]);

    // Category-wise accuracy
    const categoryStats = {};
    progress.forEach(p => {
      const cat = p.category || 'other';
      if (!categoryStats[cat]) categoryStats[cat] = { attempted: 0, correct: 0 };
      categoryStats[cat].attempted += p.questionsAttempted;
      categoryStats[cat].correct   += p.questionsCorrect;
    });

    const aptitudeAcc  = acc(categoryStats.aptitude);
    const reasoningAcc = acc(categoryStats.reasoning);
    const englishAcc   = acc(categoryStats.english);
    const codingAcc    = (submissions.filter(s => s.status === 'accepted').length / (submissions.length || 1)) * 100;
    const testAcc      = tests.reduce((sum, t) => sum + t.percentage, 0) / (tests.length || 1);

    const placementScore = calculatePlacementScore({
      aptitudeAcc, codingAcc, commAcc: englishAcc, testAcc, streak: user.streak,
    });

    // Update placement score on user
    await User.findByIdAndUpdate(userId, { placementScore });

    // Weekly activity for chart
    const weeklyActivity = last7Days().map(date => {
      const day = activity.find(a => a.date === date);
      return { date, questionsAttempted: day?.questionsAttempted || 0, codingSolved: day?.codingSolved || 0, xpEarned: day?.xpEarned || 0 };
    });

    // Skill radar
    const skillRadar = [
      { skill: 'Aptitude',  value: Math.round(aptitudeAcc) },
      { skill: 'Reasoning', value: Math.round(reasoningAcc) },
      { skill: 'English',   value: Math.round(englishAcc) },
      { skill: 'Coding',    value: Math.round(codingAcc) },
      { skill: 'Mock Tests',value: Math.round(testAcc) },
    ];

    res.json({
      success: true,
      data: {
        overview: { xp: user.xp, level: user.level, streak: user.streak, placementScore, ...user.stats },
        weeklyActivity,
        skillRadar,
        categoryStats,
        recentTests: tests,
        recentSubmissions: submissions,
        companyProgress: buildCompanyProgress(progress),
      },
    });
  } catch (err) { next(err); }
};

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, newUsersToday, totalRevenue, activeSubscriptions] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) }, role: 'student' }),
      require('../models/Payment.model').aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.countDocuments({ 'subscription.plan': { $ne: 'free' }, 'subscription.expiresAt': { $gte: new Date() } }),
    ]);

    res.json({ success: true, data: {
      totalUsers, newUsersToday, activeSubscriptions,
      totalRevenue: totalRevenue[0]?.total || 0,
    }});
  } catch (err) { next(err); }
};

// helpers
const acc = (cat) => cat ? (cat.correct / (cat.attempted || 1)) * 100 : 0;
const last7Days = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.now() - i * 86400000);
  return d.toISOString().split('T')[0];
}).reverse();

const buildCompanyProgress = (progress) => {
  const map = {};
  progress.forEach(p => {
    if (!p.company) return;
    const key = p.company._id.toString();
    if (!map[key]) map[key] = { company: p.company, attempted: 0, correct: 0 };
    map[key].attempted += p.questionsAttempted;
    map[key].correct   += p.questionsCorrect;
  });
  return Object.values(map).map(c => ({
    company: c.company,
    accuracy: c.attempted ? Math.round((c.correct / c.attempted) * 100) : 0,
    attempted: c.attempted,
  }));
};
