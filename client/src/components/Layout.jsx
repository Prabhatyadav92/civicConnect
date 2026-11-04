import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const isCitizen = user.role === 'citizen';

  return (
    <div className="min-h-screen">
      <header className="bg-ink">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-md bg-signal">
              <span className="block h-0.5 w-4 bg-ink" style={{ boxShadow: '0 -5px 0 #14213D, 0 5px 0 #14213D' }} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">CivicConnect</span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main">
            {isCitizen ? (
              <>
                <NavLink to="/reports" end className={linkClass}>My reports</NavLink>
                <NavLink to="/reports/new" className={linkClass}>Report an issue</NavLink>
              </>
            ) : (
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm text-white/80">
            <span className="hidden sm:inline">
              {user.name}
              {user.department?.name ? `, ${user.department.name}` : ''}
            </span>
            <button onClick={logout} className="rounded-md border border-white/30 px-3 py-1.5 font-semibold text-white hover:bg-white/10">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
