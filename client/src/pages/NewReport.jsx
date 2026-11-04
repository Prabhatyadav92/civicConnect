import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useMeta } from '../lib/meta.js';
import LocationMap from '../components/LocationMap.jsx';

const MAX_FILES = 4;
const MAX_MB = 20;

export default function NewReport() {
  const navigate = useNavigate();
  const { meta } = useMeta();
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f), video: f.type.startsWith('video') })),
    [files]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  function addFiles(e) {
    setError('');
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const tooBig = picked.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) return setError(`${tooBig.name} is larger than ${MAX_MB} MB`);
    const next = [...files, ...picked];
    if (next.length > MAX_FILES) setError(`You can attach up to ${MAX_FILES} files`);
    setFiles(next.slice(0, MAX_FILES));
  }

  function useMyLocation() {
    setError('');
    if (!navigator.geolocation) return setError('Your browser cannot share its location. Tap the map to drop a pin');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('We could not read your location. Allow location access, or tap the map to drop a pin');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!files.length) return setError('Add at least one photo or video');
    if (!category) return setError('Choose what kind of problem this is');
    if (title.trim().length < 3) return setError('Add a short title, for example "Deep pothole near the bus stop"');
    if (!position) return setError('Set the location with the button or by tapping the map');

    const form = new FormData();
    files.forEach((f) => form.append('media', f));
    form.append('category', category);
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('address', address.trim());
    form.append('lat', position.lat);
    form.append('lng', position.lng);

    setBusy(true);
    try {
      const { report } = await api.createReport(form);
      navigate(`/reports/${report._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-8" noValidate>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Report an issue</h1>
        <p className="mt-1 text-steel">Add a photo, say where it is, and we will send it to the right department.</p>
      </div>

      <fieldset>
        <legend className="label">Photos or video</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={p.url} className="relative aspect-square overflow-hidden rounded-md border border-line bg-white">
              {p.video ? (
                <video src={p.url} className="h-full w-full object-cover" muted />
              ) : (
                <img src={p.url} alt={`Attachment ${i + 1}`} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded bg-ink px-2 py-0.5 text-xs font-bold text-white"
                aria-label={`Remove attachment ${i + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
          {files.length < MAX_FILES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-steel/50 bg-white px-2 text-center text-sm font-semibold text-ink hover:border-ink focus-within:outline focus-within:outline-[3px] focus-within:outline-sky">
              Add photo or video
              <span className="mt-1 text-xs font-normal text-steel">Up to {MAX_FILES}, {MAX_MB} MB each</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" capture="environment" multiple onChange={addFiles} className="sr-only" />
            </label>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">What is the problem?</legend>
        <div className="flex flex-wrap gap-2">
          {(meta?.categories || []).map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-md border px-3.5 py-2 text-sm font-semibold ${
                category === c.id ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="field" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Deep pothole near the bus stop" />
        </div>
        <div>
          <label className="label" htmlFor="desc">Details <span className="font-normal text-steel">(optional)</span></label>
          <textarea id="desc" rows={3} className="field" value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} placeholder="How long has it been there? Is it blocking traffic?" />
        </div>
      </div>

      <fieldset>
        <legend className="label">Where is it?</legend>
        <button type="button" className="btn-dark mb-3" onClick={useMyLocation} disabled={locating}>
          {locating ? 'Finding you…' : position ? 'Update from my location' : 'Use my location'}
        </button>
        <LocationMap position={position} onChange={setPosition} />
        <p className="hint">
          {position ? 'Drag the pin or tap the map to adjust it.' : 'Or tap the map to drop a pin.'}
        </p>
        <div className="mt-3">
          <label className="label" htmlFor="addr">Landmark or address <span className="font-normal text-steel">(optional)</span></label>
          <input id="addr" className="field" value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} placeholder="Opposite the main market gate" />
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-md bg-[#F8E1DD] px-3 py-2 text-sm font-medium text-brick">{error}</p>
      )}

      <button className="btn-primary w-full sm:w-auto sm:px-8" disabled={busy}>
        {busy ? 'Sending report…' : 'Send report'}
      </button>
    </form>
  );
}
