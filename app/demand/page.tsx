'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SectionWrapper from '@/app/components/SectionWrapper';
import DateTimeSelector from '@/app/components/DateTimeSelector';
import { generateDemandSnapshot } from '@/app/data/demand-predictions';
import AgentInsights from '@/app/components/AgentInsights';
import type { HexCell } from '@/app/lib/types';
import gridData from '@/bangalore-hex-grid.json';
import {
  fetchForecast,
  type ForecastRow,
} from '@/app/lib/bescom-api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DemandHeatmap = dynamic(() => import('@/app/components/DemandHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] min-h-[320px] rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Loading Demand Heatmap...</span>
      </div>
    </div>
  ),
});

// BESCOM ML zones (bescom-ev-ai)
const BESCOM_ZONES = [
  'Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar', 'HSR Layout',
  'Marathahalli', 'Electronic City', 'Hebbal', 'Yeshwanthpur', 'Bannerghatta Road',
];

function enrichCells(rawCells: typeof gridData.grid): HexCell[] {
  return rawCells.map((cell) => {
    const seed = cell.h3Index.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const demandLevel = Math.round(
      (cell.zone === 'workplace' ? 40 : cell.zone === 'marketplace' ? 50 : 25) +
        ((seed % 50) - 10)
    );
    return {
      ...cell,
      demanded: demandLevel > 55,
      demandLevel: Math.max(0, Math.min(100, demandLevel)),
      evCount: Math.floor(5 + (seed % 30)),
    } as HexCell;
  });
}

function RealForecastChart({ zone }: { zone: string }) {
  const [rows, setRows] = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function load(bust = false) {
    if (!BESCOM_ZONES.includes(zone)) return;
    setLoading(true);
    setError('');
    fetchForecast(zone, 24, bust)
      .then((data) => { setRows(data); setLoading(false); })
      .catch(() => { setError('Could not load forecast data.'); setLoading(false); });
  }

  useEffect(() => { load(); }, [zone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!BESCOM_ZONES.includes(zone)) return null;

  const chartData = rows.map((r) => ({
    hour: new Date(r.timestamp).getHours(),
    'EV Demand (MW)': r.predicted_ev_mw,
    'Base Demand (MW)': r.predicted_base_mw,
    'Total (MW)': r.predicted_total_mw,
    'Capacity (MW)': r.grid_capacity_mw,
    peak: r.is_peak_risk === 1,
  }));

  return (
    <div className="glass-card-static p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs">📈</span>
          ML Demand Forecast — {zone}
          <span className="badge badge-blue">BESCOM AI</span>
        </h3>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0"
        >
          <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        GradientBoosting model · 24h ahead · EV + base demand
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs">Loading ML forecast…</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48">
          <span className="text-red-400 text-xs">{error}</span>
        </div>
      ) : chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h) => `${h}h`} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: unknown, name: unknown) => [`${(v as number).toFixed(2)} MW`, name as string]}
                labelFormatter={(h) => `Hour ${h}:00`}
                contentStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Base Demand (MW)" stroke="#10b981" fill="url(#baseGrad)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="EV Demand (MW)" stroke="#6366f1" fill="url(#evGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Peak risk badges */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {chartData
              .filter((d) => d.peak)
              .map((d) => (
                <span key={d.hour} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-mono">
                  ⚠ {d.hour}:00
                </span>
              ))}
            {chartData.filter((d) => d.peak).length === 0 && (
              <span className="text-[10px] text-emerald-600">✓ No peak risk hours in next 24h</span>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function DemandPage() {
  const cells = useMemo(() => enrichCells(gridData.grid), []);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedHour, setSelectedHour] = useState(18);
  const [selectedDemandArea, setSelectedDemandArea] = useState<string>('Koramangala');
  const [selectedDemandZone, setSelectedDemandZone] = useState<string>('residential');

  const demandSnapshot = useMemo(
    () => generateDemandSnapshot(cells, selectedHour),
    [cells, selectedHour]
  );

  const uniqueAreas = useMemo(() => {
    const areaMap = new Map<string, string>();
    cells.forEach((c) => {
      if (!areaMap.has(c.nearestArea)) areaMap.set(c.nearestArea, c.zone);
    });
    return Array.from(areaMap.entries()).map(([name, zone]) => ({ name, zone }));
  }, [cells]);

  const handleDemandCellSelect = useCallback((cell: HexCell) => {
    setSelectedDemandArea(cell.nearestArea);
    setSelectedDemandZone(cell.zone);
  }, []);

  return (
    <div className="page-container">
      <SectionWrapper
        id="demand"
        title="Grid Demand Prediction"
        subtitle="AI-driven 24-hour demand forecasting by zone. Select a date, time, and area to see predicted EV charging load and peak hour analysis."
        icon="📊"
        badge="Forecast"
      >
        {/* Controls */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px] mb-6">
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedHour={selectedHour}
            onDateChange={setSelectedDate}
            onHourChange={setSelectedHour}
          />

          {/* Area selector */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-medium">
              Select Area
            </label>
            <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-1 rounded-xl border border-slate-100 bg-white/60 p-1.5">
              {uniqueAreas.slice(0, 20).map((area) => (
                <button
                  key={area.name}
                  onClick={() => {
                    setSelectedDemandArea(area.name);
                    setSelectedDemandZone(area.zone);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between touch-manipulation ${
                    selectedDemandArea === area.name
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{area.name}</span>
                  <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                    selectedDemandArea === area.name
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    {area.zone}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ML Forecast chart (BESCOM AI) + LLM Agent panel */}
        <div className="grid gap-5 lg:grid-cols-2 mb-5">
          <RealForecastChart zone={selectedDemandArea} />
          <AgentInsights
            area={selectedDemandArea}
            zone={selectedDemandZone}
            dateOffset={selectedDate}
            hour={selectedHour}
          />
        </div>

        {/* Heatmap */}
        <div className="glass-card-static p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs">🗺️</span>
            City-Wide Demand Heatmap
            <span className="badge badge-amber ml-auto">
              {selectedHour < 12
                ? `${selectedHour || 12} AM`
                : `${selectedHour === 12 ? 12 : selectedHour - 12} PM`}
            </span>
          </h3>
          <DemandHeatmap
            cells={cells}
            demandSnapshot={demandSnapshot}
            selectedHour={selectedHour}
            onCellSelect={handleDemandCellSelect}
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
