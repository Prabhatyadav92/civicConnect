import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, mediaUrl } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime, useMeta } from '../lib/meta.js';
import StatusBadge from '../components/StatusBadge.jsx';
import StatusTrack from '../components/StatusTrack.jsx';
import LocationMap from '../components/LocationMap.jsx';

function StatusPanel({ report, onUpdated }) {
  const { meta, statusLabel } = useMeta();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!meta) return <p className="text-sm text-steel">Loading…</p>;
  const next = meta.transitions[report.status] || [];

  if (next.length === 0) {
    return <p className="text-sm text-steel">This report is {statusLabel(report.status).toLowerCase()} and cannot be changed.</p>;
  }

  async function move(status) {
    setError('');
    setBusy(true);
    try {
      const { report: updated } = await api.updateStatus(report._id, { status, note });
      setNote('');
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="label" htmlFor="note">Note for the citizen <span className="font-normal text-steel">(required to reject)</span></label>
      <textarea id="note" rows={2} className="field" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Crew scheduled for Thursday morning" />
      <div className="mt-3 flex flex-wrap gap-2">
        {next.map((s) => (
          <button key={s} disabled={busy} onClick={() => move(s)} className={s === 'rejected' ? 'btn-quiet text-brick' : 'btn-dark'}>
            {s === 'resolved' ? 'Mark resolved' : s === 'rejected' ? 'Reject report' : `Mark ${statusLabel(s).toLowerCase()}`}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-brick">{error}</p>}
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { categoryLabel } = useMeta();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const isStaff = user.role !== 'citizen';

  useEffect(() => {
    setReport(null);
    api.report(id).then((r) => setReport(r.report)).catch((e) => setError(e.message));
  }, [id]);

  const back = isStaff ? '/dashboard' : '/reports';
  if (error) {
    return (
      <div>
        <p role="alert" className="text-brick">{error}</p>
        <Link to={back} className="mt-4 inline-block font-bold underline">Go back</Link>
      </div>
    );
  }
  if (!report) return <p className="text-steel">Loading report…</p>;

  const [lng, lat] = report.location.coordinates;

  return (
    <div className="space-y-8">
      <div>
        <Link to={back} className="text-sm font-bold text-steel underline">{isStaff ? 'Back to dashboard' : 'Back to my reports'}</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{report.title}</h1>
            <p className="mt-1 text-steel">
              {report.ticketId} · {categoryLabel(report.category)}
              {report.department && ` · ${report.department.name}`}
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </div>

      <section className="rounded-md border border-line bg-white p-5 sm:p-6">
        <StatusTrack status={report.status} />
      </section>

      {isStaff && (
        <section className="rounded-md border-2 border-ink bg-white p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-extrabold">Update status</h2>
          <StatusPanel report={report} onUpdated={setReport} />
        </section>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-extrabold">Evidence</h2>
          <div className="grid grid-cols-2 gap-3">
            {report.media.map((m) =>
              m.kind === 'video' ? (
                <video key={m.url} src={mediaUrl(m.url)} controls className="aspect-square w-full rounded-md border border-line bg-ink object-cover" />
              ) : (
                <a key={m.url} href={mediaUrl(m.url)} target="_blank" rel="noreferrer">
                  <img src={mediaUrl(m.url)} alt={`Photo of ${report.title}`} className="aspect-square w-full rounded-md border border-line object-cover" />
                </a>
              )
            )}
          </div>
          {report.description && <p className="mt-4 whitespace-pre-line leading-relaxed">{report.description}</p>}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-extrabold">Location</h2>
          <LocationMap position={{ lat, lng }} height={240} />
          <p className="mt-2 text-sm text-steel">
            {report.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
          </p>
          {isStaff && (
            <a className="mt-1 inline-block text-sm font-bold underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}>
              Open in OpenStreetMap
            </a>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">History</h2>
        <ol className="space-y-4 border-l-4 border-dashed border-line pl-5">
          {[...report.statusHistory].reverse().map((h, i) => (
            <li key={i} className="relative">
              <span aria-hidden className="absolute -left-[30px] top-1 h-3.5 w-3.5 border-[3px] border-ink bg-signal" />
              <p className="font-bold"><StatusBadge status={h.status} /></p>
              {h.note && <p className="mt-1">{h.note}</p>}
              <p className="mt-0.5 text-xs text-steel">
                {formatDateTime(h.at)}
                {h.by?.name && isStaff ? ` by ${h.by.name}` : ''}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
