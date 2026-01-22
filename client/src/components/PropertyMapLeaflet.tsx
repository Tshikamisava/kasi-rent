import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Prop = { id: string | number; title?: string; location?: string };

const geocode = async (q: string) => {
  const cached = localStorage.getItem(`geo:${q}`);
  if (cached) return JSON.parse(cached);
  // quick parse: if query looks like "lat,lng" use it directly
  const coordMatch = String(q).trim().match(/^\s*([-+]?\d{1,3}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const out = { lat, lon };
      localStorage.setItem(`geo:${q}`, JSON.stringify(out));
      return out;
    }
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data[0]) {
      const out = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      localStorage.setItem(`geo:${q}`, JSON.stringify(out));
      return out;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const PropertyMapLeaflet: React.FC<{ properties: Prop[]; height?: number }> = ({ properties, height = 360 }) => {
  const [markers, setMarkers] = useState<Array<{ id: string | number; lat: number; lon: number; title?: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res: Array<{ id: string | number; lat: number; lon: number; title?: string }> = [];
      for (const p of properties) {
        if (!p.location) continue;
        const g = await geocode(p.location);
        if (g) res.push({ id: p.id, lat: g.lat, lon: g.lon, title: p.title });
      }
      if (!mounted) return;
      setMarkers(res);
    })();
    return () => { mounted = false; };
  }, [properties]);

  if (markers.length === 0) {
    return (
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Map unavailable — no geocodable locations found.</p>
      </div>
    );
  }

  const center = [markers[0].lat, markers[0].lon] as [number, number];

  return (
    <div className="mb-8 rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lon]} icon={defaultIcon as any}>
            <Popup>
              <div className="font-medium">{m.title}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMapLeaflet;
