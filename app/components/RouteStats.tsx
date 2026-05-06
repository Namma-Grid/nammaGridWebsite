import type { EVRoute } from '@/app/lib/types';

interface RouteStatsProps {
  route: EVRoute;
}

export default function RouteStats({ route }: RouteStatsProps) {
  const stats = [
    { label: 'Total EVs on Path', value: route.totalEVs,              icon: '⚡', color: 'text-amber-600' },
    { label: 'Distance',          value: `${route.distance} km`,       icon: '📏', color: 'text-blue-600' },
    { label: 'Est. Travel Time',  value: `${route.estimatedTime} min`, icon: '⏱️', color: 'text-emerald-600' },
    { label: 'Charging Stations', value: route.chargingStations,       icon: '🔋', color: 'text-purple-600' },
  ];

  const hops = route.hexesOnPath?.length ?? 0;

  return (
    <div className="space-y-3">
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <span className={`stat-value text-lg ${stat.color}`}>{stat.value}</span>
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Dijkstra path breadcrumb */}
      {route.viaLocations && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-indigo-500 text-xs">🗺️</span>
            <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
              Shortest Path
            </span>
            <span className="ml-auto text-xs text-indigo-400">
              {hops} node{hops !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Origin → via … → Destination */}
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600 font-medium">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {route.origin.name}
            </span>

            {route.viaLocations.length > 0 ? (
              route.viaLocations.map((name, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-slate-300">→</span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {name}
                  </span>
                </span>
              ))
            ) : (
              <span className="text-slate-300 text-xs">→ direct</span>
            )}

            <span className="text-slate-300">→</span>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {route.destination.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
