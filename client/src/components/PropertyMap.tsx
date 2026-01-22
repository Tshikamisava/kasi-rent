import { useEffect, useState, useRef } from "react";
import MapPicker from "./MapPicker";

type Prop = {
  id: number | string;
  title?: string;
  location?: string;
  landlord?: any;
};

type Marker = {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  location?: string;
};

const geocode = async (q: string) => {
  const cached = localStorage.getItem(`geo:${q}`);
  if (cached) return JSON.parse(cached);

  // quick parse: if query looks like "lat,lng" use it directly
  const coordMatch = String(q).trim().match(/^\s*([-+]?\d{1,3}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const out = { lat, lng };
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
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      // validate numeric coords — return null on invalid values to avoid NaN
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      const out = { lat, lng };
      localStorage.setItem(`geo:${q}`, JSON.stringify(out));
      return out;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const PropertyMap = ({ properties }: { properties: Prop[] }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const mapRef = useRef<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [proximity, _setProximity] = useState('');
  const [suggestions, setSuggestions] = useState<Array<any>>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestTimer = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [tileUrl, setTileUrl] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const [tileAttribution, setTileAttribution] = useState('© OpenStreetMap contributors');
  const [poiType, setPoiType] = useState<string>('school');
  const [poiRadius, setPoiRadius] = useState<number>(1000);
  const [poiMarkers, _setPoiMarkers] = useState<Array<{id:string;lat:number;lng:number;title?:string}>>([]);
  const [heatEnabled, setHeatEnabled] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results: Marker[] = [];
      for (const p of properties) {
        const loc = p.location ?? p.landlord?.address ?? p.landlord?.location;
        if (!loc) continue;
        const g = await geocode(loc);
        if (g && Number.isFinite(g.lat) && Number.isFinite(g.lng)) {
          results.push({ id: p.id, lat: g.lat, lng: g.lng, title: p.title, location: loc });
        }
      }
      if (!mounted) return;
      // keep any previously-added manual markers as well
      setMarkers((prev) => {
        // merge by id (preserve prev manual markers not present in results)
        const byId = new Map<string | number, Marker>();
        prev.forEach(m => byId.set(m.id, m));
        results.forEach(m => byId.set(m.id, m));
        return Array.from(byId.values());
      });
      if (results.length > 0) {
        const avgLat = results.reduce((s, r) => s + r.lat, 0) / results.length;
        const avgLng = results.reduce((s, r) => s + r.lng, 0) / results.length;
        if (Number.isFinite(avgLat) && Number.isFinite(avgLng)) {
          setCenter({ lat: avgLat, lng: avgLng });
        } else {
          setCenter(null);
        }
      } else {
        setCenter(null);
      }
    })();
    return () => { mounted = false; };
  }, [properties]);

  // focus the dropdown search input when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      setTimeout(() => { try { searchInputRef.current?.focus(); } catch(e) {} }, 50);
    }
  }, [showDropdown]);

  // suggestions: debounce searchQuery to fetch place suggestions from Nominatim
  useEffect(() => {
    if (suggestTimer.current) {
      window.clearTimeout(suggestTimer.current);
      suggestTimer.current = null;
    }
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    suggestTimer.current = window.setTimeout(async () => {
      try {
        const q = searchQuery.trim();
        const propMatches = propertyOptions.filter(p => ((p.title || '') + ' ' + (p.location || '')).toLowerCase().includes(q.toLowerCase())).slice(0,5).map(p => ({ title: p.title, display_name: p.location }));
        const mapboxKey = (import.meta as any).env?.VITE_MAPBOX_KEY;
        let places: any[] = [];
        if (mapboxKey) {
          try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?limit=5&access_token=${encodeURIComponent(mapboxKey)}`);
            const data = await res.json();
            places = (data && data.features) ? data.features.map((f: any) => ({ display_name: f.place_name, lat: f.center && f.center[1], lon: f.center && f.center[0], type: (f.place_type && f.place_type[0]) || f.properties?.category })) : [];
          } catch (e) {
            places = [];
          }
        } else {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`);
            places = await res.json();
          } catch (e) {
            places = [];
          }
        }
        const combined = [...propMatches, ...places];
        setSuggestions(combined.slice(0,6));
      } catch (e) {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
    return () => { if (suggestTimer.current) { window.clearTimeout(suggestTimer.current); suggestTimer.current = null; } };
  }, [searchQuery]);

  // when center is updated from parent geocoding results, move the map to that center
  useEffect(() => {
    if (center && mapRef.current) {
      try { mapRef.current.flyTo([center.lat, center.lng], 13); } catch (e) {}
    }
  }, [center]);

  // helper to add a marker from a free-form address
  const addMarkerFromAddress = async (q: string, idHint?: string | number, title?: string) => {
    if (!q) return null;
    const g = await geocode(q);
    if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lng)) return null;
    const newMarker: Marker = { id: idHint ?? `addr-${q}-${Date.now()}`, lat: g.lat, lng: g.lng, title: title ?? q, location: q };
    setMarkers((prev) => {
      const exists = prev.find(m => String(m.id) === String(newMarker.id));
      if (exists) return prev.map(m => String(m.id) === String(newMarker.id) ? newMarker : m);
      return [...prev, newMarker];
    });
    setSelectedId(newMarker.id);
    setCenter({ lat: g.lat, lng: g.lng });
    try { mapRef.current?.flyTo?.([g.lat, g.lng], 15); } catch(e) {}
    return newMarker;
  };

  const defaultCenter = { lat: 6.5244, lng: 3.3792 };

  // if no markers, show a fallback marker at default center so the map isn't empty
  const displayMarkers = markers.length > 0 ? markers : [{ id: 'fallback', lat: defaultCenter.lat, lng: defaultCenter.lng, title: 'No properties found', location: '' }];
  const extraMarkers = displayMarkers.map((m) => ({ id: String(m.id), lat: m.lat, lng: m.lng, title: m.title, landlordName: '' }));

  // properties as dropdown options (use location/title)
  // build a best-effort address string from property or landlord fields
  const buildAddressFromProperty = (p: any) => {
    if (!p) return null;
    // prefer explicit location field
    if (p.location && String(p.location).trim()) return String(p.location).trim();
    // prefer landlord.address if present
    const landlord = p.landlord ?? {};
    if (landlord.address && String(landlord.address).trim()) return String(landlord.address).trim();
    // otherwise compose from known parts
    const parts = [landlord.street, landlord.town, landlord.city, landlord.region, landlord.state, landlord.postcode].filter(Boolean).map(String);
    if (parts.length > 0) return parts.join(', ');
    return null;
  };

  const propertyOptions = properties.map(p => ({ id: p.id, title: p.title ?? `${p.location ?? ''}`, location: buildAddressFromProperty(p) }));

  // compute haversine distance (meters)
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => v * Math.PI / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 relative">
        <div className="overflow-hidden rounded-lg border border-border">
          <MapPicker
            height={360}
            initial={center ?? defaultCenter}
            value={selectedId ? (markers.find(m => m.id === selectedId) ? { lat: markers.find(m => m.id === selectedId)!.lat, lng: markers.find(m => m.id === selectedId)!.lng } : null) : (center ?? defaultCenter)}
            onChange={() => {}}
            radius={1000}
            extraMarkers={extraMarkers}
            poiMarkers={poiMarkers}
            heatPoints={heatEnabled ? poiMarkers.map(p => [p.lat, p.lng, 0.8]) : []}
            onMapReady={(map) => { mapRef.current = map; }}
            tileUrl={tileUrl}
            tileAttribution={tileAttribution}
          />
        </div>

        {/* Floating controls: compact toggle button and expanded control panel */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowDropdown(s => !s)}
              aria-label="Toggle map controls"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#111827',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(2,6,23,0.12)',
                cursor: 'pointer'
              }}
            >
              🔍
            </button>

            {showDropdown && (
              <div style={{ width: 420, background: 'white', borderRadius: 12, boxShadow: '0 12px 40px rgba(2,6,23,0.12)', overflow: 'hidden' }}>
                <div style={{ padding: 12, borderBottom: '1px solid #eef2f7' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title or location"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #eef2f7' }}
                      onKeyDown={async (e) => {
                        if (e.key !== 'Enter') return;
                        const q = searchQuery.trim();
                        if (!q) return;
                        const propMatch = propertyOptions.find(p => ((p.title || '') + ' ' + (p.location || '')).toLowerCase().includes(q.toLowerCase()));
                        if (propMatch) {
                          setShowDropdown(false);
                          const loc = propMatch.location;
                          if (loc) {
                            const query = proximity ? `${loc} near ${proximity}` : loc;
                            const added = await addMarkerFromAddress(query, propMatch.id, propMatch.title);
                            if (added) { try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch(e) {} }
                          }
                          return;
                        }
                        const markerMatch = displayMarkers.find(m => ((m.title || '') + ' ' + (m.location || '')).toLowerCase().includes(q.toLowerCase()));
                        if (markerMatch) {
                          setSelectedId(markerMatch.id);
                          setShowDropdown(false);
                          try { mapRef.current?.flyTo([markerMatch.lat, markerMatch.lng], 15); } catch(e) {}
                          return;
                        }
                        setShowDropdown(false);
                        const fullQ = proximity ? `${q} near ${proximity}` : q;
                        const added = await addMarkerFromAddress(fullQ);
                        if (added) { try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch(e) {} }
                      }}
                    />
                    <button onClick={() => { setSearchQuery(''); }} style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#f3f4f6', cursor: 'pointer' }}>Clear</button>
                  </div>
                </div>

                {/* suggestions (properties + nominatim) */}
                <div style={{ padding: 8, borderBottom: '1px solid #eef2f7' }}>
                  {suggestLoading ? <div style={{ fontSize: 13, color: '#6b7280' }}>Searching...</div> : null}
                  {suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {suggestions.map((s, i) => (
                        <div key={i} onClick={async () => {
                          setShowDropdown(false);
                          const q = s.lat && s.lon ? `${s.lat},${s.lon}` : s.display_name || s.title || s.name || '';
                          const title = s.display_name || s.title || s.name || s.label;
                          if (!q) return;
                          const added = await addMarkerFromAddress(q, undefined, title);
                          if (added) try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch(e) {}
                        }} style={{ padding: '8px 10px', cursor: 'pointer', borderRadius: 8 }}>
                          <div style={{ fontWeight: 700 }}>{s.title || s.display_name || s.name}</div>
                          {s.type && <div style={{ fontSize: 12, color: '#6b7280' }}>{s.type}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                  <div style={{ maxHeight: 260, overflow: 'auto' }}>
                  <div style={{ padding: 12, borderBottom: '1px solid #eef2f7' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Properties</div>
                    {propertyOptions.filter(p => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (p.title || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q);
                    }).map(p => (
                      <div key={String(p.id)} onClick={async () => {
                        setShowDropdown(false);
                        const loc = p.location;
                        if (!loc) return;
                        const query = proximity ? `${loc} near ${proximity}` : loc;
                        const added = await addMarkerFromAddress(query, p.id, p.title);
                        if (added) {
                          try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch (e) {}
                          setTimeout(() => { try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch(e) {} }, 250);
                        }
                      }} style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f7', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 700 }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{p.location}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Map Markers</div>
                    {displayMarkers.filter(m => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (m.title || '').toLowerCase().includes(q) || (m.location || '').toLowerCase().includes(q);
                    }).map(m => (
                      <div key={String(m.id)} onClick={() => { setSelectedId(m.id); setShowDropdown(false); try { mapRef.current?.flyTo([m.lat, m.lng], 15); } catch(e) {} }} style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f7', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 700 }}>{m.title || m.location}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{m.location}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 12, borderTop: '1px solid #eef2f7', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={addressQuery} onChange={(e) => setAddressQuery(e.target.value)} placeholder="Search address or coords (lat,lng)" style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #eef2f7', flex: 1 }} />
                  <button onClick={async () => { if (!addressQuery) return; const q = proximity ? `${addressQuery} near ${proximity}` : addressQuery; await addMarkerFromAddress(q); setAddressQuery(''); setShowDropdown(false); }} style={{ padding: '8px 12px', borderRadius: 10, background: '#111827', color: '#fff', cursor: 'pointer' }}>Find</button>
                </div>

                {/* POI / Heatmap controls */}
                <div style={{ padding: 12, borderTop: '1px solid #eef2f7', display: 'flex', gap: 8, alignItems: 'center', flexDirection: 'column' }}>
                  <div style={{ width: '100%', display: 'flex', gap: 8 }}>
                    <select value={poiType} onChange={(e) => setPoiType(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1px solid #eef2f7' }}>
                      <option value="school">School</option>
                      <option value="clinic">Clinic</option>
                      <option value="hospital">Hospital</option>
                      <option value="supermarket">Supermarket</option>
                      <option value="place_of_worship">Place of worship</option>
                    </select>
                    <select value={String(poiRadius)} onChange={(e) => setPoiRadius(Number(e.target.value))} style={{ width: 120, padding: '8px 10px', borderRadius: 10, border: '1px solid #eef2f7' }}>
                      <option value={500}>500m</option>
                      <option value={1000}>1km</option>
                      <option value={2000}>2km</option>
                      <option value={5000}>5km</option>
                    </select>
                  </div>
                  <div style={{ width: '100%', display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={heatEnabled} onChange={(e) => setHeatEnabled(e.target.checked)} /> <span style={{ fontSize: 13 }}>Show heatmap</span>
                    </label>
                    <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>{poiMarkers.length} POIs</div>
                  </div>
                </div>

                <div style={{ padding: 12, display: 'flex', gap: 8, borderTop: '1px solid #eef2f7' }}>
                  <button onClick={() => { setTileUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'); setTileAttribution('© OpenStreetMap contributors'); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: tileUrl.includes('openstreetmap') ? '2px solid #111827' : '1px solid #e6edf3', background: tileUrl.includes('openstreetmap') ? '#111827' : '#fff', color: tileUrl.includes('openstreetmap') ? '#fff' : '#111827', cursor: 'pointer' }}>OSM</button>
                  <button onClick={() => { setTileUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'); setTileAttribution('Tiles © Esri'); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: tileUrl.includes('arcgis') ? '2px solid #111827' : '1px solid #e6edf3', background: tileUrl.includes('arcgis') ? '#111827' : '#fff', color: tileUrl.includes('arcgis') ? '#fff' : '#111827', cursor: 'pointer' }}>Satellite</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected marker info panel (scoped to map column) */}
        {selectedId && (() => {
          const sel = markers.find(m => m.id === selectedId);
          if (!sel) return null;
          return (
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 60 }}>
              <div style={{ background: 'white', padding: 12, borderRadius: 10, boxShadow: '0 10px 30px rgba(2,6,23,0.08)', minWidth: 220 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{sel.title || sel.location}</div>
                <div style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{sel.location}</div>
                <div style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>Lat: {sel.lat.toFixed(5)}, Lng: {sel.lng.toFixed(5)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { try { mapRef.current?.flyTo([sel.lat, sel.lng], 15); } catch(e) {} }} style={{ padding: '8px 10px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Center</button>
                  <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${sel.lat},${sel.lng}`, '_blank')} style={{ padding: '8px 10px', borderRadius: 8, background: '#fff', border: '1px solid #e6edf3', cursor: 'pointer' }}>Open in Google Maps</button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      <div className="lg:col-span-1 space-y-2">
        {properties.map((p) => {
          const locStr = buildAddressFromProperty(p) ?? p.location ?? p.landlord?.address ?? p.landlord?.location;
          const markerForP = markers.find(m => String(m.id) === String(p.id));
          // choose distance reference: selected marker or center
          let distanceText: string | null = null;
          const refPoint = selectedId ? markers.find(m => m.id === selectedId) : (center ? { lat: center.lat, lng: center.lng } : null);
          if (markerForP && refPoint) {
            const meters = haversine(refPoint.lat, refPoint.lng, markerForP.lat, markerForP.lng);
            if (meters >= 1000) distanceText = `${(meters/1000).toFixed(1)} km`;
            else distanceText = `${Math.round(meters)} m`;
          }
          const thumb = (p as any).image_url || ((p as any).images && (p as any).images[0]) || '/property-placeholder.png';
          return (
            <button
              key={String(p.id)}
              onClick={async () => {
                if (!locStr) return;
                const query = proximity ? `${locStr} near ${proximity}` : locStr;
                const added = await addMarkerFromAddress(query, p.id, p.title);
                if (added) {
                  try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch(e) {}
                  setTimeout(() => { try { mapRef.current?.flyTo([added.lat, added.lng], 15); } catch(e) {} }, 250);
                }
              }}
              className="w-full text-left p-3 rounded-lg bg-card hover:shadow flex gap-3 items-center"
            >
              <img src={thumb} alt={p.title} className="w-16 h-12 rounded object-cover flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium">{p.title || locStr}</div>
                <div className="text-sm text-muted-foreground">{locStr}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{(p as any).price ? `R${(p as any).price?.toLocaleString()}` : ''}</div>
                {distanceText && <div className="text-sm text-muted-foreground">{distanceText}</div>}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default PropertyMap;
