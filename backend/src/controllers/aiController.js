const Task = require('../models/Task');
const Project = require('../models/Project');
const populated = (query) => query.populate([{ path: 'project', select: 'name status' }, { path: 'assignee', select: 'name email role' }]);
const fallbackPlan = (goal, count) => ['Clarify acceptance criteria and technical constraints', 'Build the smallest testable implementation', 'Validate edge cases and integration points', 'Review, document, and prepare the release'].slice(0, Math.max(1, Math.min(Number(count) || 4, 4))).map((title, index) => ({ title: `${index + 1}. ${title}`, description: `For: ${goal}`, priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low' }));
const normaliseTasks = (tasks) => tasks.slice(0, 6).map((task) => ({ title: String(task.title || '').trim(), description: String(task.description || '').trim(), priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium' })).filter((task) => task.title);

async function persistTasks({ tasks, project, goal, generationId, userId }) {
  const documents = normaliseTasks(tasks).map((task) => ({ ...task, project, assignee: userId, aiGenerated: true, aiGenerationId: generationId, aiGenerationGoal: goal }));
  if (!documents.length) throw new Error('No valid task drafts were generated');
  await Task.insertMany(documents, { ordered: true });
  return populated(Task.find({ project, aiGenerationId: generationId }).sort('createdAt'));
}

exports.generateTasks = async (req, res, next) => {
  try {
    const { goal, count = 4, project, generationId } = req.body;
    if (!await Project.exists({ _id: project })) return res.status(404).json({ success: false, message: 'Project not found' });
    const existing = await populated(Task.find({ project, aiGenerationId: generationId }).sort('createdAt'));
    if (existing.length) return res.json({ success: true, data: { tasks: existing, source: 'persisted' } });
    if (!process.env.MISTRAL_API_KEY) return res.status(503).json({ success: false, message: 'Mistral AI is not configured. Set MISTRAL_API_KEY in backend/.env and restart the backend.' });
    let tasks; let source = 'mistral'; let providerFallback = false;
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.MISTRAL_MODEL || 'mistral-small-2506', messages: [{ role: 'system', content: 'You create concise developer task plans. Return only a JSON object with a tasks array. Every task must contain title, description, and priority set to low, medium, or high.' }, { role: 'user', content: `Create ${count} developer tasks for this project goal: ${goal}` }], response_format: { type: 'json_object' }, temperature: 0.35, max_tokens: 900 }) });
      if (!response.ok) throw new Error(`Mistral request failed with status ${response.status}`);
      const payload = await response.json(); const content = payload.choices?.[0]?.message?.content; const text = Array.isArray(content) ? content.map((part) => part.text || '').join('') : content; const parsed = JSON.parse(text || '{}'); tasks = Array.isArray(parsed.tasks) ? parsed.tasks : parsed;
      if (!Array.isArray(tasks) || !tasks.length) throw new Error('Mistral returned no task drafts');
    } catch (providerError) { tasks = fallbackPlan(goal, count); source = 'planner'; providerFallback = true; }
    const savedTasks = await persistTasks({ tasks, project, goal, generationId, userId: req.user._id });
    res.status(201).json({ success: true, data: { tasks: savedTasks, source, providerFallback } });
  } catch (error) {
    if (error.code === 11000) return res.json({ success: true, data: { tasks: await populated(Task.find({ project: req.body.project, aiGenerationId: req.body.generationId }).sort('createdAt')), source: 'persisted' } });
    next(error);
  }
};

exports.suggestPriorities = async (req, res, next) => {
  try {
    const now = new Date(); const tasks = await Task.find({ status: { $ne: 'done' } }).sort({ dueDate: 1 }).limit(8).select('title dueDate priority');
    res.json({ success: true, data: { suggestions: tasks.map((task) => ({ title: task.title, priority: task.dueDate && task.dueDate - now < 3 * 86400000 ? 'high' : task.priority, reason: task.dueDate ? 'Ordered by approaching due date and current priority.' : 'No due date is set; retaining current priority.' })) } });
  } catch (error) { next(error); }
};
