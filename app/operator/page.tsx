'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import gridData from '@/bangalore-hex-grid.json';
import type { HexCell } from '@/app/lib/types';

const HexGridMap = dynamic(() => import('@/app/components/HexGridMap'), {
  ssr: false,
  loading: () => (
    <div className="h-80 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center animate-pulse">
      <span className="text-slate-400 text-sm">Loading grid map…</span>
    </div>
  ),
});

function enrichCells(rawCells: typeof gridData.grid): HexCell[] {
  return rawCells.map((cell) => {
    const seed = cell.h3Index.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const demandLevel = Math.round(
      (cell.zone === 'workplace' ? 40 : cell.zone === 'marketplace' ? 50 : 25) + ((seed % 50) - 10)
    );
    return { ...cell, demanded: demandLevel > 55, demandLevel: Math.max(0, Math.min(100, demandLevel)), evCount: Math.floor(5 + (seed % 30)) } as HexCell;
  });
}

const KPI_DATA = [
  {
    label: 'Current Grid Load',
    value: '847 MW',
    delta: '↑ 12% vs last week',
    up: true,
    icon: '⚡',
    color: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    label: 'Active EV Sessions (est.)',
    value: '14,302',
    delta: '↑ 8.4% today',
    up: true,
    icon: '🔌',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Peak Stress Zones',
    value: '7',
    delta: '↓ 2 resolved today',
    up: false,
    icon: '⚠️',
    color: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Avg. Charging Efficiency',
    value: '73.4%',
    delta: '↑ 4.1% with smart scheduling',
    up: true,
    icon: '📈',
    color: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
];

const IMPACT_METRICS = [
  { value: '₹2.1Cr', label: 'saved in grid stress costs this month (projected)', icon: '💰' },
  { value: '340 MWh', label: 'demand shifted off-peak via smart scheduling', icon: '🔋' },
  { value: '23 zones', label: 'flagged for infrastructure expansion', icon: '📍' },
  { value: '61%', label: 'reduction in unmanaged peak load vs baseline', icon: '📉' },
];

const SEED_ALERTS = [
  { level: '🔴', time: '18:42', zone: 'Koramangala', msg: 'Peak threshold exceeded (94%)', age: 0 },
  { level: '🟡', time: '18:38', zone: 'Whitefield', msg: 'EV density up 23% in last hour', age: 4 },
  { level: '🟢', time: '18:30', zone: 'Indiranagar', msg: 'Load normalized post-scheduling', age: 12 },
  { level: '🔴', time: '18:25', zone: 'Electronic City', msg: 'Transformer near capacity', age: 17 },
  { level: '🟡', time: '18:18', zone: 'HSR Layout', msg: 'EV charging sessions up 31%', age: 24 },
  { level: '🟢', time: '18:10', zone: 'Hebbal', msg: 'Demand within forecast range', age: 32 },
  { level: '🟡', time: '18:05', zone: 'Yeshwanthpur', msg: 'Grid stress score 71/100', age: 37 },
  { level: '🔴', time: '17:58', zone: 'Marathahalli', msg: 'Substation load at 88%', age: 44 },
];

const DYNAMIC_ALERTS = [
  { level: '🔴', zone: 'Jayanagar', msg: 'New peak event — 97% utilization' },
  { level: '🟢', zone: 'Bannerghatta Rd', msg: 'Load balanced via LP optimizer' },
  { level: '🟡', zone: 'BTM Layout', msg: 'EV uptick — 18% above forecast' },
  { level: '🔴', zone: 'Rajajinagar', msg: 'Feeder approaching limit' },
];

export default function OperatorOverview() {
  const cells = useMemo(() => enrichCells(gridData.grid), []);
  const [alerts, setAlerts] = useState(SEED_ALERTS);
  const feedRef = useRef<HTMLDivElement>(null);
  const alertIdx = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newAlert = {
        ...DYNAMIC_ALERTS[alertIdx.current % DYNAMIC_ALERTS.length],
        time: timeStr,
        age: 0,
      };
      alertIdx.current++;
      setAlerts((prev) => [newAlert, ...prev.slice(0, 11)]);
      if (feedRef.current) feedRef.current.scrollTop = 0;
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page-container operator-content-offset">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="badge badge-blue">Live · Auto-refreshes</span>
          <span className="text-xs text-slate-400">As of {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Grid Command Center</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time BESCOM grid status, EV demand intelligence, and infrastructure alerts.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI_DATA.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center text-xl mb-3`}>{kpi.icon}</div>
            <div className={`kpi-value ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 mb-1 leading-tight">{kpi.label}</div>
            <div className={kpi.up ? 'kpi-delta-up' : 'kpi-delta-down'}>{kpi.delta}</div>
          </div>
        ))}
      </div>

      {/* Map + Alert feed */}
      <div className="grid gap-5 lg:grid-cols-[1fr_380px] mb-6">
        {/* Hex grid map */}
        <div className="glass-card-static p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs">⬡</span>
              Live Hex Grid — Bengaluru (1,519 cells)
            </h2>
            <Link href="/operator/demand" className="text-xs text-blue-600 hover:underline">Full analysis →</Link>
          </div>
          <div className="flex gap-4 mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Elevated</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />Critical</span>
          </div>
          <HexGridMap cells={cells} />
        </div>

        {/* Alert feed */}
        <div className="glass-card-static p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-base">🔔</span>
              Live Alert Feed
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">auto-updates 30s</span>
          </div>
          <div ref={feedRef} className="alert-feed flex-1 overflow-y-auto" style={{ maxHeight: '380px' }}>
            <div className="px-3 py-2 border-b border-white/5">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">TIME — ZONE — STATUS</span>
            </div>
            {alerts.map((a, i) => (
              <div key={i} className="alert-row">
                <span className="text-base shrink-0">{a.level}</span>
                <span className="text-slate-600 font-mono shrink-0">{a.time}</span>
                <span className="text-slate-300 font-semibold shrink-0">{a.zone}:</span>
                <span className="text-slate-500">{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact strip */}
      <div className="impact-strip">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-400 text-lg">💚</span>
          <h2 className="text-white font-bold text-sm">Monthly Impact Summary</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 font-medium">Projected</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPACT_METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-xl font-extrabold text-white font-mono">{m.value}</div>
              <div className="text-xs text-slate-400 mt-1 leading-tight">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/operator/demand', label: 'Demand & Grid Analysis', icon: '📊', color: 'hover:border-blue-300 hover:bg-blue-50' },
          { href: '/operator/infrastructure', label: 'Infrastructure Planner', icon: '🏗️', color: 'hover:border-purple-300 hover:bg-purple-50' },
          { href: '/operator/schedule', label: 'Schedule Optimizer', icon: '⏱️', color: 'hover:border-emerald-300 hover:bg-emerald-50' },
        ].map((link) => (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white transition-all ${link.color}`}>
            <span className="text-2xl">{link.icon}</span>
            <span className="text-sm font-semibold text-slate-700">{link.label}</span>
            <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
