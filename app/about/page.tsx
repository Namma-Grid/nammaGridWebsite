'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const PROBLEM_STATS = [
  { value: '1.2M+', label: 'Registered EVs as of 2025', source: 'Karnataka RTO' },
  { value: '12–18%', label: 'Localized grid stress in peak zones', source: 'BESCOM Internal Study' },
  { value: '₹340Cr', label: 'Estimated annual cost of unmanaged EV charging', source: 'BESCOM Projection' },
  { value: '1:1,416', label: 'EV-to-charger ratio (vs 1:10 global benchmark)', source: 'Karnataka EV Cell' },
];

const IMPACT_STATS = [
  { value: '₹2.1Cr', label: 'saved in grid stress costs / month (projected)', icon: '💰' },
  { value: '340 MWh', label: 'demand shifted off-peak / month', icon: '🔋' },
  { value: '61%', label: 'reduction in peak EV load vs baseline', icon: '📉' },
  { value: '23', label: 'priority zones identified for expansion', icon: '📍' },
  { value: '₹180', label: 'average savings / month per EV user', icon: '🚗' },
  { value: '8 min', label: 'average wait time reduction at peak stations', icon: '⏱️' },
];

const COMPARISON = [
  { metric: 'Demand forecasting', baseline: 'Manual / none', namma: '24-hr ML forecast, 5-min resolution' },
  { metric: 'Peak load management', baseline: 'Reactive', namma: 'Proactive LP-optimized scheduling' },
  { metric: 'Infrastructure siting', baseline: 'Experience-based', namma: 'ML-scored, grid-constrained' },
  { metric: 'Operator visibility', baseline: 'Zone-level (monthly)', namma: 'Cell-level (real-time hex grid)' },
  { metric: 'Citizen awareness', baseline: 'None', namma: 'Personalized charging guidance' },
];

const ROADMAP = [
  {
    phase: 'Phase 1',
    label: 'Now (Hackathon Demo)',
    color: 'border-blue-400 bg-blue-50',
    dot: 'bg-blue-500',
    items: ['Bengaluru city, synthetic + ML-modeled data', '7 features, 2 user roles', 'BESCOM EV AI + Agent backend'],
  },
  {
    phase: 'Phase 2',
    label: 'Pilot (3–6 months)',
    color: 'border-amber-400 bg-amber-50',
    dot: 'bg-amber-500',
    items: ['3 high-density corridors: Koramangala, Whitefield, Electronic City', 'Live SCADA integration (read-only)', '500 pilot EV users on citizen app', 'Real smart meter data ingestion'],
  },
  {
    phase: 'Phase 3',
    label: 'State Scale (12–18 months)',
    color: 'border-emerald-400 bg-emerald-50',
    dot: 'bg-emerald-500',
    items: ['All Karnataka DISCOMs (BESCOM, CESCOM, MESCOM, HESCOM, GESCOM)', '5M+ EV users on citizen portal', '50,000+ hex cells statewide', 'Integration with Karnataka EV Policy 2025 dashboard'],
  },
];

const SUPPORT_CARDS = [
  { icon: '📡', title: 'Data Access', desc: 'Read-only SCADA API + smart meter AMI feed' },
  { icon: '☁️', title: 'Cloud Infrastructure', desc: 'NIC or BESCOM private cloud provisioning' },
  { icon: '🗺️', title: 'Pilot Corridor', desc: '3-month access to Koramangala / Whitefield zone data' },
  { icon: '⚖️', title: 'Policy Alignment', desc: 'DPDP Act compliance review + CERT-In audit support' },
];

