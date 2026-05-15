'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LocationPicker from '@/app/components/LocationPicker';
import { LOCATIONS, generateRoute } from '@/app/data/ev-routes';
import type { LocationOption, EVRoute } from '@/app/lib/types';

const EVRouteMap = dynamic(() => import('@/app/components/EVRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-280px)] min-h-[400px] rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center animate-pulse">
      <span className="text-slate-400 text-sm">Loading map…</span>
    </div>
  ),
});

const DENSITY_LABELS: Record<string, { label: string; dot: string; text: string }> = {
  high: { label: 'Heavy EV traffic — consider alternate', dot: '🔴', text: 'text-red-600' },
  medium: { label: 'Moderate — some wait expected', dot: '🟡', text: 'text-amber-600' },
  low: { label: 'Light traffic — few EVs at stations', dot: '🟢', text: 'text-emerald-600' },
};

export default function CitizenRoutesPage() {
  const [origin, setOrigin] = useState<LocationOption | null>(null);
  const [destination, setDestination] = useState<LocationOption | null>(null);
  const [route, setRoute] = useState<EVRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!origin || !destination || origin.id === destination.id) { setRoute(null); return; }
    let cancelled = false;
    setLoading(true);
    generateRoute(origin.id, destination.id).then((r) => {
      if (cancelled) return;
      setRoute(r);
      setLoading(false);
      if (r) setSheetOpen(true);
    });
    return () => { cancelled = true; };
  }, [origin, destination]);

  function swapLocations() {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  }

  const bestStation = route?.stationsOnPath?.[0];
  const totalEvs = route?.segments?.reduce((sum, s) => sum + s.evCount, 0) ?? 0;
  const avgDensity = totalEvs > 200 ? 'high' : totalEvs > 80 ? 'medium' : 'low';
  const densityInfo = DENSITY_LABELS[avgDensity];

  return (
    <div style={{ paddingTop: '3.5rem' }}>
      {/* Top card: location picker */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100 shadow-sm sticky top-14 z-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-base font-bold text-slate-800 mb-3">Plan My Route</h1>
          <div className="flex items-center gap-2">
            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <LocationPicker
                locations={LOCATIONS}
                label="From"
                icon="A"
                accentColor="#059669"
                value={origin}
                onChange={setOrigin}
              />
              <button
                onClick={swapLocations}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                title="Swap"
              >
                ⇅
              </button>
              <LocationPicker
                locations={LOCATIONS.filter((l) => l.id !== origin?.id)}
                label="To"
                icon="B"
                accentColor="#DC2626"
                value={destination}
                onChange={setDestination}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map — full remaining viewport */}
      <div style={{ height: 'calc(100vh - 200px)' }}>
        <EVRouteMap route={route} loading={loading} />
      </div>

      {/* Default state — shown before any route is selected */}
      {!route && !loading && (
        <div className="px-4 py-4 bg-white border-t border-slate-100 shadow-lg">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">📍 How to use</p>
              <p>Select a starting point and destination above, then your route will load automatically.</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 space-y-1">
              <p className="font-bold text-blue-800 mb-1">💡 Did you know?</p>
              <p>• Whitefield and Electronic City corridors have the highest EV density in Bengaluru — expect longer waits at stations there during 6–9 PM</p>
              <p>• Koramangala and Indiranagar have the best charger-to-EV ratio in central Bengaluru</p>
              <p>• Plan your route before 5 PM to see real-time station availability</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">🔋 Quickstart suggestions</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { fromId: 'mgroad', toId: 'koramangala', label: 'MG Road → Koramangala' },
                  { fromId: 'whitefield', toId: 'ecity', label: 'Whitefield → Electronic City' },
                  { fromId: 'hebbal', toId: 'indiranagar', label: 'Hebbal → Indiranagar' },
                ].map(({ fromId, toId, label }) => (
                  <button
                    key={`${fromId}-${toId}`}
                    onClick={() => {
                      const fromLoc = LOCATIONS.find((l) => l.id === fromId);
                      const toLoc = LOCATIONS.find((l) => l.id === toId);
                      if (fromLoc) setOrigin(fromLoc);
                      if (toLoc) setDestination(toLoc);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet — slides up when route found */}
      {sheetOpen && route && (
        <div className="bottom-sheet">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Your Route</h2>
            <button onClick={() => setSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">×</button>
          </div>

          {/* Traffic indicator */}
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${avgDensity === 'high' ? 'bg-red-50' : avgDensity === 'medium' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <span className="text-lg">{densityInfo.dot}</span>
            <span className={`text-sm font-medium ${densityInfo.text}`}>{densityInfo.label}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">{route.distance ? `${route.distance.toFixed(1)} km` : `${route.segments.length} hops`}</div>
              <div className="text-[11px] text-slate-500">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{route.estimatedTime ? `${Math.round(route.estimatedTime)} min` : `~${route.segments.length * 8} min`}</div>
              <div className="text-[11px] text-slate-500">Est. time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{route.stationsOnPath.length}</div>
              <div className="text-[11px] text-slate-500">Charging stops</div>
            </div>
          </div>

          {/* Best station recommendation */}
          {bestStation && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-700 mb-1">⚡ Best Charging Stop on Route</p>
              <p className="text-sm font-bold text-emerald-800">{bestStation.name}</p>
              <p className="text-[11px] text-emerald-600">{bestStation.kw}kW fast charger · {bestStation.operator} · Est. wait: &lt;5 min · 0.3 km off-route</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
