// Shared look for Login, Register, Forgot password and Reset password.

function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
export const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);
export const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const EyeIcon = (p) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
export const EyeOffIcon = (p) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
  </Icon>
);
export const ArrowIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
const MegaphoneIcon = (p) => (
  <Icon {...p}>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
    <path d="M15 9a4 4 0 0 1 0 6" />
    <path d="M18 6.5a8 8 0 0 1 0 11" />
  </Icon>
);
const PinIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);
const UsersIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
  </Icon>
);

function Pin({ className = 'h-9 w-9', dot = '#1d4ed8' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2C7.6 2 4 5.4 4 9.7c0 5.6 6.4 11.4 7.3 12.2.4.3.9.3 1.4 0C13.6 21.1 20 15.3 20 9.7 20 5.4 16.4 2 12 2z"
        fill="currentColor"
      />
      <circle cx="12" cy="9.7" r="3" fill={dot} />
    </svg>
  );
}

const BUILDINGS = [
  [10, 70, 40], [55, 40, 50], [110, 95, 34], [150, 55, 46], [202, 110, 38], [246, 60, 44],
  [296, 80, 36], [338, 45, 52], [396, 100, 40], [442, 65, 46], [494, 85, 38], [538, 50, 52],
];

function Skyline() {
  return (
    <svg
      viewBox="0 0 600 160"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-white"
      aria-hidden="true"
    >
      {BUILDINGS.map(([x, h, w], i) => (
        <rect key={i} x={x} y={160 - h} width={w} height={h} rx="2" fill="currentColor" opacity="0.1" />
      ))}
    </svg>
  );
}

const FEATURES = [
  { label: 'Report issues', FeatureIcon: MegaphoneIcon },
  { label: 'Track progress', FeatureIcon: PinIcon },
  { label: 'Build community', FeatureIcon: UsersIcon },
];

export const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20';
export const leadIconClass =
  'pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600';
export const primaryButtonClass =
  'mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60';

export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-900/30" />

        <div className="relative z-10 flex items-center gap-3">
          <Pin className="h-10 w-10 text-white" />
          <div>
            <p className="text-2xl font-extrabold leading-none tracking-tight">CivicConnect</p>
            <p className="mt-1 text-sm text-blue-100">Together for a Smarter City</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
            Your City.
            <br />
            Our Priority.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-blue-100">
            Report civic issues, track solutions and help build a better community.
          </p>
          <ul className="mt-10 flex gap-8">
            {FEATURES.map(({ label, FeatureIcon }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center text-sm font-semibold">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
                  <FeatureIcon className="h-6 w-6" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-blue-100">
          Potholes, garbage, water leaks, broken streetlights and damaged roads.
        </p>
        <Skyline />
      </section>

      <section className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <Pin className="h-9 w-9 text-blue-600" dot="#ffffff" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">CivicConnect</span>
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl shadow-blue-900/10 sm:p-9">
          {children}
        </div>
      </section>
    </div>
  );
}