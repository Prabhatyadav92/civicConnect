import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell, {
  ArrowIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  inputClass,
  leadIconClass,
  primaryButtonClass,
} from '../components/AuthShell.jsx';

const REMEMBER_KEY = 'cc_remembered_email';

// localStorage can be blocked (private mode, strict settings), so never let it crash the page.
const readSaved = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || '';
  } catch {
    return '';
  }
};
const writeSaved = (email) => {
  try {
    if (email) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* ignore */
  }
};

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice || '';

  const [saved] = useState(readSaved);
  const [form, setForm] = useState({ name: '', email: isRegister ? '' : saved, password: '' });
  const [remember, setRemember] = useState(Boolean(saved));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = isRegister
        ? await register(form)
        : await login({ email: form.email, password: form.password });
      if (!isRegister) writeSaved(remember ? form.email.trim() : '');
      navigate(user.role === 'citizen' ? '/reports' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isRegister ? 'Create your account' : 'Welcome back!'}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          {isRegister ? 'It takes a minute and lets you track your reports.' : 'Sign in to continue'}
        </p>

        {notice && (
          <p role="status" className="mt-5 rounded-lg bg-green-50 px-3 py-2.5 text-sm font-medium text-green-800">
            {notice}
          </p>
        )}

        <div className="mt-7 space-y-4">
          {isRegister && (
            <div className="relative">
              <label htmlFor="name" className="sr-only">Full name</label>
              <UserIcon className={leadIconClass} />
              <input id="name" className={inputClass} placeholder="Full name" value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
          )}

          <div className="relative">
            <label htmlFor="email" className="sr-only">Email address</label>
            <MailIcon className={leadIconClass} />
            <input id="email" type="email" className={inputClass} placeholder="Email address" value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <LockIcon className={leadIconClass} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass} pr-12`}
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-blue-700"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {isRegister && <p className="-mt-2 text-xs text-slate-500">Use at least 8 characters.</p>}
        </div>

        {!isRegister && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button disabled={busy} className={primaryButtonClass}>
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Login'}
          {!busy && <ArrowIcon className="h-4 w-4" />}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Link
          to={isRegister ? '/login' : '/register'}
          className="block rounded-lg border border-blue-600 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-50"
        >
          {isRegister ? 'I already have an account' : 'Create an account'}
        </Link>
      </form>
    </AuthShell>
  );
}