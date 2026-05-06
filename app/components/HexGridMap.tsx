'use client';

import { useEffect, useState, useRef } from 'react';
import { TILE_URL, TILE_ATTRIBUTION, ZONE_COLORS } from '@/app/lib/map-config';
import type { HexCell } from '@/app/lib/types';

interface HexGridMapProps {
  cells: HexCell[];
  onCellClick?: (cell: HexCell) => void;
}

/** Safely call invalidateSize — guards against the _leaflet_pos race condition */
function safeInvalidate(map: L.Map | null) {
  if (!map) return;
  try {
    const container = map.getContainer();
    if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
      map.invalidateSize({ animate: false });
    }
  } catch {
    // Map pane not ready yet — ignore
  }
}

export default function HexGridMap({ cells, onCellClick }: HexGridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const initRef = useRef(false);
  const removedRef = useRef(false);
  const [selectedCell, setSelectedCell] = useState<HexCell | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;
    removedRef.current = false;

    const mapDiv = document.createElement('div');
    mapDiv.style.height = '100%';
    mapDiv.style.width = '100%';
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(mapDiv);

    const rafId = requestAnimationFrame(() => {
      if (removedRef.current) return;

      import('leaflet').then((L) => {
        if (removedRef.current) return;

        const gridCenter: [number, number] = [12.970879, 77.594687];

        const map = L.map(mapDiv, {
          center: gridCenter,
          zoom: 11,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
          maxZoom: 18,
        }).addTo(map);

        // Render hex polygons
        cells.forEach((cell) => {
          const positions = cell.boundary.map((p) => [p.lat, p.lng] as [number, number]);
          const baseColor = ZONE_COLORS[cell.zone] || '#2563EB';
          const fillOpacity = cell.demanded ? 0.5 : 0.25;

          const polygon = L.polygon(positions, {
            color: cell.demanded ? '#D97706' : baseColor,
            weight: cell.demanded ? 2 : 1,
            fillColor: baseColor,
            fillOpacity,
            opacity: 0.8,
          }).addTo(map);

          const demandStr = cell.demanded ? '🔴 Yes' : '🟢 No';
          const tooltipContent = `
            <div style="min-width: 170px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #0f172a;">
                ${cell.nearestArea}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="width: 10px; height: 10px; border-radius: 3px; background: ${baseColor}; display: inline-block;"></span>
                <span style="color: #64748b; font-size: 12px; text-transform: capitalize;">${cell.zone}</span>
              </div>
              <div style="color: #64748b; font-size: 12px; margin-bottom: 2px;">
                Demand: ${demandStr}
              </div>
              <div style="color: #64748b; font-size: 12px; margin-bottom: 2px;">
                Demand Level: <span style="color: ${cell.demandLevel > 60 ? '#DC2626' : cell.demandLevel > 30 ? '#D97706' : '#059669'}; font-weight: 600;">${cell.demandLevel}%</span>
              </div>
              <div style="color: #64748b; font-size: 12px;">
                EVs in area: <span style="font-weight: 600; color: #0f172a;">${cell.evCount}</span>
              </div>
            </div>
          `;

          polygon.bindTooltip(tooltipContent, {
            className: 'hex-tooltip',
            sticky: true,
            direction: 'top',
            offset: [0, -10],
          });

          polygon.on('click', () => {
            setSelectedCell(cell);
            if (onCellClick) onCellClick(cell);
          });

          polygon.on('mouseover', () => {
            polygon.setStyle({ fillOpacity: fillOpacity + 0.2, weight: 2 });
          });

          polygon.on('mouseout', () => {
            polygon.setStyle({ fillOpacity, weight: cell.demanded ? 2 : 1 });
          });
        });

        mapInstanceRef.current = map;
        setLoaded(true);

        // Safe deferred sizing
        setTimeout(() => { if (!removedRef.current) safeInvalidate(map); }, 50);
        setTimeout(() => { if (!removedRef.current) safeInvalidate(map); }, 300);
        setTimeout(() => { if (!removedRef.current) safeInvalidate(map); }, 800);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      removedRef.current = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {/* Map */}
      <div className="map-container">
        <div ref={containerRef} className="h-[50vh] min-h-[320px] max-h-[540px] w-full" />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50/90 to-slate-100/90 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-slate-400 text-sm font-medium">Loading Hex Grid...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected cell info panel */}
      {selectedCell && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-5 animate-slide-up z-[1000] shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-800 text-base">{selectedCell.nearestArea}</h4>
            <button
              onClick={() => setSelectedCell(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Zone Type</span>
              <span className="capitalize text-slate-800 font-medium bg-slate-50 px-2.5 py-0.5 rounded-full text-xs">{selectedCell.zone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Demand</span>
              <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${selectedCell.demanded ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {selectedCell.demanded ? '● Active' : '● Normal'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Demand Level</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedCell.demandLevel}%`,
                      background: selectedCell.demandLevel > 60 ? '#DC2626' : selectedCell.demandLevel > 30 ? '#D97706' : '#059669'
                    }}
                  />
                </div>
                <span className="text-slate-800 font-mono text-xs font-bold">{selectedCell.demandLevel}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">EVs in Area</span>
              <span className="text-slate-800 font-mono font-bold">{selectedCell.evCount}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-50">
              <span className="text-slate-400 text-xs">H3 Index</span>
              <span className="text-slate-400 font-mono text-[10px]">{selectedCell.h3Index.slice(0, 15)}…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
