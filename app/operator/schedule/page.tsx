'use client';

import { useState, useMemo, useEffect } from 'react';
import SectionWrapper from '@/app/components/SectionWrapper';
import AgentPanel from '@/app/components/AgentPanel';
import StatusBadge from '@/app/components/shared/StatusBadge';
import SkeletonCard from '@/app/components/shared/SkeletonCard';
import { fetchSchedule, type ScheduleResult } from '@/app/lib/bescom-api';
import { MOCK_SCHEDULE } from '@/app/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const ZONES = ['residential', 'workplace', 'marketplace'] as const;
type Zone = typeof ZONES[number];

const BESCOM_AREAS = [
  'Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar', 'HSR Layout',
  'Marathahalli', 'Electronic City', 'Hebbal', 'Yeshwanthpur', 'Bannerghatta Road',
];

type LoadLevel = 'peak' | 'high' | 'moderate' | 'low' | 'optimal';

function getLoadProfile(zone: Zone): LoadLevel[] {
  return Array.from({ length: 24 }, (_, h): LoadLevel => {
    if (zone === 'residential') {
      if (h >= 18 && h <= 21) return 'peak';
      if (h >= 7 && h <= 9) return 'high';
      if (h >= 10 && h <= 17) return 'moderate';
      if (h >= 22 && h <= 23) return 'low';
      return 'optimal';
    }
    if (zone === 'workplace') {
      if (h >= 9 && h <= 11) return 'peak';
      if (h >= 12 && h <= 17) return 'high';
      if (h >= 7 && h <= 8) return 'moderate';
      if (h >= 18 && h <= 22) return 'low';
      return 'optimal';
    }
    if (h >= 12 && h <= 15) return 'peak';
    if (h >= 16 && h <= 20) return 'high';
    if (h >= 10 && h <= 11) return 'moderate';
    if (h >= 21 && h <= 23) return 'low';
    return 'optimal';
  });
}

const LEVEL_STYLES: Record<LoadLevel, { bg: string; text: string; label: string }> = {
  peak:     { bg: 'bg-red-500',     text: 'text-red-700',     label: 'Peak' },
  high:     { bg: 'bg-orange-400',  text: 'text-orange-700',  label: 'High' },
  moderate: { bg: 'bg-amber-300',   text: 'text-amber-700',   label: 'Moderate' },
  low:      { bg: 'bg-sky-300',     text: 'text-sky-700',     label: 'Low' },
  optimal:  { bg: 'bg-emerald-400', text: 'text-emerald-700', label: 'Optimal ✓' },
};

const REC_COLORS: Record<string, string> = { CHARGE: '#10b981', PARTIAL: '#f59e0b', AVOID: '#ef4444' };

function WhatIfSimulator() {
  const [adoption, setAdoption] = useState(30);
  const baseLoad = 847;
  const peakIncrease = ((adoption / 100) * baseLoad * 0.18).toFixed(1);
  const infraCost = ((adoption / 100) * 18 * 1.2).toFixed(1);
  const smartPenetration = Math.min(95, Math.round(40 + adoption * 0.7));

  return (
    <div className="glass-card-static p-5 mt-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs">🔮</span>
        What-If Scenario Planner
        <span className="badge badge-blue ml-auto">Grid Impact Simulator</span>
      </h3>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-slate-600 font-medium">EV Adoption Rate</label>
          <span className="text-sm font-bold text-blue-600 font-mono">{adoption}%</span>
        </div>
        <input
          type="range" min={10} max={80} step={5}
          value={adoption}
          onChange={(e) => setAdoption(Number(e.target.value))}
          className="whatif-slider w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>10%</span><span>80%</span></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <div className="stat-value text-red-500">+{peakIncrease} MW</div>
          <div className="stat-label">Projected peak load increase</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-value text-amber-600">₹{infraCost}Cr</div>
          <div className="stat-label">Additional infrastructure cost</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-value text-blue-600">{smartPenetration}%</div>
          <div className="stat-label">Recommended smart charging penetration</div>
        </div>
      </div>
    </div>
  );
}

