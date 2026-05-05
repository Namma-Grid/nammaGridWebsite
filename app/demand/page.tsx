'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SectionWrapper from '@/app/components/SectionWrapper';
import DateTimeSelector from '@/app/components/DateTimeSelector';
import { generate24hPrediction, generateDemandSnapshot } from '@/app/data/demand-predictions';
import type { HexCell } from '@/app/lib/types';
import gridData from '@/bangalore-hex-grid.json';

const DemandHeatmap = dynamic(() => import('@/app/components/DemandHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] min-h-[320px] rounded-xl bg-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading Demand Heatmap...</span>
      </div>
    </div>
  ),
});

const DemandChart = dynamic(() => import('@/app/components/DemandChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] rounded-xl bg-slate-100 flex items-center justify-center">
      <span className="text-slate-400 text-sm">Loading chart...</span>
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

  const chartData = useMemo(
    () => generate24hPrediction(selectedDemandZone, selectedDemandArea, selectedDate),
    [selectedDemandZone, selectedDemandArea, selectedDate]
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
        {/* Controls — stacked on mobile */}
        <div className="grid gap-5 lg:grid-cols-[1fr_260px] mb-6">
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
            <div className="max-h-[180px] overflow-y-auto space-y-1 pr-1">
              {uniqueAreas.slice(0, 20).map((area) => (
                <button
                  key={area.name}
                  onClick={() => {
                    setSelectedDemandArea(area.name);
                    setSelectedDemandZone(area.zone);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                    selectedDemandArea === area.name
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium'
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span>{area.name}</span>
                  <span className="text-xs capitalize text-slate-400">{area.zone}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dual viz — stacked on mobile */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass-card-static p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-amber-500">📈</span>
              24-Hour Demand Curve
            </h3>
            <DemandChart
              data={chartData}
              areaName={selectedDemandArea}
              zoneName={selectedDemandZone}
            />
          </div>

          <div className="glass-card-static p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-red-500">🗺️</span>
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
