import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { timeAgo, useMeta } from '../lib/meta.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Figure({ value, label }) {
  return (
    <div className="px-5 py-4 first:pl-0 sm:px-6">
      <p className="text-3xl font-extrabold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-steel">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { meta, categoryLabel } = useMeta();
  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const params = { page, limit: 15 };
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    setData(null);
    api.queue(params).then(setData).catch((e) => setError(e.message));
  }, [filters, page]);

  const setFilter = (k) => (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: e.target.value }));
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {user.department?.name ? `${user.department.name} queue` : 'All reports'}
      </h1>
      <p className="mt-1 text-steel">Open a report to review the evidence and update its status.</p>

      {error && <p role="alert" className="mt-4 text-brick">{error}</p>}

      {stats && (
        <div className="mt-6 flex flex-wrap divide-x divide-line border-y border-line py-1">
          <Figure value={stats.total} label="Total reports" />
          <Figure value={stats.byStatus.submitted} label="Waiting for review" />
          <Figure value={stats.byStatus.assigned + stats.byStatus.in_progress} label="Being handled" />
          <Figure value={stats.byStatus.resolved} label="Resolved" />
          <Figure value={stats.avgResolutionHours == null ? 'None yet' : `${stats.avgResolutionHours} hr`} label="Average time to resolve" />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <div>
          <label className="sr-only" htmlFor="f-status">Filter by status</label>
          <select id="f-status" className="field !w-auto" value={filters.status} onChange={setFilter('status')}>
            <option value="">All statuses</option>
            {meta?.statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="sr-only" htmlFor="f-cat">Filter by category</label>
          <select id="f-cat" className="field !w-auto" value={filters.category} onChange={setFilter('category')}>
            <option value="">All categories</option>
            {meta?.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {!data && !error && <p className="mt-8 text-steel">Loading reports…</p>}

      {data?.items.length === 0 && (
        <p className="mt-8 rounded-md border border-dashed border-steel/50 bg-white p-8 text-center text-steel">
          No reports match these filters.
        </p>
      )}

      {data?.items.length > 0 && (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
          {data.items.map((r) => (
            <li key={r._id}>
              <Link to={`/reports/${r._id}`} className="grid items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-paper sm:grid-cols-[1fr_auto_auto]">
                <div className="min-w-0">
                  <p className="truncate font-bold">{r.title}</p>
                  <p className="truncate text-sm text-steel">
                    {r.ticketId} · {categoryLabel(r.category)}
                    {r.address ? ` · ${r.address}` : ''}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                <p className="text-sm tabular-nums text-steel sm:w-24 sm:text-right">{timeAgo(r.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button className="btn-quiet" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-steel">Page {data.page} of {data.pages}</span>
          <button className="btn-quiet" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
