'use client';

import { useState, useRef, useEffect } from 'react';
import type { LocationOption } from '@/app/lib/types';

interface LocationPickerProps {
  locations: LocationOption[];
  label: string;
  icon: string;
  accentColor: string;
  value: LocationOption | null;
  onChange: (location: LocationOption) => void;
}

export default function LocationPicker({
  locations,
  label,
  icon,
  accentColor,
  value,
  onChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.area.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationOption) => {
    onChange(loc);
    setQuery('');
    setIsOpen(false);
    setFocusIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[focusIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="location-input pl-4 pr-10"
          placeholder={value ? value.name : `Search ${label.toLowerCase()}...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setFocusIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {/* Selected indicator */}
        {value && !query && (
          <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
            <span className="text-slate-800 font-medium">{value.name}</span>
          </div>
        )}

        {/* Clear button */}
        {value && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            onClick={() => {
              onChange(null as unknown as LocationOption);
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 location-dropdown z-50"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No locations found
            </div>
          ) : (
            filtered.map((loc, i) => (
              <div
                key={loc.id}
                className={`location-item flex items-center gap-3 touch-manipulation ${
                  i === focusIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelect(loc)}
                onMouseEnter={() => setFocusIndex(i)}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                  📍
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{loc.name}</div>
                  <div className="text-xs text-slate-500">{loc.area}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
