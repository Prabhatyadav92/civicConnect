import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import AuthShell, { ArrowIcon, MailIcon, inputClass, leadIconClass, primaryButtonClass } from '../components/AuthShell.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Check your email</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            If an account exists for <strong className="text-slate-900">{email}</strong>, we have sent a link to
            reset your password. It works for 30 minutes.
          </p>
          <Link to="/login" className={`${primaryButtonClass} no-underline`}>
            Back to login
          </Link>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 w-full text-center text-sm font-semibold text-blue-700 hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Forgot password?</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Enter your email and we will send you a link to choose a new one.
          </p>

          <div className="relative mt-7">
            <label htmlFor="email" className="sr-only">Email address</label>
            <MailIcon className={leadIconClass} />
            <input
              id="email"
              type="email"
              className={inputClass}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button disabled={busy} className={primaryButtonClass}>
            {busy ? 'Sending…' : 'Send reset link'}
            {!busy && <ArrowIcon className="h-4 w-4" />}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-blue-700 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}