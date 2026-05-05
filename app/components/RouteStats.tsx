import type { EVRoute } from '@/app/lib/types';

interface RouteStatsProps {
  route: EVRoute;
}

export default function RouteStats({ route }: RouteStatsProps) {
  const stats = [
    { label: 'Total EVs on Path', value: route.totalEVs, icon: '⚡', color: 'text-amber-600' },
    { label: 'Distance', value: `${route.distance} km`, icon: '📏', color: 'text-blue-600' },
    { label: 'Est. Travel Time', value: `${route.estimatedTime} min`, icon: '⏱️', color: 'text-emerald-600' },
    { label: 'Charging Stations', value: route.chargingStations, icon: '🔋', color: 'text-purple-600' },
  ];

  return (
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
  );
}