export default function OperatorSchedulePage() {
  const [zone, setZone] = useState<Zone>('residential');
  const [area, setArea] = useState('Koramangala');
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const profile = useMemo(() => getLoadProfile(zone), [zone]);
  const optimalSlots = profile.filter((l) => l === 'optimal' || l === 'low').length;

  useEffect(() => {
    setLoading(true);
    fetchSchedule(area, 500)
      .then((d) => { setResult(d); setFromFallback(false); })
      .catch(() => { setResult(MOCK_SCHEDULE); setFromFallback(true); })
      .finally(() => setLoading(false));
  }, [area]);

  const chartData = result?.hourly.map((h) => ({
    hour: `${h.hour}h`,
    'Managed (MW)': h.managed_total_mw,
    'Unmanaged (MW)': h.unmanaged_total_mw,
  }));

  const scheduleQuery = useMemo(() => `Recommend the optimal EV charging schedule for ${area} (${zone} zone) tonight. Include best charging hours, hours to avoid, expected grid load, and tips.`, [area, zone]);
  const loadShiftQuery = useMemo(() => `If 60% of EV owners in ${area} (${zone} zone) shift charging to off-peak windows, what is the estimated peak grid load impact? Give numbers.`, [area, zone]);

  return (
    <div className="page-container">
      <SectionWrapper id="schedule" title="Charging Schedule Optimizer" subtitle="LP-optimized smart charging schedules. Reduce peak load, lower costs, and align with grid capacity." icon="⏱️" badge="Part A">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block font-medium">Zone Type</label>
            <div className="flex gap-1">
              {ZONES.map((z) => (
                <button key={z} onClick={() => setZone(z)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${zone === z ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{z}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block font-medium">BESCOM Zone</label>
            <select value={area} onChange={(e) => setArea(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              {BESCOM_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <StatusBadge fromFallback={fromFallback} />
        </div>

        {/* Split layout */}
        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          {/* Left: LP results */}
          <div className="space-y-4">
            {/* KPIs */}
            {loading ? <SkeletonCard lines={4} height="160px" /> : result && (
              <div className="grid grid-cols-3 gap-2">
                <div className="stat-card text-center">
                  <div className="stat-value text-emerald-600">{result.peak_reduction_pct}%</div>
                  <div className="stat-label">Peak reduction</div>
                </div>
                <div className="stat-card text-center">
                  <div className="stat-value text-blue-600">{result.managed_peak_mw} MW</div>
                  <div className="stat-label">Managed peak</div>
                </div>
                <div className="stat-card text-center">
                  <div className="stat-value text-amber-600">{result.unmanaged_peak_mw} MW</div>
                  <div className="stat-label">Unmanaged peak</div>
                </div>
              </div>
            )}

            {/* LP chart */}
            {loading ? <SkeletonCard lines={5} height="220px" /> : chartData && (
              <div className="glass-card-static p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Managed vs Unmanaged Load</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {result && <ReferenceLine y={result.hourly[0]?.grid_capacity_mw} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Cap', fontSize: 9, fill: '#ef4444' }} />}
                    <Bar dataKey="Managed (MW)" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Unmanaged (MW)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {result?.charging_windows && result.charging_windows.length > 0 && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-xs text-emerald-700 font-medium mb-1">✓ Optimal charging windows:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.charging_windows.map((w) => (
                        <span key={w.label} className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-mono">{w.label}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: load heatmap + AI panels */}
          <div className="space-y-4">
            {/* 24h load heatmap */}
            <div className="glass-card-static p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="text-amber-500">🕐</span>
                24-Hour Load Profile
                <span className="badge badge-amber ml-auto capitalize">{zone}</span>
                <span className="text-xs text-emerald-600 font-medium">{optimalSlots}h optimal</span>
              </h3>
              <div className="flex gap-0.5 sm:gap-1 flex-nowrap overflow-x-auto pb-1 mb-3">
                {profile.map((level, h) => (
                  <div
                    key={h}
                    onMouseEnter={() => setHovered(h)}
                    onMouseLeave={() => setHovered(null)}
                    className={`relative flex-1 min-w-[18px] rounded-md flex flex-col items-center justify-center cursor-pointer transition-all ${LEVEL_STYLES[level].bg} ${hovered === h ? 'scale-110 z-10 shadow-md' : ''}`}
                    style={{ aspectRatio: '0.7' }}
                  >
                    <span className="text-white font-bold" style={{ fontSize: '7px' }}>{h}</span>
                    {hovered === h && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-20 pointer-events-none">
                        {h.toString().padStart(2, '0')}:00 — {LEVEL_STYLES[level].label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {(Object.entries(LEVEL_STYLES) as [LoadLevel, typeof LEVEL_STYLES[LoadLevel]][]).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm inline-block ${v.bg}`} />
                    <span className={v.text}>{v.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* AI insights in 2-col grid */}
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">AI Insights</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <AgentPanel title={`AI Schedule — ${area}`} icon="🤖" query={scheduleQuery} badge="BESCOM Agent" minHeight="180px" maxHeight="340px" />
              <AgentPanel title="Load Shift Impact" icon="📉" query={loadShiftQuery} minHeight="180px" maxHeight="340px" />
              <AgentPanel title="Off-Peak Benefits" icon="💰" query="What are the financial and grid benefits for EV owners charging during BESCOM off-peak hours (10 PM - 6 AM)? Give specific numbers." minHeight="160px" maxHeight="300px" />
              <AgentPanel title="Smart Charging Tips" icon="📱" query="Give 5 actionable smart charging tips for EV owners in Bangalore to reduce grid impact and save money." minHeight="160px" maxHeight="300px" />
            </div>
          </div>
        </div>

        {/* What-if simulator */}
        <WhatIfSimulator />
      </SectionWrapper>
    </div>
  );
}
