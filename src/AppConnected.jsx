import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import { Bell, CheckCircle2, Circle, FolderKanban, LayoutDashboard, Menu, Search, Settings, BarChart3, CheckSquare, Target, Inbox, X, Save, AlertCircle, Bot, LogOut, Edit2, Loader, TrendingUp, Activity, Zap } from 'lucide-react';
import { useWorkspaceData } from './hooks/useWorkspaceData';
import { useAuth } from './hooks/useAuth.jsx';
import PersistentCopilot from './PersistentCopilot';

const AccentContext = createContext('emerald');

const navigation = [
  ['/', 'Mission Control', LayoutDashboard],
  ['/projects', 'Project Lanes', FolderKanban],
  ['/tasks', 'Execution Queue', CheckSquare],
  ['/ai', 'AI Copilot', Bot],
  ['/analytics', 'Telemetry', BarChart3],
  ['/settings', 'Settings', Settings]
];

const Avatar = ({ initials = 'PR', accent = 'emerald' }) => {
  const isAmber = accent === 'amber';
  return (
    <span
      className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold text-slate-900 shadow-lg ${
        isAmber
          ? ''
          : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30'
      }`}
      style={isAmber ? {
        background: 'linear-gradient(to bottom right, var(--accent-primary), var(--accent-primary-hover))',
        boxShadow: '0 4px 14px var(--accent-shadow)'
      } : {}}
    >
      {initials}
    </span>
  );
};

const Bar = ({ value }) => (
  <div className="h-2 overflow-hidden rounded-full bg-slate-800/60 relative">
    <div
      className="bar-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Badge = ({ children, variant = 'default', accent = 'emerald' }) => {
  const isAmber = accent === 'amber';

  const defaultVariants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700',
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    done: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  };

  const amberVariants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700',
    active: '',
    done: '',
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: '',
  };

  const variants = isAmber ? amberVariants : defaultVariants;
  const variantClass = variants[variant.toLowerCase()] || variants.default;
  const useAmberStyle = isAmber && ['low', 'active', 'done'].includes(variant.toLowerCase());

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono-code font-semibold uppercase tracking-wider ${variantClass}`}
      style={useAmberStyle ? {
        backgroundColor: 'var(--accent-bg)',
        color: 'var(--accent-text)',
        borderColor: 'var(--accent-border)'
      } : {}}
    >
      <span className="inline-block h-1 w-1 rounded-full bg-current opacity-75" />
      {children}
    </span>
  );
};

