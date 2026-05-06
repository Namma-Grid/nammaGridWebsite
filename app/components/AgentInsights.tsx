'use client';

import { useState, useEffect, useRef } from 'react';
import { queryAgent } from '@/app/lib/agent';
import MarkdownView from '@/app/components/MarkdownView';

interface Props {
  area: string;
  zone: string;
  dateOffset: number;
  hour: number;
}

export default function AgentInsights({ area, zone, dateOffset, hour }: Props) {
  const [reply, setReply] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [top5, setTop5] = useState<string>('');
  const [top5Loading, setTop5Loading] = useState(false);
  const [activeTab, setActiveTab] = useState<'forecast' | 'top5'>('forecast');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError('');
    setReply('');

    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    const dateLabel = dateOffset === 0 ? 'today' : dateOffset === 1 ? 'tomorrow' : `in ${dateOffset} days`;
    const msg = `Predict EV charging demand for ${area} (${zone} zone) at ${timeLabel} ${dateLabel}. Give 24-hour forecast breakdown.`;

    queryAgent(msg)
      .then((r) => {
        setReply(r);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError('Failed to fetch prediction from agent.');
          setLoading(false);
        }
      });
  }, [area, zone, dateOffset, hour]);

  function fetchTop5() {
    if (top5Loading) return;
    setTop5Loading(true);
    setTop5('');
    queryAgent('Top 5 demand cells tonight with peak kWh and zone breakdown')
      .then((r) => {
        setTop5(r);
        setTop5Loading(false);
        setActiveTab('top5');
      })
      .catch(() => {
        setTop5Loading(false);
      });
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
        <div className="flex gap-1">
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
            onClick={() => {
              setActiveTab('top5');
              if (!top5) fetchTop5();
            }}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'top5'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Top 5 Cells
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
          loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-xs">Agent predicting demand…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          ) : reply ? (
            <MarkdownView content={reply} />
          ) : null
        ) : top5Loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-xs">Agent fetching top demand cells…</span>
          </div>
        ) : top5 ? (
          <MarkdownView content={top5} />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <button
              onClick={fetchTop5}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              🔥 Fetch Top 5 Demand Cells
            </button>
            <span className="text-slate-400 text-xs">Live data from BESCOM agent</span>
          </div>
        )}
      </div>
    </div>
  );
}
