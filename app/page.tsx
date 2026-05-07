import Link from 'next/link';
import gridData from '@/bangalore-hex-grid.json';

const FEATURES = [
  {
    href: '/hexgrid',
    icon: '⬡',
    title: 'Bengaluru Hex Grid',
    description:
      'H3 hexagonal spatial index with 1,519 cells at resolution 8. Explore zone classifications and demand status across the city.',
    color: 'text-blue-600',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-100/60',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    badge: null,
  },
  {
    href: '/routes',
    icon: '⚡',
    title: 'EV Route Intelligence',
    description:
      'Visualize shortest paths between locations and see EV density on each route segment in real time.',
    color: 'text-emerald-600',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-100/60',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    badge: null,
  },
  {
    href: '/demand',
    icon: '📊',
    title: 'Grid Demand Prediction',
    description:
      'AI-driven 24-hour demand forecasting powered by the BESCOM EV Agent. Interactive heatmaps and real-time zone analysis.',
    color: 'text-amber-600',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-100/60',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    badge: 'Part A',
  },
  {
    href: '/schedule',
    icon: '⏱️',
    title: 'Charging Schedule Optimizer',
    description:
      'AI recommendations for optimal EV charging windows. Reduce peak load, lower costs, and align with grid capacity — no infrastructure changes.',
    color: 'text-purple-600',
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    border: 'border-purple-100/60',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500',
    badge: 'Part A',
  },
  {
    href: '/infrastructure',
    icon: '🏗️',
    title: 'Infrastructure Location Planner',
    description:
      'Identify priority zones and optimal locations for new charging stations. AI-powered site selection with demand growth and grid constraint analysis.',
    color: 'text-rose-600',
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    border: 'border-rose-100/60',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
    badge: 'Part B',
  },
  {
    href: '/explore',
    icon: '🏙️',
    title: '3D City Explorer',
    description:
      'Drive through a 3D Bengaluru cityscape and discover the nearest EV charging stations with real-time grid load, capacity, and pricing data.',
    color: 'text-purple-600',
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    border: 'border-purple-100/60',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500',
  },
];

const STATS = [
  { value: gridData.meta.totalCells.toLocaleString(), label: 'Hex Cells', color: 'text-blue-600', dotColor: 'bg-blue-500' },
  { value: gridData.meta.zoneCounts.residential, label: 'Residential', color: 'text-emerald-600', dotColor: 'bg-emerald-500' },
  { value: gridData.meta.zoneCounts.workplace, label: 'Workplace', color: 'text-amber-600', dotColor: 'bg-amber-500' },
  { value: gridData.meta.zoneCounts.marketplace, label: 'Marketplace', color: 'text-purple-600', dotColor: 'bg-purple-500' },
];

export default function HomePage() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="gradient-hero py-6 sm:py-10 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20">
            ⚡
          </div>
          <span className="badge badge-blue">AI-Powered Decision Support</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 leading-[1.1]">
          Namma
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            Grid
          </span>
        </h1>

        <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
          Spatio-temporal intelligence for grid-aware EV infrastructure planning
          across Bengaluru. Predict demand, optimize routes, and plan charging
          infrastructure — all without modifying existing distribution systems.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-card group">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-2 h-2 rounded-full ${stat.dotColor}`} />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                  {stat.label}
                </span>
              </div>
              <div className={`stat-value ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`group relative overflow-hidden glass-card p-6 sm:p-7 ${f.border} border hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
          >
            {/* Subtle background gradient */}
            <div className={`absolute inset-0 ${f.bg} opacity-50 group-hover:opacity-80 transition-opacity`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center text-white text-2xl shadow-md`}>
                  {f.icon}
                </div>
                {f.badge && (
                  <span className="badge badge-blue text-xs">{f.badge}</span>
                )}
              </div>
              <h2 className={`text-lg font-bold mb-2 ${f.color}`}>{f.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-300">
                Explore
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tech badge bar */}
      <div className="mt-10 flex flex-wrap gap-2 justify-center">
        {['H3 Hexagonal Grid', 'Graph Neural Network', 'Temporal Attention', 'BESCOM Grid Data'].map((t) => (
          <span key={t} className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-100 text-[11px] text-slate-400 font-medium tracking-wide">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
