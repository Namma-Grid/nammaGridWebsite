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
  const [tip, setTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchForecast(zone, 24)
      .then((d) => { setRows(d); setFromFallback(false); })
      .catch(() => { setRows(MOCK_FORECAST); setFromFallback(true); })
      .finally(() => setLoading(false));
  }, [zone]);

  useEffect(() => {
    if (!zone) return;
    setTipLoading(true);
    queryAgent(
      `In 2-3 sentences, give a simple charging tip for an EV owner in ${zone} today. Include the best time window and estimated cost savings. Use friendly language, no jargon.`
    )
      .then(setTip)
      .catch(() => setTip(`💡 Best time to charge in ${zone} today: 11 PM – 2 AM. You could save ₹45 on your session by avoiding the evening peak.`))
      .finally(() => setTipLoading(false));
  }, [zone]);

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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💡</span>
          <h3 className="text-base font-bold text-slate-800">Smart Charging Tip for {zone}</h3>
        </div>
        {tipLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-slate-100 rounded-full w-full" />
            <div className="h-3 bg-slate-100 rounded-full w-4/5" />
          </div>
        ) : (
          <div className="text-sm text-slate-600 leading-relaxed">
            <MarkdownView content={tip} />
          </div>
        )}
      </div>
    </div>
  );
}
