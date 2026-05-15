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

const AGENT_DUMMY: Record<string, string> = {
  priorityZones: `## Top 8 Priority Zones — Urgent EV Charging Need

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

**Action needed:** Whitefield and Electronic City require immediate deployment (Q1 2025).
`,

  highGrowth: `## Top 5 High-Growth EV Corridors in Bangalore

**1. Whitefield–ITPL Corridor** 🚨 Immediate Action
- EV density: 142 EVs/km² · 2026 demand: 1,240 kWh/day · Growth: +67% YoY · Gap: 33 ports

**2. Electronic City Tech Park Strip**
- EV density: 118 EVs/km² · 2026 demand: 980 kWh/day · Growth: +54% YoY · Gap: 27 ports

**3. Sarjapur–Marathahalli ORR Stretch**
- EV density: 96 EVs/km² · 2026 demand: 820 kWh/day · Growth: +48% YoY · Gap: 22 ports

**4. Koramangala–HSR Layout Hub**
- EV density: 87 EVs/km² · 2026 demand: 740 kWh/day · Growth: +41% YoY · Gap: 18 ports

**5. Hebbal–Thanisandra NH Corridor**
- EV density: 71 EVs/km² · 2026 demand: 590 kWh/day · Growth: +35% YoY · Gap: 14 ports
`,

  baseline: `## AI-Optimized vs Uniform Grid Placement

| Metric | Baseline (Uniform) | AI-Optimized | Improvement |
|--------|-------------------|--------------|-------------|
| Demand Coverage | 61% | 89% | **+28%** |
| Peak Load Reduction | 8% | 31% | **+23%** |
| Avg Wait Time | 18 min | 7 min | **−61%** |
| Cost per kWh served | ₹4.20 | ₹2.85 | **−32%** |
| Underserved zones fixed | 3 / 19 | 16 / 19 | **+433%** |
| Grid stress incidents | 14 / month | 4 / month | **−71%** |

**Conclusion:** AI placement reduces cost by 32% while covering 28% more demand. Prioritizing high-density zones delivers 3.1× better ROI than uniform distribution.
`,

  gridCapacity: `## BESCOM Grid Capacity — EV Expansion Headroom

### Safe Headroom (EV-Ready)
- **Whitefield 220kV** — 47 MW available → +340 chargers safe
- **Marathahalli 110kV** — 28 MW available → +180 chargers safe
- **HSR Layout 66kV** — 19 MW available → +120 chargers safe

### At Risk ⚠️ (Overload Potential)
- **Electronic City Phase 1** — 4 MW headroom; max +28 chargers without substation upgrade
- **Koramangala 66kV** — 2.1 MW; peak risk if >15 DC fast-chargers added
- **Indiranagar 33kV** — near capacity; feeder upgrade required before new installs

### Safe EV Addition Limits by Zone
| Zone | Current Load | Safe EV Adds |
|------|-------------|-------------|
| Whitefield | 64% | +340 units |
| Hebbal | 51% | +220 units |
| Electronic City | 89% | +28 units |
| Koramangala | 84% | +35 units |
`,

  demandGrowth: `## EV Charging Demand Growth Projection 2025–2027

| Quarter | Residential | Workplace | Marketplace | Total |
|---------|-------------|-----------|-------------|-------|
| Q1 2025 | 12,400 kWh | 8,700 kWh | 5,200 kWh | **26,300 kWh** |
| Q3 2025 | 16,800 kWh | 12,400 kWh | 7,400 kWh | **36,600 kWh** |
| Q1 2026 | 22,600 kWh | 17,500 kWh | 10,800 kWh | **50,900 kWh** |
| Q4 2027 | 48,000 kWh | 36,000 kWh | 22,000 kWh | **106,000 kWh** |

### Infrastructure Investment Required (2025–2027)
- **Residential:** ₹48 Cr → 680 new ports
- **Workplace:** ₹31 Cr → 420 new ports
- **Marketplace:** ₹19 Cr → 260 new ports

*Adoption rate assumption: 28% YoY EV growth based on BESCOM 2024 data.*
`,

  evaluation: `## AI Infrastructure Plan vs Naive Uniform Distribution

| Metric | AI Plan | Baseline | Delta |
|--------|---------|----------|-------|
| Demand Coverage | 8.7 / 10 | 5.2 / 10 | +67% |
| Peak Load Impact | 8.1 / 10 | 4.8 / 10 | +69% |
| Grid Stress Reduction | 7.9 / 10 | 3.1 / 10 | +155% |
| Cost Efficiency | 8.4 / 10 | 5.6 / 10 | +50% |
| Equity (Underserved) | 7.2 / 10 | 2.9 / 10 | +148% |
| **Overall** | **8.1 / 10** | **4.3 / 10** | **+88%** |

AI plan delivers **88% better outcomes** across all metrics. Biggest gains in equity coverage (+148%) and grid stress reduction (+155%).
`,

  risks: `## Top 5 EV Infrastructure Rollout Risks

**1. Grid Overload During Peak Hours** 🔴 High · High likelihood
- Mitigation: Smart charging with demand-response; limit 150kW DC chargers to substations with >40 MW headroom

**2. EV Adoption Slower Than Forecast** 🟠 Medium · Medium likelihood
- Mitigation: Phase deployment in 3 tranches; pause Phase 2 if Q2 2025 adoption <18% of target

**3. Incomplete Real-Time Data from BESCOM** 🟠 Medium · Medium likelihood
- Mitigation: Data-sharing SLA; fall back to historical models when live data >15 min stale

**4. Policy Delays on Land Allocation** 🟡 Medium · Medium likelihood
- Mitigation: Identify 40% more candidate sites than needed; BBMP pre-approval pipeline for shortlisted zones

**5. Vandalism / Hardware Failure in Low-Income Zones** 🟡 Low-Medium · Low likelihood
- Mitigation: Ruggedised hardware spec; 72-hour SLA for repairs; community ownership model in pilot zones
`,

  roadmap: `## 3-Phase EV Charging Infrastructure Rollout

### Phase 1: Foundation (0–6 months)
- Deploy 120 chargers across top 8 priority zones
- Key sites: Whitefield ITPL, Electronic City, HSR 27th Main
- Milestone: 60% of Bangalore within 2 km of a charging point
- Dependencies: BESCOM substation audit, land clearance for 15 sites

### Phase 2: Scale-Up (6–18 months)
- Add 280 chargers; focus on ORR, NH-44 corridor, emerging zones
- Upgrade 3 substations (Electronic City, Koramangala, Indiranagar)
- Milestone: Avg wait time <8 min city-wide during peak
- Dependencies: Phase 1 completion, BBMP permit pipeline

### Phase 3: Optimisation (18–36 months)
- Deploy 400 additional chargers; introduce V2G at 20 hub sites
- Real-time demand-response integration with BESCOM grid
- Milestone: 95% EV demand met within 5 km; grid stress <5% above baseline
- Dependencies: Smart meter rollout, V2G-capable hardware procurement
`,
};

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

        {/* ML Recommendations (always visible) */}
        <div className="mb-6">
          <RecommendationsTable />
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
            title="Priority Zones — Urgent Need"
            icon="🔴"
            query="Identify the top 8 Bangalore zones urgently needing new EV charging stations. For each zone give: zone name, peak demand (kWh), grid stress level, current charger count vs needed, and priority score out of 10. Format as a clear ranked list."
            badge="Ranked"
            minHeight="240px"
            maxHeight="480px"
            dummyContent={AGENT_DUMMY.priorityZones}
          />
          <AgentPanel
            title="High-Growth EV Corridors"
            icon="📈"
            query="Which 5 Bangalore corridors or areas show the highest EV adoption growth trend? For each: corridor name, current EV density, projected 2026 demand (kWh/day), % growth, and infrastructure gap. Flag corridors needing immediate action."
            minHeight="200px"
            maxHeight="380px"
            dummyContent={AGENT_DUMMY.highGrowth}
          />
          <AgentPanel
            title="Baseline vs AI Placement"
            icon="⚖️"
            query="Compare AI-optimized EV charging station placement against uniform grid placement across Bangalore. Give: efficiency gain %, demand coverage improvement, peak load reduction, underserved zones fixed, and cost per kWh served comparison. Show this as a clear before/after table."
            minHeight="200px"
            maxHeight="380px"
            dummyContent={AGENT_DUMMY.baseline}
          />
          <AgentPanel
            title="Grid Capacity & Load Constraints"
            icon="🔋"
            query="Analyse BESCOM grid capacity constraints for EV charging expansion in Bangalore. Which substations or feeders have headroom for new charging loads? Which are at risk of overload? Give capacity available (kW) per zone and safe EV addition limits."
            minHeight="200px"
            maxHeight="380px"
            dummyContent={AGENT_DUMMY.gridCapacity}
          />
          <AgentPanel
            title="Demand Growth Projection"
            icon="🚀"
            query="Project EV charging demand growth in Bangalore from 2025 to 2027 by zone type (residential, workplace, marketplace). Give quarterly demand forecasts (kWh/day), adoption rate assumptions, and infrastructure investment required per zone to keep up with growth."
            minHeight="200px"
            maxHeight="380px"
            dummyContent={AGENT_DUMMY.demandGrowth}
          />
          <AgentPanel
            title="Evaluation vs Baseline"
            icon="📊"
            query="Evaluate the AI-driven EV charging infrastructure plan vs a naive uniform distribution baseline for Bangalore. Metrics: demand coverage, peak load impact, grid stress, cost efficiency, equity (coverage of underserved areas). Give scores for each metric."
            minHeight="160px"
            maxHeight="320px"
            dummyContent={AGENT_DUMMY.evaluation}
          />
          <AgentPanel
            title="Key Risks & Mitigation"
            icon="⚠️"
            query="What are the top 5 risks for EV charging infrastructure rollout in Bangalore? For each risk: category (data/behavior/grid/policy), severity, likelihood, and specific mitigation strategy. Focus on grid stability and demand adoption risks."
            minHeight="160px"
            maxHeight="320px"
            dummyContent={AGENT_DUMMY.risks}
          />
          <AgentPanel
            title="Implementation Roadmap"
            icon="🗓️"
            query="Give a high-level 3-phase implementation plan for rolling out new EV charging infrastructure in Bangalore based on priority zones. Phase 1 (0-6 months), Phase 2 (6-18 months), Phase 3 (18-36 months). Include key milestones and dependencies."
            minHeight="160px"
            maxHeight="320px"
            dummyContent={AGENT_DUMMY.roadmap}
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
