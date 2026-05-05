import Link from 'next/link';
import gridData from '@/bangalore-hex-grid.json';

const FEATURES = [
  {
    href: '/hexgrid',
    icon: '⬡',
    title: 'Bengaluru Hex Grid',
    description: 'H3 hexagonal spatial index with 1,519 cells at resolution 8. Explore zone classifications and demand status across the city.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    href: '/routes',
    icon: '⚡',
    title: 'EV Route Intelligence',
    description: 'Visualize shortest paths between locations and see EV density on each route segment in real time.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    href: '/demand',
    icon: '📊',
    title: 'Grid Demand Prediction',
    description: 'AI-driven 24-hour demand forecasting with interactive heatmaps and time-series analysis by zone.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
];

export default function HomePage() {
  const totalCells = gridData.meta.totalCells;
  const zones = gridData.meta.zoneCounts;

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="gradient-hero py-8 sm:py-12 animate-slide-up">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-xl shadow-lg">
            ⚡
          </div>
          <span className="badge badge-blue">AI-Powered Decision Support</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-slate-900">
          Volt<span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Route</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
          Spatio-temporal intelligence for grid-aware EV infrastructure planning
          across Bengaluru. Predict demand, optimize routes, and plan charging
          infrastructure — all without modifying existing distribution systems.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 stagger-children">
          <div className="stat-card">
            <div className="stat-value text-blue-600">{totalCells.toLocaleString()}</div>
            <div className="stat-label">Hex Cells</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-emerald-600">{zones.residential}</div>
            <div className="stat-label">Residential</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-amber-600">{zones.workplace}</div>
            <div className="stat-label">Workplace</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-purple-600">{zones.marketplace}</div>
            <div className="stat-label">Marketplace</div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`glass-card p-6 sm:p-7 group ${f.border} border hover:scale-[1.02] transition-transform`}
          >
            <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center text-2xl mb-4`}>
              {f.icon}
            </div>
            <h2 className={`text-lg font-semibold mb-2 ${f.color}`}>{f.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              Explore
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
