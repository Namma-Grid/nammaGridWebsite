'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import TripPlanner from '@/app/components/citizen/TripPlanner';
import { LOCATIONS, generateRoute, getRouteInsights } from '@/app/data/ev-routes';
import type { LocationOption, EVRoute } from '@/app/lib/types';

const EVRouteMap = dynamic(() => import('@/app/components/EVRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <span className="text-slate-400 text-xs font-mono tracking-wider uppercase animate-pulse">Loading map</span>
    </div>
  ),
});

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
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; moved: boolean } | null>(null);

  function onHandlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = { startY: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onHandlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    if (Math.abs(dy) > 4) d.moved = true;
    if (sheetRef.current) {
      // Soft live feedback: only allow drag in the "open" direction relative to current state
      const clamped = sheetCollapsed
        ? Math.max(-140, Math.min(20, dy))
        : Math.max(-20, Math.min(140, dy));
      sheetRef.current.style.transform = `translateY(${clamped}px)`;
      sheetRef.current.style.transition = 'none';
    }
  }

  function onHandlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    const moved = d.moved;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)';
      sheetRef.current.style.transform = '';
    }
    if (!moved) {
      setSheetCollapsed((c) => !c);
      return;
    }
    if (sheetCollapsed && dy < -30) setSheetCollapsed(false);
    else if (!sheetCollapsed && dy > 30) setSheetCollapsed(true);
  }

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
        if (r) {
          setSheetOpen(true);
          setSheetCollapsed(false);
        }
      })
      .catch(() => {
        /* AbortError */
      });
    return () => {
      ac.abort();
    };
  }, [origin, destination]);

  function swapLocations() {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  }

  const bestStation = route?.stationsOnPath?.[0];
  const maxEvs = route ? Math.max(...route.segments.map((s) => s.evCount), 1) : 1;
  const peakRatio = route ? Math.max(...route.segments.map((s) => s.evCount / maxEvs)) : 0;
  const peakLabel = peakRatio > 0.66 ? 'Heavy' : peakRatio > 0.33 ? 'Moderate' : 'Light';
  const peakColorClass =
    peakRatio > 0.66 ? 'text-rose-600' : peakRatio > 0.33 ? 'text-amber-600' : 'text-emerald-600';
  const insights = route ? getRouteInsights(route) : [];

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 sm:top-16 flex flex-col bg-slate-50">
      {/* Map fills the remaining space above the sheet */}
      <div className="flex-1 relative min-h-0">
        <EVRouteMap route={route} loading={loading} />

        {/* Floating search card */}
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[380px] z-[500]">
          <div
            className="relative rounded-2xl p-4 sm:p-5 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              boxShadow:
                '0 1px 2px rgba(15,23,42,0.06), 0 12px 40px -8px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
              border: '1px solid rgba(15,23,42,0.06)',
            }}
          >
            {/* Soft brand-tinted corner glow */}
            <div
              aria-hidden
              className="absolute -top-12 -left-12 w-32 h-32 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(16,185,129,0.18), transparent 70%)',
              }}
            />

            {/* Eyebrow */}
            <div className="relative flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.14em]">
                Trip planner
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Live</span>
              </div>
            </div>

            <TripPlanner
              locations={LOCATIONS}
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwap={swapLocations}
            />

            {/* Quickstart chips — empty state */}
            {!route && !loading && (
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Try
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
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-medium hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom sheet — slides up when route found */}
      {sheetOpen && route && (
        <div
          ref={sheetRef}
          className={`bottom-sheet relative ${sheetCollapsed ? 'is-collapsed' : ''}`}
        >
          {/* Density bar across the very top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] flex overflow-hidden rounded-t-[20px] pointer-events-none">
            {route.segments.map((seg, i) => {
              const r = seg.evCount / maxEvs;
              const color =
                r > 0.66
                  ? '#e11d48'
                  : r > 0.33
                  ? '#f59e0b'
                  : '#10b981';
              return (
                <div
                  key={i}
                  className="h-full"
                  style={{ flex: 1, background: color, opacity: 0.85 }}
                />
              );
            })}
          </div>

          {/* Drag handle — full-width hit target */}
          <button
            type="button"
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
            aria-label={sheetCollapsed ? 'Expand route details' : 'Collapse route details'}
            className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            style={{ touchAction: 'none' }}
          >
            <span className="w-10 h-1 rounded-full bg-slate-300 transition-colors group-hover:bg-slate-400" />
          </button>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 mt-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-0.5">
                Your route
              </p>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {route.origin.name}
                <span className="text-slate-400 font-normal mx-1.5">→</span>
                {route.destination.name}
              </h2>
            </div>
            <button
              onClick={() => setSheetOpen(false)}
              aria-label="Close route details"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Stat label="Distance" value={route.distance.toFixed(1)} unit="km" />
            <Stat label="Drive time" value={Math.round(route.estimatedTime)} unit="min" />
            <Stat label="Stops" value={route.stationsOnPath.length} unit="chargers" />
            <Stat label="Traffic" value={peakLabel} valueClass={peakColorClass} />
          </div>

          {/* Collapsible content — hidden when sheet is collapsed */}
          <div className="sheet-collapsible">
            {/* Best charging stop — accent stripe, not full wash */}
            {bestStation && (
              <div className="relative pl-3 py-2 mb-3">
                <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-emerald-500" />
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">
                  Best charging stop
                </p>
                <p className="text-sm font-semibold text-slate-900">{bestStation.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {bestStation.kw} kW · {bestStation.operator}
                </p>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  On this route
                </p>
                <ul className="space-y-1.5">
                  {insights.map((ins) => (
                    <li
                      key={ins.id}
                      className="flex items-start gap-2 text-[12px] leading-snug text-slate-700"
                    >
                      <span
                        aria-hidden
                        className={`mt-[6px] w-1.5 h-1.5 rounded-full shrink-0 ${
                          ins.severity === 'warning'
                            ? 'bg-amber-500'
                            : ins.severity === 'positive'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{ins.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  valueClass = 'text-slate-900',
}: {
  label: string;
  value: string | number;
  unit?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-0.5">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-lg font-medium tabular-nums tracking-tight ${valueClass}`}>
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
