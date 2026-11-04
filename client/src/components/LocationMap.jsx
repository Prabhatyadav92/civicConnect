import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

const pin = L.divIcon({
  className: 'cc-pin',
  html: '<span></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const [dLat, dLng] = (import.meta.env.VITE_DEFAULT_CENTER || '20.5937,78.9629').split(',').map(Number);

const TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [position?.lat, position?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function ClickToPlace({ onChange }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

// Interactive when onChange is given, read-only otherwise.
export default function LocationMap({ position, onChange, height = 280 }) {
  const interactive = Boolean(onChange);
  const center = position ? [position.lat, position.lng] : [dLat, dLng];

  return (
    <MapContainer
      center={center}
      zoom={position ? 16 : 5}
      scrollWheelZoom={false}
      dragging
      style={{ height, width: '100%' }}
      className="rounded-md border border-line"
    >
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      {interactive && <ClickToPlace onChange={onChange} />}
      {interactive && <Recenter position={position} />}
      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={pin}
          draggable={interactive}
          eventHandlers={
            interactive
              ? {
                  dragend: (e) => {
                    const ll = e.target.getLatLng();
                    onChange({ lat: ll.lat, lng: ll.lng });
                  },
                }
              : undefined
          }
        />
      )}
    </MapContainer>
  );
}