function Empty({ onClear }) {
  return (
    <div className="card grid min-h-48 place-items-center p-6 text-center">
      <div>
        <Inbox className="mx-auto mb-3 text-slate-600" />
        <b className="font-display text-slate-400">[ NO DATA FOUND ]</b>
        <p className="mt-1 font-mono-code text-xs text-slate-600">// Adjust search parameters</p>
        {onClear && (
          <button onClick={onClear} className="focus mt-4 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function ErrorState({ message, retry }) {
  return (
    <div className="card grid min-h-48 place-items-center p-6 text-center border-rose-500/30">
      <div>
        <AlertCircle className="mx-auto mb-3 text-rose-500" />
        <b className="font-display text-rose-400">[ SYSTEM ERROR ]</b>
        <p className="mt-1 font-mono-code text-xs text-slate-500">{message}</p>
        {retry && (
          <button onClick={retry} className="focus mt-4 rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-400">
            Retry connection
          </button>
        )}
      </div>
    </div>
  );
}

function InlineError({ message }) {
  return (
    <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-3 text-sm text-rose-300" role="alert">
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span className="font-mono-code text-xs">{message}</span>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-24 rounded-xl bg-slate-800/40" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div className="h-32 rounded-xl bg-slate-800/40" key={item} />
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return <Loader className="inline animate-spin" size={16} />;
}

function Project({ project }) {
  return (
    <article className="card card-hover p-5 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between gap-2">
        <h3 className="font-display font-semibold text-slate-200">{project.name}</h3>
        <Badge variant={project.status === 'Completed' ? 'done' : 'active'}>{project.status}</Badge>
      </div>
      <p className="mt-2 min-h-10 text-sm text-slate-500">
        {project.description || 'No description provided.'}
      </p>
      <div className="mt-4 flex justify-between text-sm font-mono-code">
        <b className="text-emerald-400">{project.progress}%</b>
        <span className="text-slate-500">
          {project.completedTasks}<span className="text-slate-600">/</span>{project.totalTasks} tasks
        </span>
      </div>
      <Bar value={project.progress} />
      <div className="mt-4 flex justify-between text-xs">
        <span className="flex -space-x-1">
          {project.members.map((member) => (
            <Avatar key={member} initials={member} />
          ))}
        </span>
        <span className="font-mono-code text-slate-500">
          <Badge variant={project.priority}>{project.priority}</Badge>
          <span className="ml-2 text-slate-600">{project.dueDate}</span>
        </span>
      </div>
    </article>
  );
}

function Task({ task }) {
  return (
    <article className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-slate-800/50 py-4 last:border-0 group hover:bg-slate-800/20 transition-colors px-2 -mx-2 rounded-lg">
      <span className="text-emerald-400 group-hover:scale-110 transition-transform">
        {task.status === 'Done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </span>
      <div>
        <b className="text-sm font-display text-slate-200">{task.title}</b>
        <p className="mt-1 font-mono-code text-[10px] text-slate-600">
          {task.project} <span className="text-slate-700">·</span> {task.assignee}
        </p>
      </div>
      <div className="text-right">
        <Badge variant={task.status === 'Done' ? 'done' : 'default'}>{task.status}</Badge>
        <p className="mt-2 font-mono-code text-[10px] text-slate-600">
          <Badge variant={task.priority}>{task.priority}</Badge>
          <span className="ml-1.5 text-slate-700">{task.dueDate}</span>
        </p>
      </div>
    </article>
  );
}

function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Mission Control is at '/' — use amber accent there, emerald everywhere else
  const isMissionControl = location.pathname === '/';
  const pageAccent = isMissionControl ? 'amber' : 'emerald';

  const leaveWorkspace = () => {
    logout();
    window.location.assign('/');
  };

  const page = navigation.find((item) => item[0] === location.pathname)?.[1];

  const links = navigation.map(([to, label, Icon]) => {
    const isThisLinkMissionControl = to === '/';
    return (
      <NavLink
        key={to}
        end={to === '/'}
        to={to}
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `focus flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-display font-medium transition-all ${
            isActive
              ? isThisLinkMissionControl
                ? 'border shadow-lg'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
          }`
        }
        style={({ isActive }) => (isActive && isThisLinkMissionControl) ? {
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--accent-text)',
          borderColor: 'var(--accent-border)',
          boxShadow: '0 8px 16px -4px var(--accent-shadow)'
        } : {}}
      >
        <Icon size={18} />
        {label}
      </NavLink>
    );
  });

  const profile = (
    <div className="mt-auto border-t border-slate-800/60 pt-4">
      <div className="flex items-center gap-2">
        <Avatar initials={user?.name?.slice(0, 2).toUpperCase()} accent={pageAccent} />
        <span className="min-w-0 text-sm">
          <b className="block truncate font-display text-slate-300">{user?.name}</b>
          <i className="block truncate font-mono-code text-[10px] text-slate-600">{user?.role || 'DEVELOPER'}</i>
        </span>
      </div>
      <button
        onClick={leaveWorkspace}
        className="focus mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-display text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300"
      >
        <LogOut size={15} />
        Logout
      </button>
    </div>
  );

  return (
    <AccentContext.Provider value={pageAccent}>
      <div className="min-h-screen bg-[#080d1a] grid-bg scanlines">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 z-40 hidden w-64 flex-col border-r border-slate-800/60 bg-[#0a0f1c]/95 backdrop-blur-sm p-5 lg:flex">
          <div className="mb-9 hud-border pl-3 pt-3">
            <b className="block text-xl font-display text-slate-100 tracking-tight">Vectorlane</b>
            <span
              className={`font-mono-code text-[9px] tracking-[.25em] ${
                isMissionControl ? '' : 'text-emerald-400'
              }`}
              style={isMissionControl ? { color: 'var(--accent-primary)' } : {}}
            >
              EXECUTION_OS
            </span>
          </div>
          {links}
          {profile}
        </aside>

        {/* Mobile sidebar overlay */}
        {open && (
          <aside className="fixed inset-0 z-50 flex w-full flex-col bg-[#0a0f1c] p-5 shadow-xl sm:w-72 lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="self-end text-slate-400 hover:text-white transition"
            >
              <X />
            </button>
            <div className="mb-9">
              <b className="block text-xl font-display text-slate-100">Vectorlane</b>
              <span
                className={`font-mono-code text-[9px] tracking-[.25em] ${
                  isMissionControl ? '' : 'text-emerald-400'
                }`}
                style={isMissionControl ? { color: 'var(--accent-primary)' } : {}}
              >
                EXECUTION_OS
              </span>
            </div>
            {links}
            {profile}
          </aside>
        )}

        <main className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/60 bg-[#080d1a]/90 backdrop-blur-sm px-4 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
                className="text-slate-500 hover:text-slate-300 transition lg:hidden"
              >
                <Menu />
              </button>
              <div className="flex items-center gap-2">
                <div
                  className={`hidden sm:flex h-2 w-2 rounded-full animate-pulse ${
                    isMissionControl ? '' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                  }`}
                  style={isMissionControl ? {
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 0 8px var(--accent-glow)'
                  } : {}}
                />
                <b className="font-mono-code text-[11px] uppercase tracking-[.2em] text-slate-500">{page}</b>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`text-slate-500 transition relative ${
                  isMissionControl ? '' : 'hover:text-emerald-400'
                }`}
                onMouseEnter={(e) => isMissionControl && (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => isMissionControl && (e.currentTarget.style.color = '')}
              >
                <Bell size={18} />
                <span
                  className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                    isMissionControl ? '' : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  }`}
                  style={isMissionControl ? {
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 0 6px var(--accent-glow)'
                  } : {}}
                />
              </button>
              <Avatar initials={user?.name?.slice(0, 2).toUpperCase()} accent={pageAccent} />
            </div>
          </header>
          <div className="mx-auto max-w-7xl p-4 sm:p-7">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/ai" element={<Copilot />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </AccentContext.Provider>
  );
}

function Dashboard() {
  const { loading, error, projects, tasks, reload } = useWorkspaceData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const accent = 'amber'; // Mission Control uses amber accent

  const term = query.trim().toLowerCase();
  const filteredProjects = projects.filter(
    (project) =>
      !term ||
      project.name.toLowerCase().includes(term) ||
      (project.description || '').toLowerCase().includes(term)
  );
  const filteredTasks = tasks.filter(
    (task) =>
      (!term ||
        task.title.toLowerCase().includes(term) ||
        task.project.toLowerCase().includes(term)) &&
      (status === 'All' || task.status === status) &&
      (priority === 'All' || task.priority === priority)
  );

  const clear = () => {
    setQuery('');
    setStatus('All');
    setPriority('All');
  };

  const completed = tasks.filter((task) => task.status === 'Done').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;

  return (
    <>
      <section className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <p className="font-mono-code text-[10px] uppercase tracking-[.2em]" style={{ color: 'var(--accent-text)' }}>// WORKSPACE_OVERVIEW</p>
          <h1 className="mt-2 text-3xl font-display font-bold text-slate-100 tracking-tight">Mission Control</h1>
          <p className="mt-2 text-sm text-slate-500">Real-time execution metrics across all project lanes</p>
        </div>
        <label className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-slate-600" size={18} />
          <input
            aria-label="Search projects and tasks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search execution queue..."
            className="focus w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 text-sm text-slate-300 placeholder:text-slate-700 transition hover:border-slate-700"
          />
        </label>
      </section>

      {/* Asymmetric stat cards with different emphasis */}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Primary stat - larger, emphasized */}
        <article className="card card-hover p-6 sm:col-span-2 lg:col-span-1 lg:row-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl group-hover:opacity-30 transition-all" style={{ backgroundColor: 'var(--accent-bg)' }} />
          <div className="relative">
            <Target className="mb-4" style={{ color: 'var(--accent-primary)' }} size={24} />
            <p className="text-6xl font-display font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to bottom right, var(--accent-primary), var(--accent-primary-hover))' }}>{progress}%</p>
            <p className="mt-2 font-mono-code text-[10px] uppercase tracking-wider text-slate-500">COMPLETION_RATE</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono-code" style={{ color: 'var(--accent-primary)' }}>
              <TrendingUp size={14} />
              <span>+12% this sprint</span>
            </div>
          </div>
        </article>

        {/* Secondary stats - standard size */}
        {[
          [FolderKanban, 'ACTIVE_PROJECTS', projects.length, 'Project lanes'],
          [Activity, 'IN_PROGRESS', tasks.filter((task) => task.status !== 'Done').length, 'Active tasks'],
          [CheckCircle2, 'RESOLVED', completed, 'Completed'],
        ].map(([Icon, label, value, subtitle]) => (
          <article className="card card-hover p-5 group relative overflow-hidden" key={label}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl group-hover:opacity-20 transition-all" style={{ backgroundColor: 'var(--accent-bg)' }} />
            <Icon className="mb-3" style={{ color: 'var(--accent-primary)', opacity: 0.6 }} size={20} />
            <p className="text-3xl font-display font-bold text-slate-200">{value}</p>
            <p className="mt-1 font-mono-code text-[9px] uppercase tracking-wider text-slate-600">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </article>
        ))}
      </section>

      {/* Productivity pulse with enhanced styling */}
      <section className="card card-hover mt-7 p-6" style={{ borderColor: 'var(--accent-border)' }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap style={{ color: 'var(--accent-primary)' }} size={18} />
              <h2 className="font-display font-bold text-slate-200">Execution Velocity</h2>
            </div>
            <p className="mt-1 font-mono-code text-[10px] text-slate-600">// Task throughput across integrated workspace</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold" style={{ color: 'var(--accent-primary)' }}>{completed}</span>
            <span className="font-mono-code text-slate-600">/</span>
            <span className="text-xl font-mono-code text-slate-500">{tasks.length}</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800/60 relative">
            <div
              className="bar-fill absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(to right, var(--accent-primary), var(--accent-primary-hover))',
                boxShadow: '0 0 12px var(--accent-glow)'
              }}
            />
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-baseline gap-3">
        <h2 className="text-xl font-display font-bold text-slate-200">Project Lanes</h2>
        <span className="font-mono-code text-xs text-slate-600">// {filteredProjects.length} active</span>
      </div>
      {filteredProjects.length ? (
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <article key={project.id} className="card card-hover p-5 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-primary-hover))' }} />
              <div className="flex justify-between gap-2">
                <h3 className="font-display font-semibold text-slate-200">{project.name}</h3>
                <Badge variant={project.status === 'Completed' ? 'done' : 'active'} accent={accent}>{project.status}</Badge>
              </div>
              <p className="mt-2 min-h-10 text-sm text-slate-500">
                {project.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex justify-between text-sm font-mono-code">
                <b style={{ color: 'var(--accent-primary)' }}>{project.progress}%</b>
                <span className="text-slate-500">
                  {project.completedTasks}<span className="text-slate-600">/</span>{project.totalTasks} tasks
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800/60 relative">
                <div
                  className="bar-fill absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${project.progress}%`,
                    background: 'linear-gradient(to right, var(--accent-primary), var(--accent-primary-hover))',
                    boxShadow: '0 0 12px var(--accent-glow)'
                  }}
                />
              </div>
              <div className="mt-4 flex justify-between text-xs">
                <span className="flex -space-x-1">
                  {project.members.map((member) => (
                    <Avatar key={member} initials={member} accent={accent} />
                  ))}
                </span>
                <span className="font-mono-code text-slate-500">
                  <Badge variant={project.priority} accent={accent}>{project.priority}</Badge>
                  <span className="ml-2 text-slate-600">{project.dueDate}</span>
                </span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <Empty onClear={clear} />
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-display font-bold text-slate-200">Execution Queue</h2>
            <span className="font-mono-code text-xs text-slate-600">// {filteredTasks.length} items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Todo', 'In Progress', 'Done'].map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-lg px-3 py-1.5 font-mono-code text-[10px] font-semibold uppercase tracking-wider transition border ${
                  status === item
                    ? 'border-current'
                    : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400'
                }`}
                style={status === item ? {
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent-text)',
                  borderColor: 'var(--accent-border)'
                } : {}}
              >
                {item}
              </button>
            ))}
            <select
              aria-label="Priority filter"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 font-mono-code text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition hover:border-slate-700"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        {filteredTasks.length ? (
          <div className="card mt-4 px-5">
            {filteredTasks.map((task) => (
              <article key={task.id} className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-slate-800/50 py-4 last:border-0 group hover:bg-slate-800/20 transition-colors px-2 -mx-2 rounded-lg">
                <span className="group-hover:scale-110 transition-transform" style={{ color: 'var(--accent-primary)' }}>
                  {task.status === 'Done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </span>
                <div>
                  <b className="text-sm font-display text-slate-200">{task.title}</b>
                  <p className="mt-1 font-mono-code text-[10px] text-slate-600">
                    {task.project} <span className="text-slate-700">·</span> {task.assignee}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={task.status === 'Done' ? 'done' : 'default'} accent={accent}>{task.status}</Badge>
                  <p className="mt-2 font-mono-code text-[10px] text-slate-600">
                    <Badge variant={task.priority} accent={accent}>{task.priority}</Badge>
                    <span className="ml-1.5 text-slate-700">{task.dueDate}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty onClear={clear} />
        )}
      </section>
    </>
  );
}

function Projects() {
  const { loading, error, users, projects, reload, createProject, updateProject, deleteProject } =
    useWorkspaceData();
  const [form, setForm] = useState({ name: '', description: '', owner: '', status: 'active' });
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      if (editingId) {
        await updateProject(editingId, form);
        setNotice('Project updated successfully.');
        setEditingId(null);
      } else {
        await createProject(form);
        setNotice('Project created successfully.');
      }
      setForm({ name: '', description: '', owner: '', status: 'active' });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description || '',
      owner: project.rawOwnerId || '',
      status: project.rawStatus || 'active',
    });
    setEditingId(project.id);
    setNotice('');
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', description: '', owner: '', status: 'active' });
    setFormError('');
  };

  const changeStatus = async (project, status) => {
    try {
      await updateProject(project.id, { status });
      setNotice('Project status updated.');
    } catch (e) {
      setNotice(e.message);
    }
  };

  const remove = async (id) => {
    if (window.confirm('Delete this project and its tasks?')) {
      try {
        await deleteProject(id);
        setNotice('Project deleted successfully.');
      } catch (e) {
        setNotice(e.message);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-code text-[10px] uppercase tracking-[.2em] text-emerald-400">// PROJECT_MANAGEMENT</p>
          <h1 className="mt-2 text-3xl font-display font-bold text-slate-100 tracking-tight">Project Lanes</h1>
          <p className="mt-2 text-sm text-slate-500">Configure and monitor all active project streams</p>
        </div>
      </div>

      <form onSubmit={submit} className="card mt-6 space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300 placeholder:text-slate-700"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300 placeholder:text-slate-700"
          />
          <select
            required
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
          >
            <option value="">Select owner</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            className="focus flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy && <LoadingSpinner />}
            {editingId ? 'Update project' : 'Create project'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="focus rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
        {formError && <InlineError message={formError} />}
      </form>

      {notice && (
        <p role="status" className="mt-3 font-mono-code text-xs text-emerald-400">
          // {notice}
        </p>
      )}

      {projects.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id}>
              <Project project={project} />
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => startEdit(project)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <select
                  aria-label={`Update ${project.name} status`}
                  value={project.rawStatus || 'active'}
                  onChange={(e) => changeStatus(project, e.target.value)}
                  className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1 text-xs text-slate-400"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={() => remove(project.id)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7">
          <Empty />
        </div>
      )}
    </>
  );
}

function Tasks() {
  const {
    loading,
    error,
    users,
    projects,
    tasks,
    reload,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useWorkspaceData();
  const [form, setForm] = useState({
    title: '',
    project: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
      };
      if (editingId) {
        await updateTask(editingId, payload);
        setNotice('Task updated successfully.');
        setEditingId(null);
      } else {
        await createTask(payload);
        setNotice('Task created successfully.');
      }
      setForm({ title: '', project: '', assignee: '', priority: 'medium', dueDate: '' });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (task) => {
    setForm({
      title: task.title,
      project: task.rawProjectId || '',
      assignee: task.rawAssigneeId || '',
      priority: task.priority.toLowerCase(),
      dueDate: task.rawDueDate || '',
    });
    setEditingId(task.id);
    setNotice('');
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', project: '', assignee: '', priority: 'medium', dueDate: '' });
    setFormError('');
  };

  const status = async (id, value) => {
    try {
      await updateTaskStatus(id, value);
      setNotice('Task status updated.');
    } catch (e) {
      setNotice(e.message);
    }
  };

  const remove = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(id);
        setNotice('Task deleted successfully.');
      } catch (e) {
        setNotice(e.message);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;

  return (
    <>
      <div className="mb-6">
        <p className="font-mono-code text-[10px] uppercase tracking-[.2em] text-emerald-400">// TASK_QUEUE</p>
        <h1 className="mt-2 text-3xl font-display font-bold text-slate-100 tracking-tight">Execution Queue</h1>
        <p className="mt-2 text-sm text-slate-500">Manage and prioritize all execution items</p>
      </div>

      <form onSubmit={submit} className="card space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title"
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300 placeholder:text-slate-700"
          />
          <select
            required
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            placeholder="Due date (optional)"
            className="focus rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            className="focus flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy && <LoadingSpinner />}
            {editingId ? 'Update task' : 'Create task'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="focus rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
        {formError && <InlineError message={formError} />}
      </form>

      {notice && (
        <p role="status" className="mt-3 font-mono-code text-xs text-emerald-400">
          // {notice}
        </p>
      )}

      {tasks.length ? (
        <div className="card mt-7 px-5">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center gap-2 border-b border-slate-800/50 py-4 last:border-0">
              <div className="min-w-0 flex-1">
                <Task task={task} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => startEdit(task)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <select
                  aria-label={`Update ${task.title} status`}
                  value={task.status.toLowerCase().replace(' ', '-')}
                  onChange={(e) => status(task.id, e.target.value)}
                  className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1 text-xs text-slate-400"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <button
                  onClick={() => remove(task.id)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7">
          <Empty />
        </div>
      )}
    </>
  );
}

function Analytics() {
  const { loading, error, projects, tasks, reload } = useWorkspaceData();

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;

  const done = tasks.filter((task) => task.status === 'Done').length;
  const status = (label) => tasks.filter((task) => task.status === label).length;
  const total = tasks.length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <p className="font-mono-code text-[10px] uppercase tracking-[.2em] text-emerald-400">// SYSTEM_METRICS</p>
      <h1 className="mt-2 text-3xl font-display font-bold text-slate-100 tracking-tight">Telemetry</h1>
      <p className="mt-2 text-sm text-slate-500">Real-time performance data from the execution workspace</p>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ['Total Projects', projects.length],
          ['Total Tasks', total],
          ['Completed Tasks', done],
          ['In Progress Tasks', status('In Progress')],
          ['Todo Tasks', status('Todo')],
          ['Overall Completion', `${completion}%`],
        ].map(([label, value]) => (
          <div className="card card-hover p-5" key={label}>
            <p className="font-mono-code text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
            <b className="mt-2 block text-3xl font-display text-slate-200">{value}</b>
          </div>
        ))}
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display font-bold text-slate-200">Project Progress</h2>
          <p className="mt-1 font-mono-code text-[10px] text-slate-600">// Completion metrics per lane</p>
          <div className="mt-5 space-y-5">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-display text-slate-400">{project.name}</span>
                  <b className="font-mono-code text-emerald-400">{project.progress}%</b>
                </div>
                <Bar value={project.progress} />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-display font-bold text-slate-200">Task Distribution</h2>
          <p className="mt-1 font-mono-code text-[10px] text-slate-600">// Status breakdown</p>
          <div className="mt-5 space-y-5">
            {['Done', 'In Progress', 'Todo'].map((item) => (
              <div key={item}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-display text-slate-400">{item}</span>
                  <b className="font-mono-code text-emerald-400">{status(item)} tasks</b>
                </div>
                <Bar value={total ? (status(item) / total) * 100 : 0} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-4 cursor-pointer group">
      <b className="text-sm font-display text-slate-300 group-hover:text-slate-200 transition">{label}</b>
      <button
        type="button"
        aria-label={label}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-all ${
          checked ? 'bg-emerald-500' : 'bg-slate-700'
        }`}
      >
        <i
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </label>
  );
}

