const axios = require('axios');
const UserProgress = require('../models/UserProgress.model');
const User = require('../models/User.model');

const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const groqChat = async (messages) => {
  const res = await axios.post(`${GROQ_BASE_URL}/chat/completions`, {
    model: GROQ_MODEL,
    messages,
    max_tokens: 800,
    temperature: 0.7,
  }, {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  return res.data.choices[0].message.content;
};

exports.askDoubt = async (req, res, next) => {
  try {
    const { question, type = 'aptitude', context } = req.body;
    const systemPrompt = `You are an expert placement preparation coach helping Indian college students prepare for company placements. 
    You specialize in ${type}. Give clear, step-by-step explanations. Be concise and encouraging.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context ? [{ role: 'user', content: `Context: ${context}` }] : []),
      { role: 'user', content: question },
    ];

    const answer = await groqChat(messages);
    res.json({ success: true, data: { answer } });
  } catch (err) { next(err); }
};

exports.generateStudyPlan = async (req, res, next) => {
  try {
    const { targetCompany, availableHours, targetDate } = req.body;
    const userId = req.user._id;

    const progress = await UserProgress.find({ user: userId }).populate('topic', 'name category');
    const user = await User.findById(userId);

    const weakTopics  = progress.filter(p => p.accuracy < 50).map(p => p.topic?.name).filter(Boolean);
    const strongTopics= progress.filter(p => p.accuracy >= 75).map(p => p.topic?.name).filter(Boolean);

    const prompt = `Create a personalized placement preparation study plan for a student targeting ${targetCompany}.
Student stats:
- Weak topics: ${weakTopics.join(', ') || 'Not assessed yet'}
- Strong topics: ${strongTopics.join(', ') || 'Not assessed yet'}
- Available study hours per day: ${availableHours}
- Days until target: ${targetDate ? Math.ceil((new Date(targetDate) - new Date()) / 86400000) : 30} days
- Current streak: ${user.streak} days
- XP Level: ${user.level}

Generate a structured week-by-week study plan with specific daily tasks, topics to cover, and time allocation. Format as JSON with this structure:
{
  "summary": "brief overview",
  "weeks": [{ "week": 1, "focus": "theme", "days": [{ "day": "Monday", "tasks": [{ "topic": "", "duration": "", "type": "aptitude|coding|english|reasoning" }] }] }],
  "tips": ["tip1", "tip2"]
}
Return only valid JSON.`;

    const raw = await groqChat([{ role: 'user', content: prompt }]);
    const plan = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};
