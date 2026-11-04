import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatDate, useMeta } from '../lib/meta.js';
import StatusBadge from '../components/StatusBadge.jsx';
import StatusTrack from '../components/StatusTrack.jsx';

export default function MyReports() {
  const { categoryLabel } = useMeta();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myReports().then((r) => setReports(r.reports)).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My reports</h1>
          <p className="mt-1 text-steel">Follow each report until it is resolved.</p>
        </div>
        <Link to="/reports/new" className="btn-primary">Report an issue</Link>
      </div>

      {error && <p role="alert" className="mt-6 text-brick">{error}</p>}
      {!reports && !error && <p className="mt-8 text-steel">Loading your reports…</p>}

      {reports?.length === 0 && (
        <div className="mt-8 rounded-md border border-dashed border-steel/50 bg-white p-8 text-center">
          <p className="font-semibold">You have not reported anything yet.</p>
          <p className="mt-1 text-sm text-steel">Spotted a pothole or a broken light? Add a photo and a pin.</p>
          <Link to="/reports/new" className="btn-primary mt-4">Report your first issue</Link>
        </div>
      )}

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
        {reports?.map((r) => (
          <li key={r._id}>
            <Link to={`/reports/${r._id}`} className="block px-5 py-4 hover:bg-paper">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{r.title}</p>
                  <p className="mt-0.5 text-sm text-steel">
                    {r.ticketId} · {categoryLabel(r.category)} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-4">
                <StatusTrack status={r.status} compact />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
