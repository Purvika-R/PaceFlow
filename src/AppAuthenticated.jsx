import { useState } from 'react';
import { ShieldCheck, Loader, AlertCircle, Terminal } from 'lucide-react';
import ConnectedApp from './AppConnected';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/;

function AuthShell({ children, title, subtitle }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080d1a] grid-bg scanlines p-4 sm:p-6">
      <section className="card w-full max-w-md p-6 sm:p-9 shadow-2xl border-emerald-500/10">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 font-display font-bold text-slate-950 shadow-lg shadow-emerald-500/30 text-lg">
            V
          </span>
          <div>
            <b className="block font-display text-lg text-slate-100">Vectorlane</b>
            <span className="font-mono-code text-[9px] tracking-[.25em] text-emerald-400">EXECUTION_OS</span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-100">{title}</h1>
        <p className="mt-2 font-mono-code text-xs text-slate-500">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

function Login({ showRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
    } catch (reason) {
      setError(reason.message || 'Authentication failed. Verify credentials and retry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Access Control" subtitle="// Authenticate to enter workspace">
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-display text-slate-400">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300 placeholder:text-slate-700"
            autoComplete="email"
            placeholder="developer@vectorlane.io"
          />
        </label>
        <label className="block text-sm font-display text-slate-400">
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
            <span className="font-mono-code text-xs text-rose-300">{error}</span>
          </div>
        )}
        <button
          disabled={busy}
          className="focus flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-display font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30 disabled:opacity-60"
        >
          {busy && <Loader size={16} className="animate-spin" />}
          {busy ? 'AUTHENTICATING...' : 'ENTER WORKSPACE'}
        </button>
      </form>
      <p className="mt-5 text-center font-mono-code text-xs text-slate-600">
        No account?{' '}
        <button type="button" onClick={showRegister} className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
          Initialize new user
        </button>
      </p>
    </AuthShell>
  );
}

function Register({ showLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Password confirmation mismatch.');
    }
    if (!passwordPattern.test(form.password)) {
      return setError('Password requirements not met.');
    }
    setBusy(true);
    setError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
    } catch (reason) {
      setError(reason.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="User Registration" subtitle="// Initialize new developer account">
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-display text-slate-400">
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300 placeholder:text-slate-700"
            autoComplete="name"
            placeholder="Purvika R"
          />
        </label>
        <label className="block text-sm font-display text-slate-400">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300 placeholder:text-slate-700"
            autoComplete="email"
            placeholder="developer@vectorlane.io"
          />
        </label>
        <label className="block text-sm font-display text-slate-400">
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </label>
        <label className="block text-sm font-display text-slate-400">
          Confirm password
          <input
            required
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="focus mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm text-slate-300"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </label>
        <p className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 font-mono-code text-[10px] leading-5 text-slate-500">
          Requirements: 8-15 chars · uppercase · lowercase · number · special char
          <br />
          <span className="text-emerald-400">Example: Purvika@123</span>
        </p>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
            <span className="font-mono-code text-xs text-rose-300">{error}</span>
          </div>
        )}
        <button
          disabled={busy}
          className="focus flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-display font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30 disabled:opacity-60"
        >
          {busy && <Loader size={16} className="animate-spin" />}
          {busy ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
        </button>
      </form>
      <p className="mt-5 text-center font-mono-code text-xs text-slate-600">
        Have an account?{' '}
        <button type="button" onClick={showLogin} className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
          Return to login
        </button>
      </p>
    </AuthShell>
  );
}

function AuthGate() {
  const { loading, user } = useAuth();
  const [registering, setRegistering] = useState(false);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080d1a] grid-bg scanlines">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <ShieldCheck className="text-emerald-400" size={42} />
            <div className="absolute inset-0 animate-ping">
              <ShieldCheck className="text-emerald-400 opacity-30" size={42} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-emerald-400 animate-pulse" />
            <span className="font-mono-code text-xs text-slate-500 uppercase tracking-wider">
              Verifying session...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return registering ? (
      <Register showLogin={() => setRegistering(false)} />
    ) : (
      <Login showRegister={() => setRegistering(true)} />
    );
  }

  return <ConnectedApp />;
}

export default function AppAuthenticated() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
