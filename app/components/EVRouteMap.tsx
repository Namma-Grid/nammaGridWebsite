'use client';

import { useEffect, useRef, useState } from 'react';
import { BANGALORE_CENTER, TILE_URL, TILE_ATTRIBUTION } from '@/app/lib/map-config';
import type { EVRoute, LocationOption } from '@/app/lib/types';

interface EVRouteMapProps {
  route: EVRoute | null;
  loading?: boolean;
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

// ─── Perceptual 3-stop heat ramp: emerald → amber → rose ────────────────────
const HEAT_STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [16, 185, 129]],   // emerald-500
  [0.5, [245, 158, 11]],   // amber-500
  [1.0, [225, 29, 72]],    // rose-600
];

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function heatColor(ratio: number): string {
  const t = Math.max(0, Math.min(1, ratio));
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [t1, c1] = HEAT_STOPS[i];
    if (t <= t1) {
      const [t0, c0] = HEAT_STOPS[i - 1];
      const local = (t - t0) / (t1 - t0);
      return `rgb(${lerp(c0[0], c1[0], local)}, ${lerp(c0[1], c1[1], local)}, ${lerp(c0[2], c1[2], local)})`;
    }
  }
  return `rgb(${HEAT_STOPS[HEAT_STOPS.length - 1][1].join(', ')})`;
}

// ─── SVG marker factory ─────────────────────────────────────────────────────
function svgIcon(L: typeof import('leaflet'), html: string, size: number) {
  return L.divIcon({
    className: 'ev-pin',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const ORIGIN_PIN = `
  <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="11" fill="#10b981" fill-opacity="0.18"/>
    <circle cx="11" cy="11" r="7" fill="#059669" stroke="white" stroke-width="2.5"/>
    <circle cx="11" cy="11" r="2.5" fill="white"/>
  </svg>`;

const DEST_PIN = `
  <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(190, 18, 60, 0.35));">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 22 14 22s14-12.5 14-22C28 6.27 21.73 0 14 0z" fill="#be123c"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`;

const STATION_PIN = `
  <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(5, 150, 105, 0.4));">
    <rect x="1" y="1" width="20" height="20" rx="6" fill="white" stroke="#059669" stroke-width="2"/>
    <path d="M12.2 5L7 12h3.6L9.8 17l5.2-7h-3.6l.8-5z" fill="#059669"/>
  </svg>`;

export default function EVRouteMap({ route, loading = false }: EVRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const initRef = useRef(false);
  const removedRef = useRef(false);
  const [mapVersion, setMapVersion] = useState(0);

  // ── Initialise Leaflet map once ─────────────────────────────────────────
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
        // Bump version on every fresh map so the draw effect re-fires for
        // strict-mode remounts / HMR — otherwise the new map has no route drawn.
        setMapVersion((v) => v + 1);

        // Deferred sizing — safe guard against _leaflet_pos error
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
      layerGroupRef.current = null;
      initRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || mapVersion === 0) return;

    import('leaflet').then((L) => {
      const lg = layerGroupRef.current;
      const map = mapInstanceRef.current;
      if (!lg || !map) return;

      lg.clearLayers();
      if (!route) return;

      // ① Heat-colored polyline with glow underlay (the "current" effect) ──
      const maxEV = Math.max(...route.segments.map((s) => s.evCount), 1);

      // Pass 1: glow underlay — wide, low-opacity, perceptual heat color
      route.segments.forEach((seg) => {
        const ratio = seg.evCount / maxEV;
        const color = heatColor(ratio);
        L.polyline([seg.from, seg.to], {
          color,
          weight: 14,
          opacity: 0.18,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }).addTo(lg);
      });

      // Pass 2: solid line on top
      route.segments.forEach((seg) => {
        const ratio = seg.evCount / maxEV;
        const color = heatColor(ratio);
        const line = L.polyline([seg.from, seg.to], {
          color,
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(lg);
        line.bindTooltip(`${seg.evCount} EVs on segment`, {
          className: 'hex-tooltip',
          sticky: true,
        });
      });

      // ② Charging stations on the route ──────────────────────────────────
      route.stationsOnPath.forEach((station) => {
        L.marker([station.lat, station.lng], { icon: svgIcon(L, STATION_PIN, 22) })
          .addTo(lg)
          .bindTooltip(
            `<strong>${station.name}</strong><br/>${station.operator} · ${station.kw} kW`,
            { className: 'hex-tooltip', direction: 'top', offset: [0, -14] },
          );
      });

      // ③ Origin pin — disc with white inner ring ─────────────────────────
      L.marker([route.origin.lat, route.origin.lng], { icon: svgIcon(L, ORIGIN_PIN, 22) })
        .addTo(lg)
        .bindTooltip(`Start: ${route.origin.name}`, { className: 'hex-tooltip', direction: 'top', offset: [0, -16] });

      // ④ Destination pin — teardrop ──────────────────────────────────────
      L.marker([route.destination.lat, route.destination.lng], {
        icon: L.divIcon({
          className: 'ev-pin',
          html: DEST_PIN,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
        }),
      })
        .addTo(lg)
        .bindTooltip(`End: ${route.destination.name}`, { className: 'hex-tooltip', direction: 'top', offset: [0, -36] });

      map.fitBounds(route.path as [number, number][], {
        padding: [60, 60],
        maxZoom: 15,
      });
    });
  }, [route, mapVersion]);

  const loaded = mapVersion > 0;

  return (
    <div className="map-container relative h-full">
      <div ref={containerRef} className="h-full w-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50/90 to-slate-100/90 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-slate-400 text-sm font-medium">Loading Route Map...</span>
          </div>
        </div>
      )}

      {loading && loaded && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="glass-card-static px-4 py-2 flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-600 text-[11px] font-medium tracking-wide uppercase">
              Routing
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
