'use client';

import { useState, useEffect } from 'react';
import SectionWrapper from '@/app/components/SectionWrapper';
import AgentPanel from '@/app/components/AgentPanel';
import gridData from '@/bangalore-hex-grid.json';
import {
  fetchLocationRecommendations,
  fetchUnderservedZones,
  type LocationRecommendation,
  type UnderservedZone,
} from '@/app/lib/bescom-api';

const STATS = [
  { value: '1,519', label: 'Zones Analysed', color: 'text-blue-600' },
  { value: '47', label: 'Priority Zones', color: 'text-red-500' },
  { value: '23', label: 'Recommended Sites', color: 'text-emerald-600' },
  { value: '~340k', label: 'EVs by 2027', color: 'text-purple-600' },
];

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  URGENT: { bg: 'bg-red-50 border-red-200',     text: 'text-red-700' },
  HIGH:   { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  MEDIUM: { bg: 'bg-blue-50 border-blue-200',    text: 'text-blue-700' },
};

function RecommendationsTable() {
  const [recs, setRecs] = useState<LocationRecommendation[]>([]);
  const [underserved, setUnderserved] = useState<UnderservedZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function load(bust = false) {
    setLoading(true);
    setError('');
    Promise.all([fetchLocationRecommendations(8, bust), fetchUnderservedZones(bust)])
      .then(([r, u]) => { setRecs(r); setUnderserved(u); setLoading(false); })
      .catch(() => { setError('Could not load infrastructure data.'); setLoading(false); });
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      {/* Recommendations */}
      <div className="glass-card-static p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs">📍</span>
            AI Station Recommendations
            <span className="badge badge-blue">BESCOM AI · ML scored</span>
          </h3>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 shrink-0"
          >
            <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-xs">Running location scoring…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {recs.map((r, i) => (
              <div key={r.zone} className={`flex items-start gap-3 p-3 rounded-xl border ${PRIORITY_STYLES[r.priority]?.bg ?? 'bg-slate-50 border-slate-200'}`}>
                <span className="text-lg font-extrabold text-slate-300 w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-slate-800">{r.zone}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[r.priority]?.bg ?? ''} ${PRIORITY_STYLES[r.priority]?.text ?? 'text-slate-600'}`}>
                      {r.priority}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto font-mono">{r.composite_score}/100</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{r.recommendation}</p>
                  <div className="flex gap-3 flex-wrap text-[11px]">
                    <span className="text-slate-600"><strong>{r.suggested_ports}</strong> ports</span>
                    <span className="text-slate-600"><strong>{r.suggested_capacity_kw}</strong> kW</span>
                    <span className="text-slate-500">demand {(r.demand_pressure_norm * 100).toFixed(0)}%</span>
                    <span className="text-slate-500">growth {(r.ev_growth_norm * 100).toFixed(0)}%</span>
                    <span className="text-slate-500">gap {(r.coverage_gap_norm * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Underserved zones */}
      {underserved.length > 0 && (
        <div className="glass-card-static p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            Underserved Zones
            <span className="text-xs text-slate-400 font-normal ml-1">(&lt;2 ports per 1,000 EVs)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Zone</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">EVs</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Ports</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Per 1k EVs</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Deficit</th>
                </tr>
              </thead>
              <tbody>
                {underserved.map((u) => (
                  <tr key={u.zone} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium text-slate-700">{u.zone}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{u.current_evs.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{u.total_ports}</td>
                    <td className="py-2 px-2 text-right">
                      <span className="text-red-600 font-mono">{u.ports_per_1000_evs.toFixed(2)}</span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="text-orange-600 font-semibold">+{u.deficit_ports}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InfrastructurePage() {
  const totalCells = gridData.meta.totalCells;
  const zones = gridData.meta.zoneCounts;

  return (
    <div className="page-container">
      <SectionWrapper
        id="infrastructure"
        title="Charging Infrastructure Planner"
        subtitle="AI-powered identification of priority zones and optimal locations for new EV charging stations. Considers demand growth, existing infrastructure, grid capacity, and load balancing constraints."
        icon="🏗️"
        badge="Part B"
      >
        {/* Explainer */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <span className="text-purple-500 text-lg shrink-0">🗺️</span>
          <div className="text-sm text-purple-700">
            <strong>Decision-support layer:</strong> ML-scored recommendations using demand pressure,
            EV growth rate, coverage gap, and grid headroom. Data from BESCOM AI agents.
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card text-center">
              <div className={`stat-value ${s.color}`}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Zone distribution */}
        <div className="glass-card-static p-4 mb-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span>⬡</span>
            Current Zone Distribution ({totalCells} cells)
          </h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Residential', count: zones.residential, color: 'bg-blue-400', pct: Math.round(zones.residential / totalCells * 100) },
              { label: 'Workplace', count: zones.workplace, color: 'bg-emerald-400', pct: Math.round(zones.workplace / totalCells * 100) },
              { label: 'Marketplace', count: zones.marketplace, color: 'bg-amber-400', pct: Math.round(zones.marketplace / totalCells * 100) },
            ].map((z) => (
              <div key={z.label} className="flex-1 min-w-[140px]">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium">{z.label}</span>
                  <span>{z.count} cells ({z.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${z.color}`} style={{ width: `${z.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Recommendations (BESCOM AI) + Agent narration */}
        <div className="grid gap-5 lg:grid-cols-2 mb-5">
          <RecommendationsTable />
          <AgentPanel
            title="Priority Zones — Urgent Need"
            icon="🔴"
            query="Identify the top 8 Bangalore zones urgently needing new EV charging stations. For each zone give: zone name, peak demand (kWh), grid stress level, current charger count vs needed, and priority score out of 10. Format as a clear ranked list."
            badge="Ranked"
            minHeight="240px"
            maxHeight="480px"
          />
        </div>

        {/* Growth corridors + baseline */}
        <div className="grid gap-5 lg:grid-cols-2 mb-5">
          <AgentPanel
            title="High-Growth EV Corridors"
            icon="📈"
            query="Which 5 Bangalore corridors or areas show the highest EV adoption growth trend? For each: corridor name, current EV density, projected 2026 demand (kWh/day), % growth, and infrastructure gap. Flag corridors needing immediate action."
            minHeight="200px"
            maxHeight="380px"
          />
          <AgentPanel
            title="Baseline vs AI Placement"
            icon="⚖️"
            query="Compare AI-optimized EV charging station placement against uniform grid placement across Bangalore. Give: efficiency gain %, demand coverage improvement, peak load reduction, underserved zones fixed, and cost per kWh served comparison. Show this as a clear before/after table."
            minHeight="200px"
            maxHeight="380px"
          />
        </div>

        {/* Grid constraints + demand growth */}
        <div className="grid gap-5 lg:grid-cols-2 mb-5">
          <AgentPanel
            title="Grid Capacity & Load Constraints"
            icon="🔋"
            query="Analyse BESCOM grid capacity constraints for EV charging expansion in Bangalore. Which substations or feeders have headroom for new charging loads? Which are at risk of overload? Give capacity available (kW) per zone and safe EV addition limits."
            minHeight="200px"
            maxHeight="380px"
          />
          <AgentPanel
            title="Demand Growth Projection"
            icon="🚀"
            query="Project EV charging demand growth in Bangalore from 2025 to 2027 by zone type (residential, workplace, marketplace). Give quarterly demand forecasts (kWh/day), adoption rate assumptions, and infrastructure investment required per zone to keep up with growth."
            minHeight="200px"
            maxHeight="380px"
          />
        </div>

        {/* Evaluation + risk + roadmap */}
        <div className="grid gap-5 lg:grid-cols-3">
          <AgentPanel
            title="Evaluation vs Baseline"
            icon="📊"
            query="Evaluate the AI-driven EV charging infrastructure plan vs a naive uniform distribution baseline for Bangalore. Metrics: demand coverage, peak load impact, grid stress, cost efficiency, equity (coverage of underserved areas). Give scores for each metric."
            autoFetch={false}
            minHeight="160px"
            maxHeight="320px"
          />
          <AgentPanel
            title="Key Risks & Mitigation"
            icon="⚠️"
            query="What are the top 5 risks for EV charging infrastructure rollout in Bangalore? For each risk: category (data/behavior/grid/policy), severity, likelihood, and specific mitigation strategy. Focus on grid stability and demand adoption risks."
            autoFetch={false}
            minHeight="160px"
            maxHeight="320px"
          />
          <AgentPanel
            title="Implementation Roadmap"
            icon="🗓️"
            query="Give a high-level 3-phase implementation plan for rolling out new EV charging infrastructure in Bangalore based on priority zones. Phase 1 (0-6 months), Phase 2 (6-18 months), Phase 3 (18-36 months). Include key milestones and dependencies."
            autoFetch={false}
            minHeight="160px"
            maxHeight="320px"
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
