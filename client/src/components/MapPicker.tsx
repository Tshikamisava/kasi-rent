import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

type LatLng = { lat: number; lng: number };

// Use a lightweight div icon so default image assets don't break bundlers
const createDivIcon = (color = "#ff5a5f", pulse = false) =>
  L.divIcon({
    className: "custom-div-icon",
    html: pulse
      ? `<div class="pin" style="position:relative;width:28px;height:28px"><span class="pulse" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)"></span><div style="background:${color};width:16px;height:16px;border-radius:50%;box-shadow:0 6px 18px rgba(2,6,23,0.18);border:2px solid #fff;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)"></div></div>`
      : `<div style="background:${color};width:20px;height:20px;border-radius:50%;box-shadow:0 6px 18px rgba(2,6,23,0.18);border:2px solid #fff"></div>`,
    iconSize: pulse ? [28, 28] : [20, 20],
    iconAnchor: pulse ? [14, 14] : [10, 10],
  });

function MapEvents({ onClick }: { onClick: (pos: LatLng) => void }) {
  const map = useMap();
  useEffect(() => {
    function handler(e: any) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [map, onClick]);
  return null;
}

export default function MapPicker({
  initial = { lat: 6.5244, lng: 3.3792 },
  value,
  onChange,
  radius = 1000,
  extraMarkers = [],
  poiMarkers = [],
  heatPoints = [],
  onMapReady,
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution = '© OpenStreetMap contributors',
  height = 460
}: {
  initial?: LatLng;
  value?: LatLng | null;
  onChange?: (pos: LatLng) => void;
  radius?: number;
  extraMarkers?: Array<{ id?: string; lat: number; lng: number; title?: string; landlordName?: string }>;
  poiMarkers?: Array<{ id?: string; lat: number; lng: number; title?: string }>;
  heatPoints?: Array<[number, number, number]>;
  onMapReady?: (map: any) => void;
  tileUrl?: string;
  tileAttribution?: string;
  height?: number;
}) {
  const [pos, setPos] = useState<LatLng | null>(value ?? null);

  useEffect(() => setPos(value ?? null), [value]);

  function MapReady() {
    const map = useMap();
    useEffect(() => {
      onMapReady && onMapReady(map);
    }, [map]);

    useEffect(() => {
      // fit bounds to include pos and extra markers
      const points: any[] = [];
      if (pos) points.push([pos.lat, pos.lng]);
      extraMarkers.forEach((m) => points.push([m.lat, m.lng]));
      if (points.length > 0) {
        try {
          const bounds = L.latLngBounds(points as any);
          map.fitBounds(bounds.pad(0.2), { maxZoom: 15 });
        } catch (e) {
          // ignore
        }
      }
    }, [pos, extraMarkers]);

    useEffect(() => {
      // marker clustering for extraMarkers + poiMarkers using leaflet.markercluster
      let cluster: any = null;
      try {
        // create a marker cluster group
        // @ts-ignore
        cluster = (L as any).markerClusterGroup ? (L as any).markerClusterGroup() : (L as any).markerClusterGroup?.();
      } catch (e) {
        cluster = null;
      }
      if (!cluster) return;
      // add markers
      extraMarkers.forEach((m) => {
        try {
          const mk = L.marker([m.lat, m.lng], { icon: createDivIcon('#ef4444') });
          if (m.title) mk.bindPopup(`<div style=\"font-weight:700\">${String(m.title)}</div>`);
          cluster.addLayer(mk);
        } catch (e) {}
      });
      // add POI markers too (slightly different color)
      poiMarkers.forEach((m) => {
        try {
          const mk = L.marker([m.lat, m.lng], { icon: createDivIcon('#f59e0b') });
          if (m.title) mk.bindPopup(`<div style="font-weight:700">${String(m.title)}</div>`);
          cluster.addLayer(mk);
        } catch (e) {}
      });
      try { map.addLayer(cluster); } catch (e) {}
      return () => {
        try { map.removeLayer(cluster); cluster.clearLayers(); } catch (e) {}
      };
    }, [map, extraMarkers, poiMarkers]);

    useEffect(() => {
      // optional heatmap using leaflet.heat if heatPoints provided
      let heat: any = null;
      try {
        // @ts-ignore
        if ((L as any).heatLayer && heatPoints && heatPoints.length > 0) {
          // heatPoints expected as [[lat, lng, intensity], ...] or [[lat,lng],...]
          const pts = heatPoints.map((p: any) => Array.isArray(p) ? p : [p[0], p[1]]);
          // @ts-ignore
          heat = (L as any).heatLayer(pts, { radius: 25, blur: 15, maxZoom: 17 });
          map.addLayer(heat);
        }
      } catch (e) {
        heat = null;
      }
      return () => {
        try { if (heat) map.removeLayer(heat); } catch (e) {}
      };
    }, [map, heatPoints]);

    useEffect(() => {
      // add a small scale control for better UX
      try {
        const scale = L.control.scale({ position: 'bottomleft' }).addTo(map);
        return () => { scale.remove(); };
      } catch (e) {
        // ignore
      }
    }, [map]);

    return null;
  }

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(2,6,23,0.08)", height: height, display: 'flex', flexDirection: 'column' }}>
      <MapContainer
        center={pos ?? initial}
        zoom={13}
        style={{ flex: 1, width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        <MapEvents
          onClick={(p) => {
            setPos(p);
            onChange && onChange(p);
          }}
        />
        <MapReady />

        {pos && (
          <>
            <Marker position={[pos.lat, pos.lng]} icon={createDivIcon('#10b981', true)} />
            <Circle center={[pos.lat, pos.lng]} radius={radius} pathOptions={{ color: "#3b82f6", fillColor: '#3b82f6', opacity: 0.6, fillOpacity: 0.08 }} />
          </>
        )}

        {extraMarkers.map((m) => (
          <Marker key={m.id || `${m.lat}-${m.lng}`} position={[m.lat, m.lng]} icon={createDivIcon('#ef4444')}>
            {m.title && (
              <Popup>
                <div style={{ fontWeight: 700 }}>{m.title}</div>
                {m.landlordName ? <div style={{ fontSize: 12, color: '#6b7280' }}>{m.landlordName}</div> : null}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      <div style={{ padding: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#374151" }}>
          <strong>Point:</strong>
          <div style={{ marginTop: 4 }}>
            {pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : "Click on map to choose location"}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#374151", textAlign: "right" }}>
          <div style={{ fontWeight: 600 }}>{(radius/1000).toFixed(2)} km</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Search radius</div>
        </div>
      </div>
      <style>{`\n        .custom-div-icon { display:flex; align-items:center; justify-content:center }\n        .leaflet-container { background: #f8fafc }\n        .custom-div-icon .pin { pointer-events: none }\n        .custom-div-icon .pulse { width:40px; height:40px; border-radius:50%; background: rgba(59,130,246,0.12); animation: pulse 1.6s infinite; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); }\n        @keyframes pulse { 0% { transform: translate(-50%,-50%) scale(0.6); opacity: 0.9 } 70% { transform: translate(-50%,-50%) scale(1.6); opacity: 0 } 100% { opacity: 0 } }\n      `}</style>
    </div>
  );
}
