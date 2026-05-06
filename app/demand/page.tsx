'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SectionWrapper from '@/app/components/SectionWrapper';
import DateTimeSelector from '@/app/components/DateTimeSelector';
import { generateDemandSnapshot } from '@/app/data/demand-predictions';
import AgentInsights from '@/app/components/AgentInsights';
import type { HexCell } from '@/app/lib/types';
import gridData from '@/bangalore-hex-grid.json';

const DemandHeatmap = dynamic(() => import('@/app/components/DemandHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] min-h-[320px] rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Loading Demand Heatmap...</span>
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

export default function DemandPage() {
  const cells = useMemo(() => enrichCells(gridData.grid), []);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedHour, setSelectedHour] = useState(18);
  const [selectedDemandArea, setSelectedDemandArea] = useState<string>('Koramangala');
  const [selectedDemandZone, setSelectedDemandZone] = useState<string>('residential');

  const demandSnapshot = useMemo(
    () => generateDemandSnapshot(cells, selectedHour),
    [cells, selectedHour]
  );

  const uniqueAreas = useMemo(() => {
    const areaMap = new Map<string, string>();
    cells.forEach((c) => {
      if (!areaMap.has(c.nearestArea)) areaMap.set(c.nearestArea, c.zone);
    });
    return Array.from(areaMap.entries()).map(([name, zone]) => ({ name, zone }));
  }, [cells]);

  const handleDemandCellSelect = useCallback((cell: HexCell) => {
    setSelectedDemandArea(cell.nearestArea);
    setSelectedDemandZone(cell.zone);
  }, []);

  return (
    <div className="page-container">
      <SectionWrapper
        id="demand"
        title="Grid Demand Prediction"
        subtitle="AI-driven 24-hour demand forecasting by zone. Select a date, time, and area to see predicted EV charging load and peak hour analysis."
        icon="📊"
        badge="Forecast"
      >
        {/* Controls — stacked on mobile, side-by-side on desktop */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px] mb-6">
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedHour={selectedHour}
            onDateChange={setSelectedDate}
            onHourChange={setSelectedHour}
          />

          {/* Area selector */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-medium">
              Select Area
            </label>
            <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-1 rounded-xl border border-slate-100 bg-white/60 p-1.5">
              {uniqueAreas.slice(0, 20).map((area) => (
                <button
                  key={area.name}
                  onClick={() => {
                    setSelectedDemandArea(area.name);
                    setSelectedDemandZone(area.zone);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between touch-manipulation ${
                    selectedDemandArea === area.name
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{area.name}</span>
                  <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                    selectedDemandArea === area.name
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    {area.zone}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dual visualization — stacked on mobile */}
        <div className="grid gap-5 lg:grid-cols-2">
          <AgentInsights
            area={selectedDemandArea}
            zone={selectedDemandZone}
            dateOffset={selectedDate}
            hour={selectedHour}
          />

          {/* Heatmap */}
          <div className="glass-card-static p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 flex-wrap">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs">🗺️</span>
              City-Wide Demand Heatmap
              <span className="badge badge-amber ml-auto">
                {selectedHour < 12
                  ? `${selectedHour || 12} AM`
                  : `${selectedHour === 12 ? 12 : selectedHour - 12} PM`}
              </span>
            </h3>
            <DemandHeatmap
              cells={cells}
              demandSnapshot={demandSnapshot}
              selectedHour={selectedHour}
              onCellSelect={handleDemandCellSelect}
            />
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
