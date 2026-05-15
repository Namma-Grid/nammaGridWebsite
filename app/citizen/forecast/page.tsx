'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceArea,
} from 'recharts';
import { fetchForecast, type ForecastRow } from '@/app/lib/bescom-api';
import { MOCK_FORECAST } from '@/app/lib/mock-data';
import { queryAgent } from '@/app/lib/agent';
import MarkdownView from '@/app/components/MarkdownView';
import StatusBadge from '@/app/components/shared/StatusBadge';

const ZONES = [
  'Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar', 'HSR Layout',
  'Marathahalli', 'Electronic City', 'Hebbal', 'Yeshwanthpur', 'Bannerghatta Road',
];

const DUMMY_TIPS: Record<string, string> = {
  'Koramangala': '💡 Best time to charge in Koramangala: **11 PM – 2 AM**. Off-peak tariff saves you ₹45 per session. Avoid 6–9 PM when 78% of stations show high wait times.',
  'Whitefield': '💡 Whitefield sweet spot: **5–7 AM** — minimal queues and off-peak rates. Evening peak (5–8 PM) adds 15+ min wait and costs ₹38 more. Pre-charge overnight where possible.',
  'Indiranagar': '💡 In Indiranagar, charge between **10 PM – 12 AM** for the lowest rates. Avoid 7–9 PM rush — station utilisation hits 91% during that window, expect a 12 min wait.',
  'Jayanagar': '💡 Jayanagar off-peak window: **Midnight – 5 AM**. You can save up to ₹52 vs peak-hour charging. Morning commuters should pre-charge the night before.',
  'HSR Layout': '💡 HSR Layout best window: **11 PM – 1 AM**. Grid demand drops 60% after 10 PM, cutting your cost by ₹40. Avoid Tuesday and Thursday evenings (tech-park peak).',
  'Marathahalli': '💡 Marathahalli tip: charge **Saturday mornings 6–8 AM** for cheapest rates (₹3.8/kWh vs ₹6.1 peak). Weekday evenings 5–8 PM are extremely congested — avoid if possible.',
  'Electronic City': '💡 Electronic City shift workers: **2–4 AM** is nearly always off-peak — ₹35–50 savings per session. Phase 1 stations have shorter queues than Phase 2 during shift changeover.',
  'Hebbal': '💡 Hebbal tip: **Sunday 7–9 AM** offers the cheapest and least congested window. Airport-bound EVs create a midday spike — avoid 11 AM–1 PM on weekdays.',
  'Yeshwanthpur': '💡 Yeshwanthpur sweet spot: **10 PM – Midnight**. Railway station traffic clears by 9:30 PM, freeing 40% of station capacity. Save ₹38 vs evening peak.',
  'Bannerghatta Road': '💡 Bannerghatta Road tip: charge on **weekday mornings 6–8 AM**. Zoo and park traffic spikes on weekends — avoid Saturday 10 AM – 4 PM for shorter waits and lower cost.',
};

