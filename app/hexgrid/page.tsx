'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import SectionWrapper from '@/app/components/SectionWrapper';
import ZoneLegend from '@/app/components/ZoneLegend';
import type { HexCell } from '@/app/lib/types';
import gridData from '@/bangalore-hex-grid.json';

const HexGridMap = dynamic(() => import('@/app/components/HexGridMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] min-h-[320px] rounded-xl bg-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading Hex Grid Map...</span>
      </div>
    </div>
  ),
});

function enrichCells(rawCells: typeof gridData.grid): HexCell[] {
  return rawCells.map((cell) => {
    const seed = cell.h3Index.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const demandLevel = Math.round(
      (cell.zone === 'workplace' ? 40 : cell.zone === 'marketplace' ? 50 : 25) +
        ((seed % 50) - 10)
    );
    return {
      ...cell,
      demanded: demandLevel > 55,
      demandLevel: Math.max(0, Math.min(100, demandLevel)),
      evCount: Math.floor(5 + (seed % 30)),
    } as HexCell;
  });
}

export default function HexGridPage() {
  const cells = useMemo(() => enrichCells(gridData.grid), []);
  const zoneCounts = gridData.meta.zoneCounts;

  return (
    <div className="page-container">
      <SectionWrapper
        id="hexgrid"
        title="Bengaluru Hex Grid"
        subtitle="H3 hexagonal spatial index covering 1,519 cells at resolution 8. Each hexagon represents a ~461m zone classified by land-use type with real-time demand status."
        icon="⬡"
        badge={`${gridData.meta.h3Resolution} Resolution`}
      >
        <ZoneLegend zoneCounts={zoneCounts} />
        <div className="mt-5">
          <HexGridMap cells={cells} />
        </div>
      </SectionWrapper>
    </div>
  );
}
