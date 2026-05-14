'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    title: 'Welcome to NammaGrid',
    body: 'We solve Bengaluru\'s EV grid crisis with AI-powered decision tools for operators and citizens.',
    action: null,
    position: { bottom: 120, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'BESCOM Operator Access',
    body: 'BESCOM grid operators get secure access via PIN. Use PIN: BESCOM2026 to explore the full operator dashboard.',
    action: null,
    position: { bottom: 120, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Operator Overview',
    body: 'Real-time grid load (847 MW), stress zones, EV sessions, and efficiency metrics — all in one command center.',
    action: { label: 'Open Operator Dashboard', href: '/operator', role: 'operator' },
    position: { top: 80, right: 24 },
  },
  {
    title: 'Demand Forecast',
    body: '24-hour ML forecasting vs unmanaged baseline — visualize the grid savings from smart scheduling.',
    action: { label: 'View Demand Page', href: '/operator/demand', role: 'operator' },
    position: { top: 80, right: 24 },
  },
  {
    title: 'Infrastructure Planner',
    body: '23 priority zones, ML-scored and grid-constrained. See where Bengaluru needs charging stations most urgently.',
    action: { label: 'View Infrastructure', href: '/operator/infrastructure', role: 'operator' },
    position: { top: 80, right: 24 },
  },
  {
    title: 'Now Switch to Citizen View',
    body: 'Citizens get a friendly, jargon-free interface for route planning and charging guidance.',
    action: { label: 'Switch to EV Driver', href: '/citizen', role: 'citizen' },
    position: { bottom: 120, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Route Planner',
    body: 'Find the best route AND the best time to charge. Charging station recommendations along the way.',
    action: { label: 'Plan a Route', href: '/citizen/routes', role: 'citizen' },
    position: { bottom: 120, left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Projected Impact: ₹2.1Cr/month',
    body: 'See the full business case — ₹2.1Cr/month in grid stress savings, 340 MWh shifted off-peak, 23 priority zones identified.',
    action: { label: 'View Impact Report', href: '/about', role: null },
    position: { bottom: 120, left: '50%', transform: 'translateX(-50%)' },
  },
];

interface Props { onClose: () => void }

export default function DemoTour({ onClose }: Props) {
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('namma_tour_step');
    return saved ? Math.min(parseInt(saved, 10), STEPS.length - 1) : 0;
  });
  const router = useRouter();
  const current = STEPS[step];

  useEffect(() => {
    localStorage.setItem('namma_tour_step', String(step));
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && step < STEPS.length - 1) setStep((s) => s + 1);
      if (e.key === 'ArrowLeft' && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, onClose]);

  function handleNext() {
    const nextStep = step < STEPS.length - 1 ? step + 1 : null;
    if (current.action) {
      if (current.action.role) localStorage.setItem('namma_role', current.action.role);
      if (nextStep !== null) {
        localStorage.setItem('namma_tour_step', String(nextStep));
        router.push(current.action.href);
        setStep(nextStep);
      } else {
        router.push(current.action.href);
        onClose();
      }
      return;
    }
    if (nextStep !== null) {
      setStep(nextStep);
    } else {
      onClose();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]" />

      {/* Tooltip */}
      <div className="tour-tooltip" style={{ ...(current.position as React.CSSProperties) }}>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-blue-400 w-4' : 'bg-slate-600'}`}
            />
          ))}
        </div>

        <h3 className="text-white font-bold text-base mb-2">{current.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-5">{current.body}</p>

        <div className="flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="px-3 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5 transition-colors">
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              {step === STEPS.length - 1 ? 'Finish ✓' : current.action ? `${current.action.label} →` : 'Next →'}
            </button>
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-slate-600">
          {step + 1} / {STEPS.length} · Press ← → to navigate
        </div>
      </div>
    </>
  );
}
