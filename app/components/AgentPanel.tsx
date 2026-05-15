'use client';

import { useState, useEffect, useRef } from 'react';
import { queryAgent, hasAgentCache } from '@/app/lib/agent';
import MarkdownView from '@/app/components/MarkdownView';

interface Props {
  title: string;
  icon: string;
  query: string;
  badge?: string;
  defaultOpen?: boolean;
  /** kept for backwards compatibility — when true, panel auto-opens on mount */
  autoFetch?: boolean;
  minHeight?: string;
  maxHeight?: string;
  /** Show this content by default; agent only called when user clicks refresh */
  dummyContent?: string;
}

export default function AgentPanel({
  title,
  icon,
  query,
  badge,
  defaultOpen,
  autoFetch,
  minHeight = '160px',
  maxHeight = '400px',
  dummyContent,
}: Props) {
  const initialOpen = defaultOpen ?? autoFetch ?? false;
  const [open, setOpen] = useState(initialOpen);
  const [reply, setReply] = useState(dummyContent ?? '');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(!!dummyContent);
  const [isLive, setIsLive] = useState(false);
  const [cached, setCached] = useState(false);
  const queryRef = useRef(query);

  function fetchData(q: string, bust = false) {
    setLoading(true);
    queryAgent(q, bust)
      .then((r) => {
        setReply(r);
        setFetched(true);
        setIsLive(true);
        setCached(hasAgentCache(q));
      })
      .catch(() => {
        if (!dummyContent && !isLive) {
          setReply('Failed to reach BESCOM agent. Check connection and retry.');
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    queryRef.current = query;
    if (open && isLive) fetchData(query);
    else if (!isLive && dummyContent) setReply(dummyContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (open && !fetched && !loading) fetchData(queryRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const preCached = !fetched && hasAgentCache(query);
  const showSample = !!dummyContent && !isLive;

  return (
    <div className="glass-card-static overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-slate-50/60 transition-colors"
      >
        <span className="text-base shrink-0">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="truncate">{title}</span>
          {badge && <span className="badge badge-blue">{badge}</span>}
          {(cached || preCached) && !loading && isLive && (
            <span className="text-[10px] text-emerald-600 font-medium ml-1">cached</span>
          )}
        </h3>
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-slate-100">
          <div className="flex justify-end pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchData(queryRef.current, true);
              }}
              disabled={loading}
              className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 disabled:opacity-50"
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
              {showSample ? 'Get AI Analysis' : 'Refresh'}
            </button>
          </div>
          <div className="overflow-y-auto" style={{ minHeight, maxHeight }}>
            {loading && !reply ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 text-xs">Agent analysing…</span>
              </div>
            ) : reply ? (
              <MarkdownView content={reply} />
            ) : (
              <div className="flex items-center justify-center h-full py-6">
                <span className="text-slate-400 text-xs">Powered by BESCOM EV Agent</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
