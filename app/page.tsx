'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATS_BAR = [
  '1,519 Hex Cells Mapped',
  '23 Priority Zones Identified',
  '₹4.2Cr Grid Stress Prevented (Projected)',
  '58 Road Segments Analyzed',
];

export default function LandingPage() {
  const router = useRouter();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    // Skip redirect if demo tour is active or was just cleared
    if (localStorage.getItem('namma_tour_active') === 'true') return;
    const role = localStorage.getItem('namma_role');
    if (role === 'operator' || role === 'citizen') {
      router.replace(`/${role}`);
    }
  }, [router]);

  function handleOperatorClick() {
    setPin('');
    setPinError('');
    setShowPin(true);
  }

  function handlePinSubmit() {
    if (pin === 'BESCOM2026') {
      localStorage.setItem('namma_role', 'operator');
      setShowPin(false);
      router.push('/operator');
    } else {
      setPinError('Incorrect PIN. Try BESCOM2026.');
    }
  }

  function handleCitizenClick() {
    localStorage.setItem('namma_role', 'citizen');
    router.push('/citizen');
  }

  return (
    <div className="landing-page">
      {/* Background grid */}
      <div className="landing-grid-bg" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 sm:px-10 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-base font-bold shadow-lg">
              ⚡
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Namma<span className="text-blue-400">Grid</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAbout(true)}
              className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4"
            >
              About this project
            </button>
            <button
              onClick={() => {
                localStorage.setItem('namma_tour_active', 'true');
                localStorage.setItem('namma_tour_step', '0');
                window.dispatchEvent(new Event('namma_tour_change'));
              }}
              className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/30 transition-colors"
            >
              ▶ Start Demo
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4">
          <div className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            BESCOM × AI for Bharat Hackathon 2026
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-2">
            Powering Bengaluru&apos;s<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              EV Future
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed mb-5">
            Grid-Aware. Data-Driven. Real-Time. — Choose your role to get started.
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
            {/* Operator card */}
            <button
              onClick={handleOperatorClick}
              className="role-card group text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                  ⚡
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-400/30 text-red-300 text-[11px] font-bold uppercase tracking-wider">
                  Restricted
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">BESCOM Operator</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Grid management, infrastructure planning & demand forecasting
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-400 group-hover:gap-3 transition-all">
                Enter with PIN
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Citizen card */}
            <button
              onClick={handleCitizenClick}
              className="role-card group text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                  🚗
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                  Public Access
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">EV Driver / Citizen</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Find charging stations, plan routes & check demand
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:gap-3 transition-all">
                Enter free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {STATS_BAR.map((s, i) => (
              <span key={i} className="flex items-center gap-2 text-xs text-slate-500">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />}
                <span className="text-slate-400 font-medium">{s}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPin(false)} />
          <div className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl">🔒</div>
              <div>
                <h3 className="text-white font-bold text-base">BESCOM Operator Access</h3>
                <p className="text-slate-400 text-xs">Enter your access PIN to continue</p>
              </div>
            </div>

            <input
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              placeholder="Enter PIN"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 mb-2 font-mono tracking-widest"
            />
            {pinError && <p className="text-red-400 text-xs mb-3">{pinError}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowPin(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
              >
                Enter →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
          <div className="relative bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up overflow-y-auto max-h-[80vh]">
            <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 text-xl">×</button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-xl">⚡</div>
              <h3 className="text-white font-bold text-lg">About NammaGrid</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>
                <strong className="text-white">NammaGrid</strong> is a spatio-temporal decision-support platform built for BESCOM (Bangalore Electricity Supply Company) to manage the rapid growth of EV charging demand across Bengaluru.
              </p>
              <p>
                It combines <strong className="text-slate-300">H3 hexagonal spatial indexing</strong>, <strong className="text-slate-300">ML demand forecasting</strong>, and <strong className="text-slate-300">LP-based schedule optimization</strong> to give grid operators real-time visibility and citizens actionable charging guidance.
              </p>
              <p>
                Built for the <strong className="text-slate-300">AI for Bharat Hackathon 2026</strong> — a national initiative to apply AI in public infrastructure.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <p className="text-slate-500">Stack: Next.js 16 · React 19 · H3-JS · Leaflet · Three.js · Recharts · BESCOM AI API</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
