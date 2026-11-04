import { STATUS_STYLE, useMeta } from '../lib/meta.js';

export default function StatusBadge({ status }) {
  const { statusLabel } = useMeta();
  const s = STATUS_STYLE[status] || STATUS_STYLE.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-bold ${s.bg} ${s.text}`}>
      <span aria-hidden className={`h-2 w-2 ${s.dot}`} />
      {statusLabel(status)}
    </span>
  );
}