const SECURITY = [
  'No EV user PII collected — all queries are anonymous',
  'Grid data processed on-premise — no external LLM exposure for sensitive data',
  'BESCOM Operator access PIN-protected (production: LDAP/SSO integration ready)',
  'All API responses cached — no raw grid data exposed in transit',
  'Compliant with IT Act 2000 and upcoming DPDP Act 2023 requirements',
  'Audit log ready — all operator actions can be logged',
];

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className={`transition-all duration-700 ${triggered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {target}{suffix}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl no-print">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">⚡</div>
            <span className="text-white font-bold text-sm">NammaGrid · Impact & Business Case</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.print()} className="text-slate-400 hover:text-white text-xs transition-colors">🖨️ Print Report</button>
            <Link href="/" className="text-slate-400 hover:text-white text-xs transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Section A: Problem */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Section A</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 mb-3">The Problem in Numbers</h2>
            <p className="text-slate-400 text-base">Bengaluru&apos;s EV charging crisis — quantified.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PROBLEM_STATS.map((s) => (
              <div key={s.label} className="about-stat-card">
                <div className="text-2xl font-extrabold text-white font-mono mb-2">
                  <CountUp target={s.value} />
                </div>
                <div className="text-sm text-slate-300 leading-tight mb-2">{s.label}</div>
                <div className="text-[10px] text-slate-500">Source: {s.source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Comparison */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Section B</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 mb-3">What NammaGrid Does Differently</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Metric</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Status Quo (Baseline)</th>
                  <th className="text-left py-3 px-4 text-emerald-400 font-semibold">NammaGrid</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.metric} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-white font-medium">{row.metric}</td>
                    <td className="py-3 px-4 text-red-400">{row.baseline}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{row.namma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section C: Impact */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Section C</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 mb-3">Projected Impact</h2>
            <p className="text-slate-400 text-sm">Projections based on LP optimization model outputs benchmarked against Karnataka DISCOM peak management reports and IEA EV charging demand studies.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {IMPACT_STATS.map((s) => (
              <div key={s.label} className="about-stat-card text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  <CountUp target={s.value} />
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section D: Infrastructure & Costs */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Section D</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Infrastructure & Costs</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="about-stat-card">
              <h3 className="text-white font-bold text-base mb-3">Deployment Architecture</h3>
              <div className="space-y-3 text-xs text-slate-400 font-mono">
                <div>
                  <p className="text-slate-300 font-semibold text-sm mb-1">Current (Demo)</p>
                  <p>Vercel (Next.js) + BESCOM AI API + Static H3 JSON</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-slate-300 font-semibold text-sm mb-2">Production (BESCOM Cloud)</p>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>App servers (2× 4vCPU, 16GB)</span><span className="text-white">₹1.8L/mo</span></div>
                    <div className="flex justify-between"><span>ML inference (GPU T4)</span><span className="text-white">₹2.4L/mo</span></div>
                    <div className="flex justify-between"><span>Redis cache</span><span className="text-white">₹40K/mo</span></div>
                    <div className="flex justify-between"><span>CDN (Cloudflare)</span><span className="text-white">₹15K/mo</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-1 font-bold text-white"><span>Total operational</span><span>~₹4.55L/mo</span></div>
                    <div className="flex justify-between text-slate-300"><span>One-time setup</span><span>~₹12L</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-stat-card">
              <h3 className="text-white font-bold text-base mb-3">Integration Effort</h3>
              <div className="space-y-3">
                {[
                  { label: 'BESCOM SCADA read-only API integration', time: '3–4 weeks' },
                  { label: 'Smart meter data pipeline (via AMI)', time: '6–8 weeks' },
                  { label: 'Operator training', time: '2 days / batch' },
                  { label: 'CERT-In security audit', time: '2–3 weeks' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-mono text-xs px-2 py-0.5 bg-white/5 rounded">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section E: Security */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Section E</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Security & Data Sovereignty</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECURITY.map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-emerald-400 shrink-0 mt-0.5">✅</span>
                <span className="text-slate-300 text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section F: Roadmap */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Section F</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Scalability Roadmap</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ROADMAP.map((r) => (
              <div key={r.phase} className={`rounded-2xl border-2 ${r.color} p-5`}>
                <div className={`w-3 h-3 rounded-full ${r.dot} mb-3`} />
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{r.phase}</div>
                <div className="text-sm font-bold text-slate-800 mb-3">{r.label}</div>
                <ul className="space-y-1.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Section G: Support needed */}
        <div className="about-section">
          <div className="mb-8">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Section G</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">What Support We Need</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_CARDS.map((c) => (
              <div key={c.title} className="about-stat-card text-center">
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="text-white font-bold text-base mb-2">{c.title}</div>
                <div className="text-slate-400 text-xs leading-snug">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="py-10 text-center">
          <p className="text-slate-500 text-sm mb-4">Built for BESCOM × AI for Bharat Hackathon 2026</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors">← Back to Home</Link>
            <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors no-print">🖨️ Print Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}
