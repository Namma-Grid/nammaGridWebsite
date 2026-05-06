'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import SectionWrapper from '@/app/components/SectionWrapper';
import LocationPicker from '@/app/components/LocationPicker';
import RouteStats from '@/app/components/RouteStats';
import { LOCATIONS, generateRoute } from '@/app/data/ev-routes';
import type { LocationOption, EVRoute } from '@/app/lib/types';

const EVRouteMap = dynamic(() => import('@/app/components/EVRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] min-h-[320px] rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Loading Route Map...</span>
      </div>
    </div>
  ),
});

export default function RoutesPage() {
  const [origin, setOrigin] = useState<LocationOption | null>(null);
  const [destination, setDestination] = useState<LocationOption | null>(null);

  const route: EVRoute | null = useMemo(() => {
    if (!origin || !destination || origin.id === destination.id) return null;
    return generateRoute(origin.id, destination.id) as EVRoute | null;
  }, [origin, destination]);

  return (
    <div className="page-container">
      <SectionWrapper
        id="routes"
        title="EV Route Intelligence"
        subtitle="Select origin and destination to visualize the shortest path and see how many EVs are currently traversing each segment."
        icon="🛣️"
        badge="Live"
      >
        {/* Mobile: stacked, Desktop: side by side */}
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* Pickers panel */}
          <div className="space-y-4">
            <LocationPicker
              locations={LOCATIONS}
              label="Pick-up"
              icon="A"
              accentColor="#059669"
              value={origin}
              onChange={setOrigin}
            />

            {/* Route path connector */}
            <div className="flex items-center gap-3 pl-3">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-1 h-1.5 rounded-full bg-emerald-400" />
                <div className="w-0.5 h-3 bg-gradient-to-b from-emerald-400 to-red-400 rounded-full" />
                <div className="w-1 h-1.5 rounded-full bg-red-400" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Shortest path</span>
            </div>

            <LocationPicker
              locations={LOCATIONS.filter((l) => l.id !== origin?.id)}
              label="Drop-off"
              icon="B"
              accentColor="#DC2626"
              value={destination}
              onChange={setDestination}
            />

            {/* Route stats — animated in */}
            {route && (
              <div className="animate-slide-up pt-2">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4" />
                <RouteStats route={route} />
              </div>
            )}

            {/* Hint when no route selected */}
            {!route && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 pt-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                Select both locations to see the EV route analysis
              </div>
            )}
          </div>

          {/* Map */}
          <EVRouteMap route={route} />
        </div>
      </SectionWrapper>
    </div>
  );
}
