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
    <div className="h-[50vh] min-h-[320px] rounded-xl bg-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading Route Map...</span>
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
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          {/* Pickers */}
          <div className="space-y-4">
            <LocationPicker
              locations={LOCATIONS}
              label="Pick-up"
              icon="A"
              accentColor="#059669"
              value={origin}
              onChange={setOrigin}
            />

            <div className="flex items-center gap-2 pl-3">
              <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-400 to-red-400 rounded-full" />
              <span className="text-xs text-slate-400">Route path</span>
            </div>

            <LocationPicker
              locations={LOCATIONS.filter((l) => l.id !== origin?.id)}
              label="Drop-off"
              icon="B"
              accentColor="#DC2626"
              value={destination}
              onChange={setDestination}
            />

            {route && (
              <div className="animate-slide-up">
                <RouteStats route={route} />
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