function DemandMeter({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const config = {
    Low: { color: 'text-emerald-600', ring: 'border-emerald-400', fill: 'bg-emerald-500', pct: '30%', icon: '✅', msg: 'Great time to charge!' },
    Medium: { color: 'text-amber-600', ring: 'border-amber-400', fill: 'bg-amber-400', pct: '60%', icon: '⚠️', msg: 'Moderate wait expected' },
    High: { color: 'text-red-600', ring: 'border-red-400', fill: 'bg-red-500', pct: '90%', icon: '🚫', msg: 'Busy — try later if possible' },
  }[level];

  return (
    <div className="glass-card-static p-5 flex items-center gap-5">
      <div className={`relative w-20 h-20 rounded-full border-4 ${config.ring} flex items-center justify-center shrink-0`}>
        <div className={`absolute bottom-0 left-0 right-0 rounded-full ${config.fill} opacity-20`} style={{ height: config.pct }} />
        <div className="text-center z-10">
          <div className="text-2xl">{config.icon}</div>
          <div className={`text-xs font-bold ${config.color}`}>{level}</div>
        </div>
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Current Demand Level</h3>
        <p className={`text-sm font-medium ${config.color}`}>{config.msg}</p>
        <p className="text-xs text-slate-500 mt-1">Based on real-time grid data</p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FriendlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  const congestion = v > 70 ? 'High' : v > 45 ? 'Medium' : 'Low';
  const wait = v > 70 ? '15+ min' : v > 45 ? '5-10 min' : '<5 min';
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-700">{label}:00</p>
      <p className="text-slate-500">Congestion: <span className={v > 70 ? 'text-red-600' : v > 45 ? 'text-amber-600' : 'text-emerald-600'}>{congestion}</span></p>
      <p className="text-slate-500">Expected wait: {wait}</p>
    </div>
  );
}

export default function CitizenForecastPage() {
  const [zone, setZone] = useState('Koramangala');
  const [rows, setRows] = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);
  const [tip, setTip] = useState(DUMMY_TIPS['Koramangala']);
  const [tipLoading, setTipLoading] = useState(false);
  const [isTipLive, setIsTipLive] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchForecast(zone, 24)
      .then((d) => { setRows(d); setFromFallback(false); })
      .catch(() => { setRows(MOCK_FORECAST); setFromFallback(true); })
      .finally(() => setLoading(false));
    // Reset tip to zone-specific dummy when zone changes
    setTip(DUMMY_TIPS[zone] ?? `💡 Best time to charge in ${zone}: 11 PM – 2 AM. Avoid evening peak (6–9 PM) to save ₹40+ per session.`);
    setIsTipLive(false);
  }, [zone]);

  function refreshTip() {
    if (tipLoading) return;
    setTipLoading(true);
    queryAgent(
      `In 2-3 sentences, give a simple charging tip for an EV owner in ${zone} today. Include the best time window and estimated cost savings. Use friendly language, no jargon.`
    )
      .then((t) => { setTip(t); setIsTipLive(true); })
      .catch(() => { /* keep existing tip on error */ })
      .finally(() => setTipLoading(false));
  }

  const currentHour = new Date().getHours();
  const currentDemand = rows[currentHour]?.utilization_pct ?? rows[currentHour]?.predicted_total_mw ?? 50;
  const demandLevel: 'Low' | 'Medium' | 'High' = currentDemand > 70 ? 'High' : currentDemand > 45 ? 'Medium' : 'Low';

  const chartData = rows.map((r, i) => ({
    hour: i,
    congestion: Math.min(100, Math.round(r.utilization_pct ?? r.predicted_total_mw * 5)),
  }));

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Charging Forecast</h1>
        <p className="text-slate-500 text-sm">See when it&apos;s cheap and easy to charge in your area</p>
      </div>

      {/* Zone selector */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-sm font-medium text-slate-600">Your area:</label>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
        >
          {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <StatusBadge fromFallback={fromFallback} />
      </div>

      {/* Current demand meter */}
      <div className="mb-5">
        <DemandMeter level={demandLevel} />
      </div>

      {/* 24h forecast chart */}
      <div className="glass-card-static p-5 mb-5">
        <h3 className="text-base font-bold text-slate-800 mb-1">Today&apos;s Charging Congestion</h3>
        <p className="text-xs text-slate-500 mb-4">How busy charging stations will be throughout the day in {zone}</p>
        {loading ? (
          <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Green off-peak band */}
                <ReferenceArea x1={23} x2={24} fill="#10b981" fillOpacity={0.07} />
                <ReferenceArea x1={0} x2={5} fill="#10b981" fillOpacity={0.07} />
                {/* Red peak band */}
                <ReferenceArea x1={18} x2={21} fill="#ef4444" fillOpacity={0.07} />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickFormatter={(h) => `${h}h`} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<FriendlyTooltip />} />
                <Area type="monotone" dataKey="congestion" stroke="#6366f1" fill="url(#congGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400/30 border border-emerald-400 inline-block" />Off-peak (cheap!)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400/30 border border-red-400 inline-block" />Peak (avoid)</span>
            </div>
          </>
        )}
      </div>

      {/* Smart charging tip */}
      <div className="glass-card-static p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="text-base font-bold text-slate-800">Smart Charging Tip for {zone}</h3>
          </div>
          <button
            onClick={refreshTip}
            disabled={tipLoading}
            className="text-[11px] text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 disabled:opacity-50 shrink-0"
          >
            <svg className={`w-3 h-3 ${tipLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isTipLive ? 'Refresh' : 'Get AI Tip'}
          </button>
        </div>
        <div className="text-sm text-slate-600 leading-relaxed">
          <MarkdownView content={tip} />
        </div>
      </div>
    </div>
  );
}
