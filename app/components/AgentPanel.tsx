'use client';

import { useState, useEffect, useRef } from 'react';
import { queryAgent } from '@/app/lib/agent';
import MarkdownView from '@/app/components/MarkdownView';

interface Props {
  title: string;
  icon: string;
  query: string;
  badge?: string;
  autoFetch?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export default function AgentPanel({
  title,
  icon,
  query,
  badge,
  autoFetch = true,
  minHeight = '160px',
  maxHeight = '400px',
}: Props) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const queryRef = useRef(query);

  function fetchData(q: string) {
    setLoading(true);
    setReply('');
    queryAgent(q)
      .then((r) => {
        setReply(r);
        setLoading(false);
        setFetched(true);
      })
      .catch(() => {
        setReply('Failed to reach BESCOM agent. Check connection and retry.');
        setLoading(false);
      });
  }

  useEffect(() => {
    queryRef.current = query;
    if (autoFetch) fetchData(query);
  }, [query, autoFetch]);

  return (
    <div className="glass-card-static p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
          <span>{icon}</span>
          {title}
          {badge && <span className="badge badge-blue">{badge}</span>}
        </h3>
        <button
          onClick={() => fetchData(queryRef.current)}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-blue-600 transition-colors shrink-0 flex items-center gap-1"
        >
          <svg
            className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      <div
        className="overflow-y-auto"
        style={{ minHeight, maxHeight }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-xs">Agent analysing…</span>
          </div>
        ) : reply ? (
          <MarkdownView content={reply} />
        ) : !autoFetch && !fetched ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <button
              onClick={() => fetchData(queryRef.current)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Ask Agent
            </button>
            <span className="text-slate-400 text-xs">Powered by BESCOM EV Agent</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
