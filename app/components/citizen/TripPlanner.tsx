'use client';

import { useState, useRef, useEffect } from 'react';
import type { LocationOption } from '@/app/lib/types';

type Field = 'from' | 'to';

interface TripPlannerProps {
  locations: LocationOption[];
  origin: LocationOption | null;
  destination: LocationOption | null;
  onOriginChange: (loc: LocationOption | null) => void;
  onDestinationChange: (loc: LocationOption | null) => void;
  onSwap: () => void;
}

function highlight(name: string, query: string) {
  if (!query) return name;
  const i = name.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return name;
  return (
    <>
      {name.slice(0, i)}
      <span className="font-semibold text-slate-900">{name.slice(i, i + query.length)}</span>
      {name.slice(i + query.length)}
    </>
  );
}

export default function TripPlanner({
  locations,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
}: TripPlannerProps) {
  const [open, setOpen] = useState<Field | null>(null);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(null);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const activeValue = open === 'from' ? origin : open === 'to' ? destination : null;
  const otherId = open === 'from' ? destination?.id : open === 'to' ? origin?.id : undefined;
  const filtered = locations.filter((l) => {
    if (l.id === otherId) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.area.toLowerCase().includes(q);
  });

  function selectLocation(loc: LocationOption) {
    if (open === 'from') onOriginChange(loc);
    if (open === 'to') onDestinationChange(loc);
    setOpen(null);
    setQuery('');
    setFocusIdx(-1);
  }

  function clear(field: Field) {
    if (field === 'from') onOriginChange(null);
    if (field === 'to') onDestinationChange(null);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx((p) => Math.min(p + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Enter' && focusIdx >= 0 && filtered[focusIdx]) {
      e.preventDefault();
      selectLocation(filtered[focusIdx]);
    } else if (e.key === 'Escape') {
      setOpen(null);
    }
  }

  function renderField(field: Field, value: LocationOption | null, placeholder: string, inputRef: React.RefObject<HTMLInputElement | null>) {
    const isOpen = open === field;
    return (
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() => {
            setOpen(field);
            setQuery('');
            setFocusIdx(-1);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={`block w-full text-left px-1 py-2.5 transition-colors ${
            isOpen ? 'text-slate-900' : value ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFocusIdx(-1);
              }}
              onKeyDown={onKeyDown}
              placeholder={value ? value.name : placeholder}
              className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-slate-400"
            />
          ) : (
            <span className="text-sm truncate block">{value ? value.name : placeholder}</span>
          )}
        </button>
        {value && !isOpen && (
          <button
            type="button"
            aria-label={`Clear ${field}`}
            onClick={(e) => {
              e.stopPropagation();
              clear(field);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-stretch gap-3">
        {/* Left rail */}
        <div className="relative flex flex-col items-center justify-between py-3.5 shrink-0">
          {/* Origin marker — filled disc with white inner ring */}
          <div className="relative w-3 h-3 rounded-full bg-emerald-600 ring-[2.5px] ring-emerald-100 z-10">
            <div className="absolute inset-[3px] rounded-full bg-white" />
          </div>
          {/* Connector line */}
          <div className="absolute top-3.5 bottom-3.5 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-slate-300" />
          {/* Destination marker — small square pin */}
          <div className="relative w-3 h-3 bg-rose-600 z-10" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }} />
        </div>

        {/* Fields */}
        <div className="flex-1 min-w-0 divide-y divide-slate-200/80">
          {renderField('from', origin, 'Search starting point', fromInputRef)}
          {renderField('to', destination, 'Search destination', toInputRef)}
        </div>

        {/* Swap */}
        <button
          type="button"
          onClick={onSwap}
          aria-label="Swap origin and destination"
          disabled={!origin && !destination}
          className="self-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v10M4 12L1.5 9.5M4 12l2.5-2.5M10 12V2M10 2L7.5 4.5M10 2l2.5 2.5" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-white/98 backdrop-blur-xl border border-slate-200/80 shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)] overflow-hidden">
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-500">No matches</div>
            ) : (
              filtered.map((loc, i) => (
                <button
                  key={loc.id}
                  type="button"
                  onMouseEnter={() => setFocusIdx(i)}
                  onClick={() => selectLocation(loc)}
                  className={`w-full px-4 py-2.5 text-left flex items-baseline justify-between gap-3 border-b border-slate-100 last:border-b-0 transition-colors ${
                    i === focusIdx ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm text-slate-600 truncate">
                    {highlight(loc.name, query)}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium shrink-0">
                    {loc.area}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-1.5 text-[10px] text-slate-400 border-t border-slate-100 flex items-center gap-3 font-mono">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc dismiss</span>
          </div>
        </div>
      )}
    </div>
  );
}
