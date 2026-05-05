'use client';

import { useEffect, useState, useRef } from 'react';
import { TILE_URL, TILE_ATTRIBUTION, ZONE_COLORS } from '@/app/lib/map-config';
import type { HexCell } from '@/app/lib/types';

interface HexGridMapProps {
  cells: HexCell[];
  onCellClick?: (cell: HexCell) => void;
}

export default function HexGridMap({ cells, onCellClick }: HexGridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const initRef = useRef(false);
  const [selectedCell, setSelectedCell] = useState<HexCell | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    const mapDiv = document.createElement('div');
    mapDiv.style.height = '100%';
    mapDiv.style.width = '100%';
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(mapDiv);

    const rafId = requestAnimationFrame(() => {
      import('leaflet').then((L) => {
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
            <div style="min-width: 160px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #0f172a;">
                ${cell.nearestArea}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: ${baseColor}; display: inline-block;"></span>
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

        map.whenReady(() => {
          map.invalidateSize();
          setTimeout(() => map.invalidateSize(), 300);
        });
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
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
      <div className="map-container">
        <div ref={containerRef} className="h-[50vh] min-h-[320px] max-h-[520px] w-full" />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-sm">Loading map...</span>
            </div>
          </div>
        )}
      </div>

      {selectedCell && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 glass-card p-4 animate-slide-up z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800">{selectedCell.nearestArea}</h4>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Zone Type</span>
              <span className="capitalize text-slate-800 font-medium">{selectedCell.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Demand</span>
              <span className={selectedCell.demanded ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                {selectedCell.demanded ? 'Active' : 'Normal'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Demand Level</span>
              <span className="text-slate-800 font-mono">{selectedCell.demandLevel}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">EVs in Area</span>
              <span className="text-slate-800 font-mono">{selectedCell.evCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">H3 Index</span>
              <span className="text-slate-400 font-mono text-xs">{selectedCell.h3Index.slice(0, 12)}…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
