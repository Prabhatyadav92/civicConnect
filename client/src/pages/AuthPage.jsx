import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      navigate(user.role === 'citizen' ? '/reports' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col justify-between bg-ink p-8 text-white md:p-12">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-md bg-signal">
            <span className="block h-0.5 w-4 bg-ink" style={{ boxShadow: '0 -5px 0 #14213D, 0 5px 0 #14213D' }} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">CivicConnect</span>
        </div>
        <div className="my-12 max-w-md md:my-0">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            See a problem on your street? Report it in under a minute.
          </h1>
          <div className="road mt-8 w-40" style={{ '--road': '#F5B800' }} />
          <p className="mt-6 text-base leading-relaxed text-white/80">
            Add a photo, drop a pin, and your report goes to the department that fixes it. You can follow it until it is resolved.
          </p>
        </div>
        <p className="text-sm text-white/60">Potholes, garbage, water leaks, broken streetlights and damaged roads.</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <h2 className="text-2xl font-extrabold tracking-tight">{isRegister ? 'Create your account' : 'Sign in'}</h2>
          <p className="mt-1 text-sm text-steel">
            {isRegister ? 'It takes a minute and lets you track your reports.' : 'Welcome back. Pick up where you left off.'}
          </p>

          <div className="mt-6 space-y-4">
            {isRegister && (
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" className="field" value={form.name} onChange={set('name')} autoComplete="name" required />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="field" value={form.email} onChange={set('email')} autoComplete="email" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field"
                value={form.password}
                onChange={set('password')}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
              {isRegister && <p className="hint">Use at least 8 characters.</p>}
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md bg-[#F8E1DD] px-3 py-2 text-sm font-medium text-brick">
              {error}
            </p>
          )}

          <button className="btn-primary mt-6 w-full" disabled={busy}>
            {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          <p className="mt-5 text-sm text-steel">
            {isRegister ? 'Already have an account?' : 'New to CivicConnect?'}{' '}
            <Link className="font-bold text-ink underline" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
