import { useEffect, useState } from 'react';
import { api } from './api.js';

let cache = null;

export function useMeta() {
  const [meta, setMeta] = useState(cache);
  useEffect(() => {
    if (cache) return;
    api.meta().then((m) => {
      cache = m;
      setMeta(m);
    });
  }, []);

  const categoryLabel = (id) => meta?.categories.find((c) => c.id === id)?.label ?? id;
  const statusLabel = (id) => meta?.statuses.find((s) => s.id === id)?.label ?? id;
  return { meta, categoryLabel, statusLabel };
}

export const STATUS_STYLE = {
  submitted: { text: 'text-steel', bg: 'bg-[#E6EAF0]', dot: 'bg-steel' },
  assigned: { text: 'text-sky', bg: 'bg-[#E2ECF8]', dot: 'bg-sky' },
  in_progress: { text: 'text-signal-deep', bg: 'bg-[#FFF1C2]', dot: 'bg-signal' },
  resolved: { text: 'text-teal', bg: 'bg-[#DDF1EB]', dot: 'bg-teal' },
  rejected: { text: 'text-brick', bg: 'bg-[#F8E1DD]', dot: 'bg-brick' },
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} days ago`;
}
