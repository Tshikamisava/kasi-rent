import React, { useMemo, useState, useEffect, useRef } from "react";
import MapPicker from "../components/MapPicker";
import { supabase } from "../lib/supabase";

type PropItem = { id: string; title: string; location?: string; lat?: number; lng?: number; landlordName?: string };

const MOCK_PROPERTIES: PropItem[] = [
  { id: "p1", title: "Cozy 1BR in Lekki", location: "Lekki, Lagos", lat: 6.4414, lng: 3.4516 },
  { id: "p2", title: "Spacious 2BR in VI", location: "Victoria Island, Lagos", lat: 6.4270, lng: 3.4216 },
  { id: "p3", title: "Studio near Yaba", location: "Yaba, Lagos", lat: 6.5110, lng: 3.3840 },
];

async function geocodeAddress(query: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": "KasiRent/1.0" } });
    const data = await res.json();
    if (data && data.length) {
      const first = data[0];
      return { lat: Number(first.lat), lng: Number(first.lon) };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default function MapSearch() {
  const [options, setOptions] = useState<PropItem[]>(MOCK_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<string | "custom">("custom");
  const [landlordAddress, setLandlordAddress] = useState<string | null>(null);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [mapInstance, setMapInstance] = useState<any | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Prefer server API which now includes landlord info
        const res = await fetch('/api/properties?limit=200');
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            const mapped = data.map((r: any) => ({
              id: r.id,
              title: r.title,
              location: r.address ?? r.location ?? r.landlord?.address ?? r.landlord?.location,
              lat: r.latitude ? Number(r.latitude) : undefined,
              lng: r.longitude ? Number(r.longitude) : undefined,
              landlordName: r.landlord?.name ?? r.landlord?.email
            }));
            setOptions(mapped);
            return;
          }
        }

        // Fallback to Supabase or mock if server API fails
        try {
          const { data, error } = await supabase.from("properties").select("id,title,location").limit(200);
          if (!error && data && data.length && mounted) {
            const mapped = data.map((r: any) => ({ id: r.id, title: r.title, location: r.location }));
            setOptions(mapped);
          }
        } catch (e) {
          // ignore and keep mock
        }
      } catch (e) {
        // ignore and keep mock
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const selected = useMemo(() => options.find((p) => p.id === selectedProperty), [options, selectedProperty]);

  async function handleSelect(id: string) {
    setSelectedProperty(id as any);
    if (id === "custom") {
      setPoint(null);
      return;
    }
    const item = options.find((o) => o.id === id);
    if (!item) return;
    // capture landlord address if present
    setLandlordAddress(item.location ?? null);
    if (item.lat && item.lng) {
      setPoint({ lat: item.lat, lng: item.lng });
      // center map when available
      if (mapInstance) {
        try { mapInstance.flyTo([item.lat, item.lng], 15); } catch (e) {}
      }
      return;
    }
    // if the item has a location string, geocode it
    if (item.location) {
      const coords = await geocodeAddress(item.location);
      if (coords) {
        // update cache
        setOptions((prev) => prev.map((p) => (p.id === id ? { ...p, lat: coords.lat, lng: coords.lng } : p)));
        setPoint(coords);
        if (mapInstance) {
          try { mapInstance.flyTo([coords.lat, coords.lng], 15); } catch (e) {}
        }
        return;
      }
    }
    // fallback: try geocoding title
    const coords = await geocodeAddress(item.title);
    if (coords) {
      setOptions((prev) => prev.map((p) => (p.id === id ? { ...p, lat: coords.lat, lng: coords.lng } : p)));
      setPoint(coords);
      if (mapInstance) {
        try { mapInstance.flyTo([coords.lat, coords.lng], 15); } catch (e) {}
      }
    }
  }

  async function runSearch() {
    const target = point;
    if (!target) {
      alert('Please select a point on the map or choose a property');
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search/nearby?lat=${target.lat}&lng=${target.lng}&radius=${radius/1000}`);
      const data = await res.json();
      if (data && data.properties) {
        setResults(data.properties);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleMapReady(map: any) {
    setMapInstance(map);
  }

  const selectedProperties = options.filter((o) => selectedIds.includes(o.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function centerOn(p: any) {
    if (!mapInstance) return;
    try { mapInstance.flyTo([p.lat, p.lng], 15); } catch (e) {}
  }

  function openGoogle(p: any) {
    const url = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    window.open(url, '_blank');
  }

  // Ensure selected properties have coordinates (geocode if missing)
  useEffect(() => {
    let mounted = true;
    (async () => {
      for (const id of selectedIds) {
        const item = options.find((o) => o.id === id);
        if (!item) continue;
        if ((item.lat === undefined || item.lng === undefined) && mounted) {
          // try geocode by location then title
          let coords = null;
          if (item.location) coords = await geocodeAddress(item.location);
          if (!coords) coords = await geocodeAddress(item.title);
          if (coords && mounted) {
            setOptions((prev) => prev.map((p) => (p.id === id ? { ...p, lat: coords.lat, lng: coords.lng } : p)));
          }
        }
      }
    })();
    return () => { mounted = false };
  }, [selectedIds]);


  return (
    <div style={{ maxWidth: 1100, margin: "32px auto", padding: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Search properties on map</h2>
          <p style={{ marginTop: 8, color: "#6b7280" }}>Select a landlord/property address from the dropdown on the map, or click anywhere on the map to choose a custom location.</p>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>Results preview</div>
            <div style={{ display: "grid", gap: 8 }}>
              {options.slice(0, 8).map((p) => (
                <div key={p.id} style={{ padding: 12, borderRadius: 8, border: "1px solid #e6edf3" }}>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{p.location ?? "Address unavailable"}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>Search results</div>
              {searching && <div style={{ color: '#6b7280' }}>Searching nearby properties…</div>}
              {!searching && results.length === 0 && <div style={{ color: '#6b7280' }}>No results yet — run a search.</div>}
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {results.map((r: any) => {
                  const lat = r.latitude != null ? Number(r.latitude) : (r.lat ?? r.latitude);
                  const lng = r.longitude != null ? Number(r.longitude) : (r.lng ?? r.longitude);
                  function handleKey(e: React.KeyboardEvent) {
                    const k = e.key.toLowerCase();
                    if (k === 'enter' || k === 'c') {
                      if (lat != null && lng != null) centerOn({ lat, lng }); else alert('Location not available for this property');
                    } else if (k === 'g') {
                      if (lat != null && lng != null) openGoogle({ lat, lng }); else alert('Location not available for this property');
                    }
                  }

                  return (
                    <div
                      key={r.id}
                      tabIndex={0}
                      onKeyDown={handleKey}
                      onFocus={() => setFocusedId(r.id)}
                      onBlur={() => setFocusedId((cur) => (cur === r.id ? null : cur))}
                      style={{ padding: 12, borderRadius: 8, border: '1px solid #e6edf3', outline: focusedId === r.id ? '2px solid rgba(59,130,246,0.25)' : 'none' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700 }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{r.distance_km} km</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#374151' }}>{r.address ?? r.location}</div>
                      {r.landlord && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Landlord: {r.landlord.name ?? r.landlord.email}</div>}

                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { if (lat != null && lng != null) centerOn({ lat, lng }); else alert('Location not available for this property'); }}
                          title="Center map on this property"
                          aria-label="Center on map"
                          style={{ padding: '6px 10px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                          </svg>
                          Center
                        </button>

                        <button
                          onClick={() => { if (lat != null && lng != null) openGoogle({ lat, lng }); else alert('Location not available for this property'); }}
                          title="Open property in Google Maps"
                          aria-label="Open in Google Maps"
                          style={{ padding: '6px 10px', borderRadius: 8, background: '#fff', border: '1px solid #e6edf3', cursor: 'pointer', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#db4437' }}>
                            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          Open in Google Maps
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: 520, position: "relative" }}>
          {/* Top overlay dropdown on map */}
          <div style={{ position: "absolute", zIndex: 40, left: 12, top: 12, right: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: 'flex', flex: 1, gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }} ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((s) => !s)}
                  aria-haspopup="listbox"
                  aria-expanded={showDropdown}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(15,23,42,0.08)', background: 'white', boxShadow: '0 6px 18px rgba(2,6,23,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', paddingRight: 8 }}>
                    {selectedProperty === 'custom' ? 'Search by custom point' : (options.find(o => o.id === selectedProperty)?.landlordName ? `${options.find(o => o.id === selectedProperty)?.landlordName} — ${options.find(o => o.id === selectedProperty)?.title}` : (options.find(o => o.id === selectedProperty)?.title ?? 'Select property'))}
                  </span>
                  <span style={{ marginLeft: 8 }}>▾</span>
                </button>

                {showDropdown && (
                  <div role="listbox" style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)', zIndex: 60, background: 'white', borderRadius: 10, boxShadow: '0 10px 30px rgba(2,6,23,0.08)', maxHeight: 220, overflow: 'auto' }}>
                    {loading ? (
                      <div style={{ padding: 12 }}>Loading addresses...</div>
                    ) : (
                      options.map((p) => (
                        <div key={p.id} role="option" tabIndex={0} onClick={() => { handleSelect(p.id); setShowDropdown(false); }} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (handleSelect(p.id), setShowDropdown(false))} style={{ padding: 10, borderBottom: '1px solid #eef2f7', cursor: 'pointer' }}>
                          <div style={{ fontWeight: 700 }}>{p.landlordName ? `${p.landlordName} — ${p.title}` : p.title}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{p.location}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {landlordAddress && <div style={{ position: 'absolute', left: 8, bottom: -36, background: 'rgba(255,255,255,0.95)', padding: '6px 8px', borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.06)', fontSize: 12 }}>{landlordAddress}</div>}
              </div>

              <select
                multiple
                value={selectedIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o: any) => o.value);
                  setSelectedIds(opts);
                }}
                style={{ width: 160, padding: 10, borderRadius: 10, border: '1px solid rgba(15,23,42,0.08)', background: 'white', boxShadow: '0 6px 18px rgba(2,6,23,0.06)', height: 48 }}
              >
                {loading ? <option>Loading addresses...</option> : options.map((p) => (
                  <option value={p.id} key={p.id}>{(p.landlordName ? `${p.landlordName} — ` : '')}{p.title}{p.location ? ` — ${p.location}` : ''}</option>
                ))}
              </select>
            </div>

            <div style={{ background: "white", padding: 8, borderRadius: 10, boxShadow: "0 6px 18px rgba(2,6,23,0.06)", display: "flex", gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: "#374151", minWidth: 78, textAlign: "center", fontWeight: 600 }}>{(radius/1000).toFixed(2)} km</div>
              <input
                aria-label="Radius km"
                type="range"
                min={0.5}
                max={20}
                step={0.5}
                value={radius / 1000}
                onChange={(e) => setRadius(Math.round(Number(e.target.value) * 1000))}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  const target = point ?? (selected && selected.lat && selected.lng ? { lat: selected.lat, lng: selected.lng } : null);
                  if (!target) return alert('No point selected to open in map');
                  const url = `https://www.google.com/maps/search/?api=1&query=${target.lat},${target.lng}`;
                  window.open(url, '_blank');
                }}
                style={{ padding: '8px 12px', borderRadius: 10, background: '#111827', color: '#fff', border: 'none', boxShadow: '0 6px 18px rgba(2,6,23,0.08)', cursor: 'pointer' }}
              >
                Open Map
              </button>
            </div>
          </div>

          <MapPicker
            initial={selected ? (selected.lat && selected.lng ? { lat: selected.lat, lng: selected.lng } : undefined) : undefined}
            value={point ?? (selected && selected.lat && selected.lng ? { lat: selected.lat, lng: selected.lng } : null)}
            onChange={(p) => {
              setSelectedProperty("custom");
              setPoint(p);
            }}
            radius={radius}
            extraMarkers={selectedProperties.map(s => ({ id: s.id, lat: s.lat!, lng: s.lng!, title: s.title, landlordName: s.landlordName }))}
            onMapReady={handleMapReady}
          />
        </div>
      </div>
    </div>
  );
}
