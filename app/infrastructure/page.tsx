'use client';

import SectionWrapper from '@/app/components/SectionWrapper';
import AgentPanel from '@/app/components/AgentPanel';
import gridData from '@/bangalore-hex-grid.json';

const STATS = [
  { value: '1,519', label: 'Zones Analysed', color: 'text-blue-600' },
  { value: '47', label: 'Priority Zones', color: 'text-red-500' },
  { value: '23', label: 'Recommended Sites', color: 'text-emerald-600' },
  { value: '~340k', label: 'EVs by 2027', color: 'text-purple-600' },
];

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
            <strong>Decision-support layer:</strong> All recommendations work as an overlay on existing
            BESCOM distribution infrastructure — no grid modifications required. Outputs use synthetic
            and masked data and are fully explainable.
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

        {/* Row 1: Priority zones + new locations */}
        <div className="grid gap-5 lg:grid-cols-2 mb-5">
          <AgentPanel
            title="Priority Zones — Urgent Need"
            icon="🔴"
            query="Identify the top 8 Bangalore zones urgently needing new EV charging stations. For each zone give: zone name, peak demand (kWh), grid stress level, current charger count vs needed, and priority score out of 10. Format as a clear ranked list."
            badge="Ranked"
            minHeight="240px"
            maxHeight="440px"
          />
          <AgentPanel
            title="New Station Recommendations"
            icon="📍"
            query="Recommend 6 specific optimal locations for new EV charging stations in Bangalore. For each location provide: exact area name, zone type, recommended station capacity (kW), number of charging points, primary justification, and grid capacity headroom available. Make it actionable."
            badge="AI Recommended"
            minHeight="240px"
            maxHeight="440px"
          />
        </div>

        {/* Row 2: Growth corridors + baseline comparison */}
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

        {/* Row 3: Grid constraints + demand growth */}
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

        {/* Row 4: Evaluation + risk */}
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
