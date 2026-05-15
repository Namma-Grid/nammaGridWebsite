'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LocationPicker from '@/app/components/LocationPicker';
import { LOCATIONS, generateRoute } from '@/app/data/ev-routes';
import type { LocationOption, EVRoute } from '@/app/lib/types';

const EVRouteMap = dynamic(() => import('@/app/components/EVRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <span className="text-slate-400 text-sm animate-pulse">Loading map…</span>
    </div>
  ),
});

const DENSITY_LABELS: Record<string, { label: string; dot: string; text: string }> = {
  high: { label: 'Heavy EV traffic — consider alternate', dot: '🔴', text: 'text-red-600' },
  medium: { label: 'Moderate — some wait expected', dot: '🟡', text: 'text-amber-600' },
  low: { label: 'Light traffic — few EVs at stations', dot: '🟢', text: 'text-emerald-600' },
};

const QUICKSTARTS = [
  { fromId: 'mgroad', toId: 'koramangala', label: 'MG Rd → Koramangala' },
  { fromId: 'whitefield', toId: 'ecity', label: 'Whitefield → E-City' },
  { fromId: 'hebbal', toId: 'indiranagar', label: 'Hebbal → Indiranagar' },
];

export default function CitizenRoutesPage() {
  const [origin, setOrigin] = useState<LocationOption | null>(null);
  const [destination, setDestination] = useState<LocationOption | null>(null);
  const [route, setRoute] = useState<EVRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!origin || !destination || origin.id === destination.id) {
      setRoute(null);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    setLoading(true);
    generateRoute(origin.id, destination.id, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) return;
        setRoute(r);
        setLoading(false);
        if (r) setSheetOpen(true);
      })
      .catch(() => {
        // Aborted or network error — generateRoute itself swallows OSRM
        // failures and falls back, so this only catches AbortError.
      });
    return () => { ac.abort(); };
  }, [origin, destination]);

  function swapLocations() {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  }

  const bestStation = route?.stationsOnPath?.[0];
  const totalEvs = route?.segments.reduce((sum, s) => sum + s.evCount, 0) ?? 0;
  const avgDensity = totalEvs > 200 ? 'high' : totalEvs > 80 ? 'medium' : 'low';
  const densityInfo = DENSITY_LABELS[avgDensity];

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 sm:top-16">
      {/* Full-bleed map */}
      <EVRouteMap route={route} loading={loading} />

      {/* Floating search card */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[360px] z-[500]">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-white/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-bold text-slate-800">Plan My Route</h1>
            {(origin || destination) && (
              <button
                onClick={swapLocations}
                aria-label="Swap origin and destination"
                title="Swap"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs transition-colors"
              >
                ⇅
              </button>
            )}
          </div>

          <div className="space-y-2">
            <LocationPicker
              locations={LOCATIONS}
              label="From"
              icon="A"
              accentColor="#059669"
              value={origin}
              onChange={setOrigin}
            />
            <LocationPicker
              locations={LOCATIONS.filter((l) => l.id !== origin?.id)}
              label="To"
              icon="B"
              accentColor="#DC2626"
              value={destination}
              onChange={setDestination}
            />
          </div>

          {/* Quickstart chips — only on empty state */}
          {!route && !loading && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quick start
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICKSTARTS.map(({ fromId, toId, label }) => (
                  <button
                    key={`${fromId}-${toId}`}
                    onClick={() => {
                      const fromLoc = LOCATIONS.find((l) => l.id === fromId);
                      const toLoc = LOCATIONS.find((l) => l.id === toId);
                      if (fromLoc) setOrigin(fromLoc);
                      if (toLoc) setDestination(toLoc);
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Helper hint below card */}
        {!route && !loading && (
          <p className="mt-2 ml-1 text-xs font-medium text-slate-600 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
            Pick origin & destination to see your route →
          </p>
        )}
      </div>

      {/* Bottom sheet — slides up when route found */}
      {sheetOpen && route && (
        <div className="bottom-sheet">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Your Route</h2>
            <button
              onClick={() => setSheetOpen(false)}
              aria-label="Close route details"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
            >
              ×
            </button>
          </div>

          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${avgDensity === 'high' ? 'bg-red-50' : avgDensity === 'medium' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <span className="text-lg">{densityInfo.dot}</span>
            <span className={`text-sm font-medium ${densityInfo.text}`}>{densityInfo.label}</span>
          </div>

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

          {bestStation && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-700 mb-1">⚡ Best Charging Stop on Route</p>
              <p className="text-sm font-bold text-emerald-800">{bestStation.name}</p>
              <p className="text-[11px] text-emerald-600">{bestStation.kw}kW fast charger · {bestStation.operator}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
