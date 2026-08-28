import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useWorkspaceData } from './hooks/useWorkspaceData';
import { workspaceApi } from './services/api';

export default function PersistentCopilot() {
  const { loading, error, projects, tasks, reload } = useWorkspaceData();
  const [goal, setGoal] = useState('');
  const [projectId, setProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedProject = projectId || projects[0]?.id || '';
  const generatedTasks = tasks.filter((task) => task.aiGenerated);

  const generate = async (event) => {
    event.preventDefault();
    if (!selectedProject) return setMessage('Create a project before generating a task plan.');
    setBusy(true);
    setMessage('');
    try {
      const result = await workspaceApi.generateTasks({ goal, count: 4, project: selectedProject, generationId: crypto.randomUUID() });
      await reload();
      setGoal('');
      setMessage(result.source === 'mistral' ? 'Mistral generated and saved this task plan to your project.' : result.source === 'persisted' ? 'This task plan was already saved.' : 'Mistral was unavailable; the saved plan uses the execution-planner fallback.');
    } catch (reason) {
      setMessage(reason.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-5"><div className="h-24 rounded-2xl bg-slate-700" /><div className="h-64 rounded-2xl bg-slate-800" /></div>;
  if (error) return <div className="card p-6"><b>Unable to load saved AI plans</b><p className="mt-2 text-sm text-slate-400">{error}</p><button onClick={reload} className="focus mt-4 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950">Try again</button></div>;

  return <><p className="font-mono text-xs uppercase tracking-[.2em] text-cyan-300">AI copilot</p><h1 className="mt-2 text-3xl font-bold">Turn intent into execution.</h1><p className="mt-2 max-w-xl text-slate-400">Generated plans are saved as project tasks and remain available after navigating away or refreshing.</p><form onSubmit={generate} className="card mt-7 p-5"><select required value={selectedProject} onChange={(event) => setProjectId(event.target.value)} className="focus mb-3 w-full rounded-xl border border-slate-600 bg-slate-950/50 p-3 text-sm"><option value="">Choose a project lane</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select><textarea required minLength="4" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Example: ship secure email invitations for our team workspace" className="focus min-h-28 w-full rounded-xl border border-slate-600 bg-slate-950/50 p-3 text-sm" /><button disabled={busy || !projects.length} className="focus mt-3 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"><Sparkles size={16} className="mr-2 inline" />{busy ? 'Generating and saving…' : 'Generate and save task plan'}</button></form>{message && <p role="status" className="mt-4 text-sm text-cyan-200">{message}</p>}<section className="mt-6 grid gap-4 md:grid-cols-2">{generatedTasks.map((task) => <article className="card p-5" key={task.id}><p className="font-mono text-[10px] tracking-widest text-cyan-300">SAVED AI TASK · {task.project}</p><h2 className="mt-2 font-bold">{task.title}</h2><p className="mt-2 text-sm text-slate-400">{task.description || 'No description provided.'}</p><div className="mt-4 flex justify-between"><span className="text-xs text-amber-200">{task.priority} priority</span><span className="text-xs text-slate-500">{task.status}</span></div></article>)}{!generatedTasks.length && <div className="card p-6 text-sm text-slate-400">No saved AI plans yet. Generate one to add its tasks to a project.</div>}</section></>;
}
