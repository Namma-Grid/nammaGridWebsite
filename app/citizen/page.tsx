'use client';

import Link from 'next/link';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DEMAND_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  demand: h >= 18 && h <= 21 ? 85 + Math.random() * 10 : h >= 6 && h <= 9 ? 65 + Math.random() * 10 : h >= 23 || h <= 5 ? 15 + Math.random() * 10 : 45 + Math.random() * 15,
  zone: h >= 18 && h <= 21 ? 'peak' : h >= 23 || h <= 5 ? 'offpeak' : 'normal',
}));

const QUICK_STATS = [
  { icon: '⚡', value: '847', label: 'Charging stations mapped across Bengaluru' },
  { icon: '💚', value: '₹180/mo', label: 'Average savings by charging off-peak' },
  { icon: '⏱️', value: '8 min', label: 'Average wait time today' },
  { icon: '📍', value: '1.2 km', label: 'Nearest station from city center' },
];

function BestTimeChart() {
  return (
    <div className="glass-card-static p-5">
      <h3 className="text-base font-bold text-slate-800 mb-1">Best Time to Charge Today</h3>
      <p className="text-xs text-slate-500 mb-4">Bengaluru average · updates hourly</p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={DEMAND_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickFormatter={(h) => `${h}h`} />
            <Tooltip
              formatter={(v: unknown) => [`${(v as number).toFixed(0)}%`, 'Congestion']}
              labelFormatter={(h) => `${h}:00`}
              contentStyle={{ fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="demand"
              stroke="#10b981"
              fill="url(#demandGrad)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-xs font-bold text-emerald-700 mb-0.5">💚 Best Window</div>
          <div className="text-sm font-bold text-emerald-800">11 PM – 5 AM</div>
          <div className="text-[11px] text-emerald-600">Cheapest & least congested</div>
        </div>
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <div className="text-xs font-bold text-red-700 mb-0.5">🔴 Avoid if possible</div>
          <div className="text-sm font-bold text-red-800">6 PM – 9 PM</div>
          <div className="text-[11px] text-red-600">Peak demand — expect waits</div>
        </div>
      </div>
    </div>
  );
}

export default function CitizenHome() {
  return (
    <div className="page-container">
      {/* Hero */}
      <div className="gradient-hero py-8 sm:py-12 animate-slide-up mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg">
            🚗
          </div>
          <span className="badge badge-emerald">AI-Powered Charging Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 leading-[1.1]">
          Find the best time and place to<br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            charge your EV
          </span>
          <span className="text-slate-900"> in Bengaluru</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
          AI-powered charging intelligence for smarter, cheaper, stress-free charging
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/citizen/routes" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">
            Plan My Route →
          </Link>
          <Link href="/citizen/forecast" className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
            Check Demand Now →
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger-children">
        {QUICK_STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="stat-value text-emerald-600">{s.value}</div>
            <div className="stat-label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Best time to charge */}
      <div className="mb-8">
        <BestTimeChart />
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[
          {
            href: '/citizen/routes',
            icon: '🗺️',
            title: 'Plan My Route',
            desc: 'Find the fastest path to your destination with charging stops along the way',
            color: 'text-emerald-600',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
            border: 'border-emerald-100/60',
            bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          },
          {
            href: '/citizen/forecast',
            icon: '📊',
            title: 'Charging Forecast',
            desc: 'See how busy charging stations are at different times in your neighborhood',
            color: 'text-blue-600',
            iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
            border: 'border-blue-100/60',
            bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          },
          {
            href: '/citizen/explore',
            icon: '🏙️',
            title: 'Explore 3D City',
            desc: 'Drive through a 3D Bengaluru and discover charging stations near you',
            color: 'text-purple-600',
            iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500',
            border: 'border-purple-100/60',
            bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
          },
        ].map((f) => (
          <Link key={f.href} href={f.href} className={`group relative overflow-hidden glass-card p-6 border ${f.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
            <div className={`absolute inset-0 ${f.bg} opacity-50 group-hover:opacity-80 transition-opacity`} />
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center text-white text-2xl shadow-md mb-4`}>{f.icon}</div>
              <h3 className={`text-base font-bold mb-1.5 ${f.color}`}>{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              <div className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${f.color} group-hover:gap-3 transition-all`}>
                Get started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
