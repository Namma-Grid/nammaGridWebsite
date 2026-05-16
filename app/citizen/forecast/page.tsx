'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { fetchForecast, type ForecastRow } from '@/app/lib/bescom-api';
import { MOCK_FORECAST } from '@/app/lib/mock-data';
import { queryAgent } from '@/app/lib/agent';
import MarkdownView from '@/app/components/MarkdownView';
import StatusBadge from '@/app/components/shared/StatusBadge';

const ChartSection = dynamic(() => import('@/app/components/ForecastChart'), { ssr: false });

const ZONES = [
  'Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar', 'HSR Layout',
  'Marathahalli', 'Electronic City', 'Hebbal', 'Yeshwanthpur', 'Bannerghatta Road',
];

const DUMMY_TIPS: Record<string, string> = {
  'Koramangala': '💡 Best time to charge in Koramangala: **11 PM – 2 AM**. BESCOM\'s Time-of-Use tariff drops to ₹3.8/kWh at night vs ₹6.8/kWh during peak — that\'s ₹45–₹180 saved per session depending on your battery size. 78% of Koramangala stations show high wait times between 6–9 PM. Early morning (1–4 AM) has the lowest grid load of the day.',
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
        <p className="text-xs text-slate-500 mt-1">Based on ML forecast · BESCOM EV AI · Updated hourly</p>
      </div>
    </div>
  );
}


const BATTERY_OPTIONS = [
  { label: '3 kWh (2-wheeler)', kWh: 3 },
  { label: '22 kWh (small car)', kWh: 22 },
  { label: '40 kWh (mid-size)', kWh: 40 },
  { label: '75 kWh (large car)', kWh: 75 },
];

function SavingsCalculator() {
  const [batteryIdx, setBatteryIdx] = useState(1);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const battery = BATTERY_OPTIONS[batteryIdx];
  const monthlyKwh = battery.kWh * sessionsPerWeek * 4.3;
  const peakCost = Math.round(monthlyKwh * 6.8);
  const offPeakCost = Math.round(monthlyKwh * 3.8);
  const saving = peakCost - offPeakCost;

  return (
    <div className="glass-card-static p-5 mt-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔋</span>
        <h3 className="text-base font-bold text-slate-800">Quick Savings Estimate</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Battery size</label>
          <select
            value={batteryIdx}
            onChange={(e) => setBatteryIdx(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {BATTERY_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Sessions/week</label>
          <select
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {[1, 2, 3, 4, 5, 7].map((n) => <option key={n} value={n}>{n}×</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Charging at peak (6–9 PM)</span>
          <span className="font-semibold text-red-600">₹{peakCost.toLocaleString('en-IN')} / month</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Charging off-peak (11 PM+)</span>
          <span className="font-semibold text-emerald-600">₹{offPeakCost.toLocaleString('en-IN')} / month</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="font-bold text-slate-700">You could save</span>
          <span className="font-extrabold text-emerald-700 text-base">₹{saving.toLocaleString('en-IN')} / month 💚</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-3">Based on BESCOM ToU tariff: ₹3.8/kWh off-peak vs ₹6.8/kWh peak · {Math.round(monthlyKwh)} kWh/month estimated</p>
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

  const chartData = useMemo(() => rows.map((r, i) => ({
    hour: i,
    congestion: Math.min(100, Math.round(r.utilization_pct ?? r.predicted_total_mw * 5)),
  })), [rows]);

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
          <Suspense fallback={<div className="h-40 animate-pulse bg-slate-100 rounded-xl" />}>
            <ChartSection data={chartData} />
          </Suspense>
        )}
      </div>

      {/* Smart charging tip */}
      <div className="glass-card-static p-5 mb-0">
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

      {/* Savings calculator */}
      <SavingsCalculator />
    </div>
  );
}
