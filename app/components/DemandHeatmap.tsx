'use client';

import { useEffect, useRef, useState } from 'react';
import { BANGALORE_CENTER, TILE_URL, TILE_ATTRIBUTION } from '@/app/lib/map-config';
import type { HexCell } from '@/app/lib/types';

interface DemandHeatmapProps {
  cells: HexCell[];
  demandSnapshot: Map<string, number>;
  selectedHour: number;
  onCellSelect?: (cell: HexCell) => void;
}

function getDemandColor(demand: number): string {
  if (demand < 20) return '#1E40AF';
  if (demand < 40) return '#3B82F6';
  if (demand < 55) return '#10B981';
  if (demand < 70) return '#F59E0B';
  if (demand < 85) return '#F97316';
  return '#EF4444';
}

function getDemandOpacity(demand: number): number {
  return 0.2 + (demand / 100) * 0.5;
}

export default function DemandHeatmap({
  cells,
  demandSnapshot,
  selectedHour,
  onCellSelect,
}: DemandHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const initRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    const mapDiv = document.createElement('div');
    mapDiv.style.height = '100%';
    mapDiv.style.width = '100%';
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(mapDiv);

    import('leaflet').then((L) => {
      const map = L.map(mapDiv, {
        center: BANGALORE_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setLoaded(true);

      const fitToData = () => {
        map.invalidateSize();
        if (cells.length > 0) {
          const allLats = cells.flatMap((c) => c.boundary.map((p) => p.lat));
          const allLngs = cells.flatMap((c) => c.boundary.map((p) => p.lng));
          map.fitBounds(
            [
              [Math.min(...allLats), Math.min(...allLngs)],
              [Math.max(...allLats), Math.max(...allLngs)],
            ],
            { padding: [20, 20] }
          );
        }
      };

      map.whenReady(() => {
        fitToData();
        setTimeout(fitToData, 100);
        setTimeout(fitToData, 500);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !loaded) return;

    import('leaflet').then((L) => {
      const lg = layerGroupRef.current;
      if (!lg) return;

      lg.clearLayers();

      cells.forEach((cell) => {
        const demand = demandSnapshot.get(cell.h3Index) ?? cell.demandLevel;
        const positions = cell.boundary.map((p) => [p.lat, p.lng] as [number, number]);
        const color = getDemandColor(demand);
        const opacity = getDemandOpacity(demand);

        const polygon = L.polygon(positions, {
          color: demand > 70 ? '#DC2626' : 'rgba(0,0,0,0.08)',
          weight: demand > 70 ? 2 : 0.5,
          fillColor: color,
          fillOpacity: opacity,
          opacity: 0.8,
        }).addTo(lg);

        const formatHour = (h: number) => {
          if (h === 0) return '12 AM';
          if (h === 12) return '12 PM';
          return h < 12 ? `${h} AM` : `${h - 12} PM`;
        };

        polygon.bindTooltip(
          `<div style="min-width: 140px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #0f172a;">${cell.nearestArea}</div>
            <div style="color: #64748b; font-size: 12px;">
              Predicted at <span style="color: #0f172a;">${formatHour(selectedHour)}</span>
            </div>
            <div style="color: ${color}; font-weight: 700; font-size: 16px; margin-top: 4px;">
              ${demand.toFixed(1)} kW
            </div>
            <div style="color: #94a3b8; font-size: 11px; text-transform: capitalize; margin-top: 2px;">
              ${cell.zone} zone
            </div>
          </div>`,
          { className: 'hex-tooltip', sticky: true }
        );

        polygon.on('click', () => {
          if (onCellSelect) onCellSelect(cell);
        });
      });
    });
  }, [cells, demandSnapshot, selectedHour, loaded, onCellSelect]);

  return (
    <div className="relative">
      <div className="map-container">
        <div ref={containerRef} className="h-[50vh] min-h-[280px] max-h-[450px] w-full" />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-sm">Loading heatmap...</span>
            </div>
          </div>
        )}
      </div>

      {/* Color scale legend */}
      <div className="flex items-center gap-3 mt-3 justify-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Low</span>
        <div className="flex h-3 rounded-full overflow-hidden w-48">
          <div className="flex-1" style={{ background: '#1E40AF' }} />
          <div className="flex-1" style={{ background: '#3B82F6' }} />
          <div className="flex-1" style={{ background: '#10B981' }} />
          <div className="flex-1" style={{ background: '#F59E0B' }} />
          <div className="flex-1" style={{ background: '#F97316' }} />
          <div className="flex-1" style={{ background: '#EF4444' }} />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">High</span>
      </div>
    </div>
  );
}