function SettingsPage() {
  const [compact, setCompact] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <p className="font-mono-code text-[10px] uppercase tracking-[.2em] text-emerald-400">// USER_CONFIG</p>
      <h1 className="mt-2 text-3xl font-display font-bold text-slate-100 tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-slate-500">Configure workspace preferences</p>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display font-bold text-slate-200">Profile</h2>
          {[
            ['Name', 'Purvika R'],
            ['Email', 'purvika@example.com'],
            ['Role', 'Developer'],
          ].map(([label, value]) => (
            <label className="mt-4 block text-sm font-display text-slate-400" key={label}>
              {label}
              <input
                defaultValue={value}
                className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-slate-300"
              />
            </label>
          ))}
        </section>

        <section className="card p-6">
          <h2 className="font-display font-bold text-slate-200">Preferences</h2>
          <Toggle label="Compact mode" checked={compact} onChange={setCompact} />
          <Toggle label="Task reminders" checked={reminders} onChange={setReminders} />
        </section>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => setSaved(true)}
          className="focus flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          <Save size={16} />
          Save changes
        </button>
        {saved && (
          <span role="status" className="font-mono-code text-xs text-emerald-400">
            // Configuration saved
          </span>
        )}
      </div>
    </>
  );
}

var Copilot = PersistentCopilot;

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
