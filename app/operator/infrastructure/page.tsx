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

const AGENT_DUMMY: Record<string, string> = {
  'Priority Zones — Urgent Need': `## Top 8 Priority Zones — Urgent EV Charging Need

| Rank | Zone | Peak Demand | Grid Stress | Chargers (have/need) | Priority |
|------|------|------------|-------------|----------------------|----------|
| #1 | Whitefield | 847 kWh | 🔴 Critical | 12 / 45 | 9.8/10 |
| #2 | Electronic City | 712 kWh | 🔴 High | 8 / 38 | 9.2/10 |
| #3 | HSR Layout | 634 kWh | 🟠 High | 14 / 32 | 8.7/10 |
| #4 | Marathahalli | 589 kWh | 🟠 High | 10 / 28 | 8.1/10 |
| #5 | Koramangala | 521 kWh | 🟠 Medium | 18 / 24 | 7.6/10 |
| #6 | Indiranagar | 478 kWh | 🟡 Medium | 21 / 20 | 7.1/10 |
| #7 | Hebbal | 412 kWh | 🟡 Medium | 9 / 18 | 6.8/10 |
| #8 | Bannerghatta Rd | 387 kWh | 🟡 Medium | 7 / 16 | 6.3/10 |
`,

  'High-Growth EV Corridors': `## Top 5 High-Growth EV Corridors

**1. Whitefield–ITPL** 🚨 EV density: 142/km² · Growth: +67% YoY · Gap: 33 ports
**2. Electronic City** EV density: 118/km² · Growth: +54% YoY · Gap: 27 ports
**3. Sarjapur–Marathahalli ORR** EV density: 96/km² · Growth: +48% YoY · Gap: 22 ports
**4. Koramangala–HSR** EV density: 87/km² · Growth: +41% YoY · Gap: 18 ports
**5. Hebbal–Thanisandra NH** EV density: 71/km² · Growth: +35% YoY · Gap: 14 ports
`,

  'Baseline vs AI Placement': `## AI-Optimized vs Uniform Grid Placement

| Metric | Baseline | AI-Optimized | Δ |
|--------|----------|--------------|---|
| Demand Coverage | 61% | 89% | **+28%** |
| Peak Load Reduction | 8% | 31% | **+23%** |
| Avg Wait Time | 18 min | 7 min | **−61%** |
| Cost per kWh | ₹4.20 | ₹2.85 | **−32%** |
| Underserved zones fixed | 3/19 | 16/19 | **+433%** |
`,

  'Grid Capacity & Load Constraints': `## BESCOM Grid Capacity — EV Expansion Headroom

**Safe zones:** Whitefield 220kV (+340 chargers) · Marathahalli 110kV (+180) · HSR 66kV (+120)
**At risk ⚠️:** Electronic City Phase 1 (4 MW left, max +28) · Koramangala 66kV (2.1 MW, max +35)
**Needs upgrade:** Indiranagar 33kV — near capacity before any new installs
`,

  'Demand Growth Projection': `## EV Demand Growth 2025–2027

| Period | Total kWh/day | Growth |
|--------|--------------|--------|
| Q1 2025 | 26,300 | baseline |
| Q4 2025 | 42,900 | +63% |
| Q1 2026 | 50,900 | +94% |
| Q4 2027 | 106,000 | +303% |

Investment needed: ₹98 Cr · 1,360 new ports across residential, workplace, marketplace zones.
`,

  'Evaluation vs Baseline': `## AI Plan vs Uniform Baseline — Scores

| Metric | AI Plan | Baseline |
|--------|---------|----------|
| Demand Coverage | 8.7/10 | 5.2/10 |
| Peak Load Impact | 8.1/10 | 4.8/10 |
| Grid Stress | 7.9/10 | 3.1/10 |
| Cost Efficiency | 8.4/10 | 5.6/10 |
| Equity | 7.2/10 | 2.9/10 |
| **Overall** | **8.1/10** | **4.3/10** |
`,

  'Key Risks & Mitigation': `## Top 5 Rollout Risks

1. 🔴 **Grid overload at peak** — Deploy demand-response; limit DC fast chargers to substations with >40 MW headroom
2. 🟠 **Adoption below forecast** — Phase deployment; pause Phase 2 if Q2 2025 adoption <18% target
3. 🟠 **Incomplete BESCOM data** — Data SLA; fall back to historical models when data >15 min stale
4. 🟡 **Land allocation delays** — Pre-identify 40% more sites than needed; BBMP fast-track pipeline
5. 🟡 **Hardware failure in underserved zones** — Ruggedised spec; 72-hr SLA; community ownership pilot
`,

  'Implementation Roadmap': `## 3-Phase Rollout Plan

**Phase 1 (0–6 months):** 120 chargers across top 8 zones · Milestone: 60% of Bangalore within 2 km of a charger
**Phase 2 (6–18 months):** +280 chargers on ORR/NH-44 · 3 substation upgrades · Avg wait <8 min city-wide
**Phase 3 (18–36 months):** +400 chargers + V2G at 20 hubs · 95% EV demand met within 5 km
`,
};

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
      <SectionWrapper id="infrastructure" title="Infrastructure Location Planner" subtitle="ML-scored station site recommendations (composite score: demand pressure 30% · EV growth rate 35% · infrastructure gap 20% · feeder headroom 15%). Benchmarked against ISGF BESCOM load flow study." icon="🏗️" badge="Part B — Infrastructure Location Planning">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { v: '1,519', l: 'H3 Cells Analysed (Resolution 8)', c: 'text-blue-600' },
            { v: '47', l: 'Priority Zones (23 Urgent + 24 High)', c: 'text-red-500' },
            { v: `${recs.length || 8} shown · 23 total`, l: 'Recommended Sites', c: 'text-emerald-600' },
            { v: '~3.4L', l: 'Projected EVs by 2027 · Bengaluru', c: 'text-purple-600' },
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

        {/* Growth rate footnote */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
          * EV growth rates based on Karnataka RTO Q1 2026 data: 54,379 registrations statewide in Q1 2026 (+40% YoY). Bengaluru contributing ~53% of statewide registrations. Zone-level rates are modelled from POI density and historical BESCOM zone data. Investment estimate: ₹45L per 7-port 154kW station.
        </div>

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
                <AgentPanel key={panel.title} title={panel.title} icon={panel.icon} query={panel.query} badge={panel.badge} minHeight="200px" maxHeight="360px" dummyContent={AGENT_DUMMY[panel.title]} />
              ))}
            </div>
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
