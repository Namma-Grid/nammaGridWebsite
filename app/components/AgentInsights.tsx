'use client';

import { useState, useRef } from 'react';
import { queryAgent } from '@/app/lib/agent';
import MarkdownView from '@/app/components/MarkdownView';

const DUMMY_FORECAST = `## EV Demand Forecast

| Time Window | Demand Level | Est. Sessions | Avg Wait |
|-------------|-------------|---------------|----------|
| 00:00–05:00 | 🟢 Low | 8–12 / hr | < 3 min |
| 05:00–08:00 | 🟡 Rising | 18–25 / hr | 5 min |
| 08:00–10:00 | 🟠 Medium | 32–40 / hr | 8 min |
| 10:00–17:00 | 🟡 Moderate | 22–30 / hr | 6 min |
| **17:00–21:00** | **🔴 Peak** | **55–70 / hr** | **15+ min** |
| 21:00–23:00 | 🟠 Declining | 28–35 / hr | 7 min |

**Peak load tonight:** 78 kWh (6 PM – 8 PM)
**Best charging window:** 11 PM – 2 AM (saves ₹42 vs peak)
**Confidence:** 87% (90-day historical baseline)
`;

const DUMMY_TOP5 = `## Top 5 Demand Cells Tonight

| Rank | Area | Zone | Peak kWh | Sessions |
|------|------|------|---------|---------|
| #1 | Whitefield ITPL Hub | Workplace | 142 kWh | 210 |
| #2 | Koramangala 80 Feet Rd | Marketplace | 118 kWh | 178 |
| #3 | HSR Layout 27th Main | Residential | 97 kWh | 145 |
| #4 | Electronic City Ph-1 | Workplace | 89 kWh | 134 |
| #5 | Marathahalli Bridge | Marketplace | 76 kWh | 112 |

**Total tonight:** 522 kWh across top 5 cells · Peak window: 18:00–21:00
**Zone split:** Workplace 44% · Marketplace 37% · Residential 19%
`;

interface Props {
  area: string;
  zone: string;
  dateOffset: number;
  hour: number;
}

export default function AgentInsights({ area, zone, dateOffset, hour }: Props) {
  const [reply, setReply] = useState<string>(DUMMY_FORECAST);
  const [loading, setLoading] = useState(false);
  const [isLiveForecast, setIsLiveForecast] = useState(false);
  const [error, setError] = useState<string>('');
  const [top5, setTop5] = useState<string>(DUMMY_TOP5);
  const [top5Loading, setTop5Loading] = useState(false);
  const [isLiveTop5, setIsLiveTop5] = useState(false);
  const [activeTab, setActiveTab] = useState<'forecast' | 'top5'>('forecast');
  const abortRef = useRef<AbortController | null>(null);

  function fetchForecast() {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError('');
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    const dateLabel = dateOffset === 0 ? 'today' : dateOffset === 1 ? 'tomorrow' : `in ${dateOffset} days`;
    const msg = `Predict EV charging demand for ${area} (${zone} zone) at ${timeLabel} ${dateLabel}. Give 24-hour forecast breakdown.`;
    queryAgent(msg)
      .then((r) => { setReply(r); setIsLiveForecast(true); setLoading(false); })
      .catch((e) => {
        if (e.name !== 'AbortError') { setError('Failed to fetch prediction from agent.'); setLoading(false); }
      });
  }

  function fetchTop5() {
    if (top5Loading) return;
    setTop5Loading(true);
    queryAgent('Top 5 demand cells tonight with peak kWh and zone breakdown')
      .then((r) => { setTop5(r); setIsLiveTop5(true); setTop5Loading(false); setActiveTab('top5'); })
      .catch(() => { setTop5Loading(false); });
  }

  return (
    <div className="glass-card-static p-4 sm:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-purple-500">🤖</span>
          AI Agent Forecast
          <span className="badge badge-blue">BESCOM Agent</span>
        </h3>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'forecast'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Forecast
          </button>
          <button
            onClick={() => setActiveTab('top5')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'top5'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Top 5 Cells
          </button>
          <button
            onClick={() => activeTab === 'forecast' ? fetchForecast() : fetchTop5()}
            disabled={loading || top5Loading}
            title="Get AI Analysis"
            className="ml-1 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1 text-[11px]"
          >
            <svg className={`w-3.5 h-3.5 ${(loading || top5Loading) ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {(activeTab === 'forecast' && !isLiveForecast) || (activeTab === 'top5' && !isLiveTop5) ? 'Get AI Analysis' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Context pill */}
      {activeTab === 'forecast' && (
        <div className="flex gap-2 flex-wrap text-xs">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100 font-medium">
            📍 {area}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 capitalize font-medium">
            {zone}
          </span>
          <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-full border border-slate-100 font-mono">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[220px] overflow-y-auto max-h-[360px]">
        {activeTab === 'forecast' ? (
          loading && !reply ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-xs">Agent predicting demand…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          ) : (
            <MarkdownView content={reply} />
          )
        ) : top5Loading && !top5 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-xs">Agent fetching top demand cells…</span>
          </div>
        ) : (
          <MarkdownView content={top5} />
        )}
      </div>
    </div>
  );
}
