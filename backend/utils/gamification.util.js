const User = require('../models/User.model');
const DailyActivity = require('../models/DailyActivity.model');
const Badge = require('../models/Badge.model');

const XP_REWARDS = {
  questionCorrect:  10,
  questionAttempt:   2,
  codingAccepted:   50,
  codingAttempt:    10,
  testCompleted:    30,
  noteRead:          5,
  dailyStreak:      20,
};

const LEVEL_THRESHOLDS = Array.from({ length: 100 }, (_, i) => Math.floor(100 * Math.pow(i + 1, 1.5)));

const getLevelFromXP = (xp) => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 2;
    else break;
  }
  return Math.min(level, 100);
};

const awardXP = async (userId, action, amount = null) => {
  const xp = amount ?? XP_REWARDS[action] ?? 0;
  if (!xp) return;

  const user = await User.findById(userId);
  if (!user) return;

  user.xp += xp;
  user.level = getLevelFromXP(user.xp);

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate).toISOString().split('T')[0] : null;
  if (lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastDate === yesterday) user.streak += 1;
    else user.streak = 1;
    user.lastActiveDate = new Date();
  }

  await user.save();

  // Update daily activity
  const dateStr = today;
  const update = { $inc: { xpEarned: xp } };
  if (action === 'questionCorrect' || action === 'questionAttempt') update.$inc.questionsAttempted = 1;
  if (action === 'codingAccepted') update.$inc.codingSolved = 1;
  if (action === 'testCompleted')  update.$inc.testsAttempted = 1;
  if (action === 'noteRead')       update.$inc.notesRead = 1;
  await DailyActivity.findOneAndUpdate({ user: userId, date: dateStr }, update, { upsert: true });

  return { xp, newLevel: user.level, streak: user.streak };
};

const calculatePlacementScore = (stats) => {
  const { aptitudeAcc = 0, codingAcc = 0, commAcc = 0, testAcc = 0, streak = 0 } = stats;
  const score = Math.round(
    aptitudeAcc * 0.3 + codingAcc * 0.3 + commAcc * 0.2 + testAcc * 0.15 + Math.min(streak / 30, 1) * 5
  );
  return Math.min(score, 100);
};

module.exports = { awardXP, getLevelFromXP, LEVEL_THRESHOLDS, XP_REWARDS, calculatePlacementScore };
