import { useMeta } from '../lib/meta.js';

const STEPS = ['submitted', 'assigned', 'in_progress', 'resolved'];

// A dashed road line that fills with road-paint yellow as the report advances.
export default function StatusTrack({ status, compact = false }) {
  const { statusLabel } = useMeta();

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-3" role="img" aria-label="Rejected">
        <div className="road flex-1" style={{ '--road': '#B23A2B' }} />
        <span className="text-xs font-bold text-brick">Rejected</span>
      </div>
    );
  }

  const index = STEPS.indexOf(status);
  const progress = (index / (STEPS.length - 1)) * 100;

  return (
    <div role="img" aria-label={`Status: ${statusLabel(status)}`}>
      <div className="relative">
        <div className="road" />
        <div className="road absolute left-0 top-0" style={{ width: `${progress}%`, '--road': '#F5B800' }} />
        <div className="absolute inset-x-0 -top-1.5 flex justify-between">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-[16px] w-[16px] border-[3px] border-ink ${i <= index ? 'bg-signal' : 'bg-white'}`}
            />
          ))}
        </div>
      </div>
      {!compact && (
        <ol className="mt-3 flex justify-between text-xs">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`${i === 0 ? 'text-left' : i === STEPS.length - 1 ? 'text-right' : 'text-center'} ${
                i <= index ? 'font-bold text-ink' : 'text-steel'
              }`}
            >
              {statusLabel(s)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
