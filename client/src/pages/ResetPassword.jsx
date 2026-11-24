import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import AuthShell, {
  ArrowIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  inputClass,
  leadIconClass,
  primaryButtonClass,
} from '../components/AuthShell.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Use at least 8 characters');
    if (password !== confirm) return setError('The two passwords do not match');
    setBusy(true);
    try {
      await api.resetPassword({ token, password });
      navigate('/login', { replace: true, state: { notice: 'Your password has been updated. Sign in with your new password.' } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthShell>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Link not valid</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          This reset link is missing or incomplete. Request a new one and use the link from the latest email.
        </p>
        <Link to="/forgot-password" className={`${primaryButtonClass} no-underline`}>
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Choose a new password</h2>
        <p className="mt-1.5 text-sm text-slate-600">Use at least 8 characters.</p>

        <div className="mt-7 space-y-4">
          <div className="relative">
            <label htmlFor="new-password" className="sr-only">New password</label>
            <LockIcon className={leadIconClass} />
            <input
              id="new-password"
              type={show ? 'text' : 'password'}
              className={`${inputClass} pr-12`}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-blue-700"
            >
              {show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div className="relative">
            <label htmlFor="confirm-password" className="sr-only">Confirm new password</label>
            <LockIcon className={leadIconClass} />
            <input
              id="confirm-password"
              type={show ? 'text' : 'password'}
              className={inputClass}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            {error}{' '}
            {error.includes('expired') && (
              <Link to="/forgot-password" className="underline">Request a new link</Link>
            )}
          </p>
        )}

        <button disabled={busy} className={primaryButtonClass}>
          {busy ? 'Saving…' : 'Update password'}
          {!busy && <ArrowIcon className="h-4 w-4" />}
        </button>
      </form>
    </AuthShell>
  );
}