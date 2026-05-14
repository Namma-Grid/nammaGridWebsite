'use client';

import { useState, useEffect } from 'react';
import SectionWrapper from '@/app/components/SectionWrapper';
import AgentPanel from '@/app/components/AgentPanel';
import StatusBadge from '@/app/components/shared/StatusBadge';
import SkeletonCard from '@/app/components/shared/SkeletonCard';
import gridData from '@/bangalore-hex-grid.json';
import {
  fetchLocationRecommendations,
  fetchUnderservedZones,
  type LocationRecommendation,
  type UnderservedZone,
} from '@/app/lib/bescom-api';
import { MOCK_RECOMMENDATIONS, MOCK_UNDERSERVED } from '@/app/lib/mock-data';

const TABS = ['Priority Map', 'Underserved Zones', 'AI Insights'] as const;
type Tab = typeof TABS[number];

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  URGENT: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: '🔴' },
  HIGH:   { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: '🟡' },
  MEDIUM: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: '🟢' },
};

export default function OperatorInfraPage() {
  const [tab, setTab] = useState<Tab>('Priority Map');
  const [recs, setRecs] = useState<LocationRecommendation[]>([]);
  const [underserved, setUnderserved] = useState<UnderservedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);
  const [selected, setSelected] = useState<LocationRecommendation | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLocationRecommendations(8), fetchUnderservedZones()])
      .then(([r, u]) => { setRecs(r); setUnderserved(u); setFromFallback(false); })
      .catch(() => { setRecs(MOCK_RECOMMENDATIONS); setUnderserved(MOCK_UNDERSERVED); setFromFallback(true); })
      .finally(() => setLoading(false));
  }, []);

  const totalCells = gridData.meta.totalCells;
  const zones = gridData.meta.zoneCounts;

  return (
    <div className="page-container">
      <SectionWrapper id="infrastructure" title="Infrastructure Location Planner" subtitle="ML-scored station site recommendations, underserved zone analysis, and AI-driven infrastructure insights." icon="🏗️" badge="Part B">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { v: '1,519', l: 'Zones Analysed', c: 'text-blue-600' },
            { v: '47', l: 'Priority Zones', c: 'text-red-500' },
            { v: recs.length || '23', l: 'Recommended Sites', c: 'text-emerald-600' },
            { v: '~340k', l: 'EVs by 2027', c: 'text-purple-600' },
          ].map((s) => (
            <div key={s.l} className="stat-card text-center">
              <div className={`stat-value ${s.c}`}>{s.v}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-5">
          <div className="tab-nav">
            {TABS.map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <StatusBadge fromFallback={fromFallback} />
        </div>

        {/* Tab: Priority Map */}
        {tab === 'Priority Map' && (
          <div className="space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />) : (
              recs.map((r, i) => (
                <div
                  key={r.zone}
                  onClick={() => setSelected(selected?.zone === r.zone ? null : r)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${PRIORITY_STYLES[r.priority]?.bg ?? 'bg-slate-50 border-slate-200'} ${selected?.zone === r.zone ? 'ring-2 ring-blue-400' : 'hover:shadow-md'}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{PRIORITY_STYLES[r.priority]?.dot}</span>
                  <span className="text-lg font-extrabold text-slate-300 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-slate-800">{r.zone}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[r.priority]?.bg ?? ''} ${PRIORITY_STYLES[r.priority]?.text ?? ''}`}>{r.priority}</span>
                      <span className="text-xs text-slate-400 ml-auto font-mono">{r.composite_score}/100</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{r.recommendation}</p>
                    <div className="flex gap-3 flex-wrap text-[11px]">
                      <span className="text-slate-600"><strong>{r.suggested_ports}</strong> ports</span>
                      <span className="text-slate-600"><strong>{r.suggested_capacity_kw}</strong> kW</span>
                      <span className="text-slate-500">demand {(r.demand_pressure_norm * 100).toFixed(0)}%</span>
                      <span className="text-slate-500">growth {(r.ev_growth_norm * 100).toFixed(0)}%</span>
                    </div>
                    {selected?.zone === r.zone && (
                      <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400">Coverage gap</span><br /><strong className="text-slate-700">{(r.coverage_gap_norm * 100).toFixed(0)}%</strong></div>
                        <div><span className="text-slate-400">Est. cost</span><br /><strong className="text-slate-700">₹{((r.suggested_capacity_kw * 45000) / 100000).toFixed(1)}L</strong></div>
                        <div><span className="text-slate-400">Lat/Lon</span><br /><strong className="text-slate-700 font-mono">{r.lat.toFixed(3)}, {r.lon.toFixed(3)}</strong></div>
                        <div><span className="text-slate-400">Priority score</span><br /><strong className="text-slate-700">{r.composite_score}/100</strong></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Underserved zones */}
        {tab === 'Underserved Zones' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              ⚠️ <strong>{underserved.length || 12} zones</strong> have &lt;2 ports per 1,000 EVs — <strong>₹18Cr infrastructure investment recommended</strong>
            </div>
            {loading ? <SkeletonCard lines={5} height="200px" /> : (
              <div className="glass-card-static overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left py-3 px-4 text-slate-500 font-semibold">Zone</th>
                        <th className="text-right py-3 px-3 text-slate-500 font-semibold">EVs</th>
                        <th className="text-right py-3 px-3 text-slate-500 font-semibold">Ports</th>
                        <th className="text-right py-3 px-3 text-slate-500 font-semibold">Per 1k EVs</th>
                        <th className="text-left py-3 px-3 text-slate-500 font-semibold">Coverage Gap</th>
                        <th className="text-right py-3 px-3 text-slate-500 font-semibold">Deficit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {underserved.map((u) => {
                        const gapPct = Math.min(100, ((2 - u.ports_per_1000_evs) / 2) * 100);
                        return (
                          <tr key={u.zone} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-4 font-semibold text-slate-700">{u.zone}</td>
                            <td className="py-3 px-3 text-right text-slate-600">{u.current_evs.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-slate-600">{u.total_ports}</td>
                            <td className="py-3 px-3 text-right"><span className="text-red-600 font-mono font-bold">{u.ports_per_1000_evs.toFixed(2)}</span></td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${gapPct}%` }} />
                                </div>
                                <span className="text-slate-400 w-8 text-right">{gapPct.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right"><span className="text-orange-600 font-semibold">+{u.deficit_ports}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Zone distribution */}
            <div className="glass-card-static p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Zone Distribution — {totalCells} cells</h3>
              <div className="space-y-3">
                {[
                  { label: 'Residential', count: zones.residential, color: 'bg-blue-400', pct: Math.round(zones.residential / totalCells * 100) },
                  { label: 'Workplace', count: zones.workplace, color: 'bg-emerald-400', pct: Math.round(zones.workplace / totalCells * 100) },
                  { label: 'Marketplace', count: zones.marketplace, color: 'bg-amber-400', pct: Math.round(zones.marketplace / totalCells * 100) },
                ].map((z) => (
                  <div key={z.label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium">{z.label}</span>
                      <span>{z.count} ({z.pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${z.color}`} style={{ width: `${z.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: AI Insights */}
        {tab === 'AI Insights' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">8 AI insight panels · cached 10 min</span>
              <button onClick={() => window.print()} className="text-xs text-blue-600 hover:underline no-print">🖨️ Generate Full Report</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Priority Zones — Urgent Need', icon: '🔴', query: 'Identify the top 8 Bangalore zones urgently needing new EV charging stations. For each zone give: zone name, peak demand (kWh), grid stress level, current charger count vs needed, and priority score out of 10. Format as a clear ranked list.', badge: 'Ranked' },
                { title: 'High-Growth EV Corridors', icon: '📈', query: 'Which 5 Bangalore corridors show the highest EV adoption growth trend? For each: corridor name, current EV density, projected 2026 demand, % growth, and infrastructure gap.' },
                { title: 'Baseline vs AI Placement', icon: '⚖️', query: 'Compare AI-optimized EV charging station placement against uniform grid placement across Bangalore. Give efficiency gain %, demand coverage improvement, and cost per kWh served comparison.' },
                { title: 'Grid Capacity & Load Constraints', icon: '🔋', query: 'Analyse BESCOM grid capacity constraints for EV charging expansion in Bangalore. Which substations have headroom? Give capacity available (kW) per zone and safe EV addition limits.' },
                { title: 'Demand Growth Projection', icon: '🚀', query: 'Project EV charging demand growth in Bangalore from 2025 to 2027 by zone type. Give quarterly demand forecasts and infrastructure investment required per zone.' },
                { title: 'Evaluation vs Baseline', icon: '📊', query: 'Evaluate the AI-driven EV charging infrastructure plan vs a naive baseline for Bangalore. Metrics: demand coverage, peak load impact, grid stress, cost efficiency.' },
                { title: 'Key Risks & Mitigation', icon: '⚠️', query: 'What are the top 5 risks for EV charging infrastructure rollout in Bangalore? For each: category, severity, likelihood, and specific mitigation strategy.' },
                { title: 'Implementation Roadmap', icon: '🗓️', query: 'Give a 3-phase implementation plan for EV charging infrastructure in Bangalore. Phase 1 (0-6 months), Phase 2 (6-18 months), Phase 3 (18-36 months).' },
              ].map((panel) => (
                <AgentPanel key={panel.title} title={panel.title} icon={panel.icon} query={panel.query} badge={panel.badge} minHeight="200px" maxHeight="360px" />
              ))}
            </div>
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
