'use client';

import { useState, useMemo, useEffect } from 'react';
import SectionWrapper from '@/app/components/SectionWrapper';
import AgentPanel from '@/app/components/AgentPanel';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fetchSchedule, type ScheduleResult } from '@/app/lib/bescom-api';

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

function LoadGrid({ zone }: { zone: Zone }) {
  const profile = useMemo(() => getLoadProfile(zone), [zone]);
  const [hovered, setHovered] = useState<number | null>(null);

  const optimalSlots = profile.filter((l) => l === 'optimal' || l === 'low').length;
  const peakSlots = profile.filter((l) => l === 'peak').length;

  return (
    <div className="space-y-4">
      <div className="flex gap-0.5 sm:gap-1 flex-nowrap overflow-x-auto pb-1">
        {profile.map((level, h) => (
          <div
            key={h}
            onMouseEnter={() => setHovered(h)}
            onMouseLeave={() => setHovered(null)}
            className={`relative flex-1 min-w-[18px] rounded-md flex flex-col items-center justify-center cursor-pointer transition-all ${
              LEVEL_STYLES[level].bg
            } ${hovered === h ? 'scale-110 z-10 shadow-md' : ''}`}
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
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-card text-center">
          <div className="stat-value text-emerald-600">{optimalSlots}h</div>
          <div className="stat-label">Optimal window</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-value text-red-500">{peakSlots}h</div>
          <div className="stat-label">Peak hours</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-value text-blue-600">~40%</div>
          <div className="stat-label">Load reduction</div>
        </div>
      </div>
    </div>
  );
}

const REC_COLORS: Record<string, string> = {
  CHARGE: '#10b981',
  PARTIAL: '#f59e0b',
  AVOID: '#ef4444',
};

function LPSchedulePanel({ zone }: { zone: string }) {
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function load(bust = false) {
    setLoading(true);
    setError('');
    fetchSchedule(zone, 500, bust)
      .then((d) => { setResult(d); setLoading(false); })
      .catch(() => { setError('Could not load schedule data.'); setLoading(false); });
  }

  useEffect(() => { load(); }, [zone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="glass-card-static p-4 sm:p-5 flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-xs">Running LP optimizer…</span>
      </div>
    );
  }
  if (error || !result) {
    return (
      <div className="glass-card-static p-4 sm:p-5 flex items-center justify-center h-40">
        <span className="text-red-400 text-xs">{error || 'No data'}</span>
      </div>
    );
  }

  const chartData = result.hourly.map((h) => ({
    hour: `${h.hour}h`,
    'Managed (MW)': h.managed_total_mw,
    'Unmanaged (MW)': h.unmanaged_total_mw,
    fill: REC_COLORS[h.recommendation] ?? '#94a3b8',
  }));

  return (
    <div className="glass-card-static p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xs">⚡</span>
          LP Schedule Optimizer — {zone}
          <span className="badge badge-blue">{result.solver}</span>
        </h3>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1 shrink-0"
        >
          <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-4">Peak shaving · 500 EVs · 7.2 kW avg</p>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: unknown, n: unknown) => [`${v} MW`, n as string]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={result.hourly[0]?.grid_capacity_mw} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Capacity', fontSize: 9, fill: '#ef4444' }} />
          <Bar dataKey="Managed (MW)" fill="#6366f1" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Unmanaged (MW)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Charging windows */}
      {result.charging_windows.length > 0 && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
          <p className="text-xs text-emerald-700 font-medium mb-1">✓ Optimal charging windows:</p>
          <div className="flex flex-wrap gap-1.5">
            {result.charging_windows.map((w) => (
              <span key={w.label} className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-mono">
                {w.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const [zone, setZone] = useState<Zone>('residential');
  const [area, setArea] = useState('Koramangala');

  const scheduleQuery = useMemo(
    () =>
      `Recommend the optimal EV charging schedule for ${area} (${zone} zone) tonight. ` +
      `Include: best charging hours, hours to avoid, expected grid load at each window, ` +
      `cost per kWh if available, and specific tips for this zone type.`,
    [area, zone]
  );

  const loadShiftQuery = useMemo(
    () =>
      `If 60% of EV owners in ${area} (${zone} zone) shift charging from peak hours to off-peak windows, ` +
      `what is the estimated impact on peak grid load? Give numbers: before vs after load (kWh), ` +
      `feeder stress reduction %, and carbon/cost savings.`,
    [area, zone]
  );

  return (
    <div className="page-container">
      <SectionWrapper
        id="schedule"
        title="Charging Schedule Optimizer"
        subtitle="AI-driven recommendations for optimal EV charging times. Reduce peak load, lower electricity costs, and align charging behavior with grid capacity."
        icon="⏱️"
        badge="Part A"
      >
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-medium">Zone Type</label>
            <div className="flex gap-1">
              {ZONES.map((z) => (
                <button
                  key={z}
                  onClick={() => setZone(z)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    zone === z ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-medium">Area (BESCOM Zone)</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {BESCOM_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Explainer */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <span className="text-blue-500 text-lg shrink-0">💡</span>
          <div className="text-sm text-blue-700">
            <strong>How it works:</strong> The BESCOM EV Agent combines LP peak-shaving optimization with
            GradientBoosting demand forecasts to recommend charging windows that minimize peak grid stress.
            No changes to existing distribution infrastructure required.
          </div>
        </div>

        {/* Always-visible primary panels — stacked vertically */}
        <div className="space-y-5 mb-6">
          <div className="glass-card-static p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-amber-500">🕐</span>
              24-Hour Load Profile
              <span className="badge badge-amber ml-auto capitalize">{zone}</span>
            </h3>
            <LoadGrid zone={zone} />
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-xs text-emerald-700 font-medium">
                ✓ Recommended window:{' '}
                {zone === 'residential' ? '11 PM – 6 AM' : zone === 'workplace' ? '6 PM – 8 AM' : '9 PM – 10 AM'}
                {' '}— lowest grid stress, often cheapest tariff
              </p>
            </div>
          </div>

          <LPSchedulePanel zone={area} />
        </div>

        {/* Agent insights — collapsible accordion (lazy loaded, cached per query) */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            AI Insights
          </span>
          <span className="text-[11px] text-slate-400">
            tap to expand · loads on demand · cached 10 min
          </span>
        </div>
        <div className="space-y-2">
          <AgentPanel
            title={`AI Schedule — ${area}`}
            icon="🤖"
            query={scheduleQuery}
            badge="BESCOM Agent"
            minHeight="240px"
            maxHeight="420px"
          />
          <AgentPanel
            title="Load Shift Impact Analysis"
            icon="📉"
            query={loadShiftQuery}
            minHeight="240px"
            maxHeight="420px"
          />
          <AgentPanel
            title="Off-Peak Benefits"
            icon="💰"
            query="What are the financial and grid benefits for EV owners who charge during BESCOM off-peak hours (10 PM - 6 AM)? Give specific numbers: tariff savings per kWh, monthly savings for average EV, grid congestion reduction."
            minHeight="160px"
            maxHeight="320px"
          />
          <AgentPanel
            title="Smart Charging Tips"
            icon="📱"
            query="Give 5 actionable smart charging tips for EV owners in Bangalore to reduce grid impact and save money. Be specific and practical."
            minHeight="160px"
            maxHeight="320px"
          />
          <AgentPanel
            title="Grid Alignment Score"
            icon="🎯"
            query="Rate the current EV charging behavior alignment with BESCOM grid capacity in Bangalore. Give a score out of 100, explain what's good, what's bad, and the top 3 improvements needed."
            minHeight="160px"
            maxHeight="320px"
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
