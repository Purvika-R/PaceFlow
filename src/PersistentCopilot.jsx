import { useState } from 'react';
import { Sparkles, Trash2, Loader, AlertCircle, Terminal } from 'lucide-react';
import { useWorkspaceData } from './hooks/useWorkspaceData';
import { workspaceApi } from './services/api';

export default function PersistentCopilot() {
  const { loading, error, projects, tasks, reload, deleteTask } = useWorkspaceData();
  const [goal, setGoal] = useState('');
  const [projectId, setProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedProject = projectId;
  const generatedTasks = tasks.filter((task) => task.aiGenerated);

  const validateGoal = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 10)
      return 'Input length insufficient. Minimum 10 characters required.';
    const words = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    if (words.length < 3)
      return 'Description too brief. Expand request details.';
    const greetings = [
      'hello',
      'hi',
      'hey',
      'yo',
      'sup',
      'howdy',
      'hola',
      'bonjour',
      'good morning',
      'good evening',
      'good afternoon',
      'how are you',
      'whats up',
      "what's up",
      'thanks',
      'thank you',
      'ok',
      'okay',
      'yes',
      'no',
      'sure',
      'help',
      'test'
    ];
    if (greetings.includes(words.join(' ')))
      return 'Greeting detected. Provide development objective instead.';
    const devKeywords =
      /\b(build|create|implement|develop|design|add|setup|set up|integrate|deploy|fix|refactor|migrate|configure|write|feature|app|api|dashboard|auth|login|page|component|database|ui|ux|frontend|backend|server|client|form|list|table|search|filter|notification|payment|email|upload|download|export|import|report|analytics|chart|settings|profile|admin|user|role|permission|comment|chat|message|real.?time|websocket|rest|graphql|crud|test|ci|cd|docker)\b/i;
    if (!devKeywords.test(trimmed))
      return 'Development context required. Specify technical objective.';
    return null;
  };

  const generate = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (!selectedProject) {
      setErrorMessage('ERROR: Project lane not selected');
      return;
    }
    const validationError = validateGoal(goal);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setBusy(true);
    try {
      const result = await workspaceApi.generateTasks({
        goal,
        count: 4,
        project: selectedProject,
        generationId: crypto.randomUUID()
      });
      await reload();
      setGoal('');
      setMessage(
        result.source === 'mistral'
          ? '// Task plan generated via Mistral API and saved to project lane'
          : result.source === 'persisted'
          ? '// Task plan retrieved from cache'
          : '// Mistral service unavailable → fallback planner executed'
      );
    } catch (reason) {
      setErrorMessage(
        reason.message || 'Generation failed. Network connection or API unavailable.'
      );
    } finally {
      setBusy(false);
    }
  };

  const removeTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Delete "${taskTitle}" from execution queue?`)) return;
    try {
      await deleteTask(taskId);
      setMessage(`// Removed: ${taskTitle}`);
    } catch (reason) {
      setErrorMessage(reason.message || 'Deletion failed.');
    }
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-24 rounded-xl bg-slate-800/40" />
        <div className="h-64 rounded-xl bg-slate-800/40" />
      </div>
    );

  if (error)
    return (
      <div className="card p-6 border-rose-500/30">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle size={20} />
          <b className="font-display">[ AI SYSTEM OFFLINE ]</b>
        </div>
        <p className="mt-2 font-mono-code text-xs text-slate-500">{error}</p>
        <button
          onClick={reload}
          className="focus mt-4 rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          Reconnect
        </button>
      </div>
    );

  return (
    <>
      <p className="font-mono-code text-[10px] uppercase tracking-[.2em] text-emerald-400">// AI_COPILOT_V2</p>
      <h1 className="mt-2 text-2xl font-display font-bold text-slate-100 tracking-tight sm:text-3xl">
        Intent → Execution
      </h1>
      <p className="mt-2 max-w-xl text-sm text-slate-500">
        Natural language interface for task generation. Plans persist across sessions.
      </p>

      <form onSubmit={generate} className="card mt-7 space-y-3 p-4 sm:p-5 border-emerald-500/10">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
          <Terminal size={14} className="text-emerald-400" />
          <span className="font-mono-code text-[10px] text-slate-600">SELECT_TARGET_LANE</span>
        </div>
        <select
          required
          value={selectedProject}
          onChange={(event) => setProjectId(event.target.value)}
          className="focus w-full rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-300"
        >
          <option value="">// Choose project lane</option>
          {projects.map((project) => (
            <option value={project.id} key={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
          <Terminal size={14} className="text-emerald-400" />
          <span className="font-mono-code text-[10px] text-slate-600">DESCRIBE_OBJECTIVE</span>
        </div>
        <textarea
          required
          minLength={4}
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="Example: implement secure email invitation workflow for team workspace with role-based access control"
          className="focus min-h-28 w-full rounded-xl border border-slate-800 bg-slate-900/50 p-3 font-mono-code text-sm text-slate-300 placeholder:text-slate-700"
        />
        <button
          disabled={busy || !selectedProject}
          className="focus flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-display font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader size={16} className="animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              GENERATE EXECUTION PLAN
            </>
          )}
        </button>
      </form>

      {errorMessage && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
          <span className="font-mono-code text-rose-300">{errorMessage}</span>
        </div>
      )}

      {message && (
        <p role="status" className="mt-4 font-mono-code text-xs text-emerald-400">
          {message}
        </p>
      )}

      <div className="mt-6 flex items-baseline gap-3">
        <h2 className="text-lg font-display font-bold text-slate-200">Generated Plans</h2>
        <span className="font-mono-code text-xs text-slate-600">// {generatedTasks.length} saved</span>
      </div>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        {generatedTasks.map((task) => (
          <article className="card card-hover p-5 group relative overflow-hidden" key={task.id}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="font-mono-code text-[9px] tracking-widest text-teal-400 uppercase">
              AI_TASK · {task.project}
            </p>
            <h2 className="mt-2 font-display font-semibold text-slate-200">{task.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{task.description || 'No description provided.'}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono-code font-semibold uppercase tracking-wider text-amber-300">
                  <span className="inline-block h-1 w-1 rounded-full bg-current opacity-75" />
                  {task.priority}
                </span>
                <span className="font-mono-code text-xs text-slate-600">{task.status}</span>
              </div>
              <button
                onClick={() => removeTask(task.id, task.title)}
                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-rose-500/20 hover:text-rose-400"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
        {!generatedTasks.length && (
          <div className="card p-6 text-center sm:col-span-2">
            <Terminal className="mx-auto mb-2 text-slate-700" size={32} />
            <p className="font-mono-code text-xs text-slate-600">
              // No saved execution plans. Generate one to begin.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
