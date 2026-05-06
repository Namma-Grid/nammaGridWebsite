'use client';

import { useEffect, useRef, useState } from 'react';
import { BANGALORE_CENTER, TILE_URL, TILE_ATTRIBUTION } from '@/app/lib/map-config';
import type { EVRoute, LocationOption } from '@/app/lib/types';
import { LOCATIONS } from '@/app/data/ev-routes';

interface EVRouteMapProps {
  route: EVRoute | null;
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

export default function EVRouteMap({ route }: EVRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const initRef = useRef(false);
  const removedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

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
        setLoaded(true);

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
      initRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !loaded) return;

    import('leaflet').then((L) => {
      const lg = layerGroupRef.current;
      const map = mapInstanceRef.current;
      if (!lg || !map) return;

      lg.clearLayers();
      if (!route) return;

      // ① Colour-coded segments (green → red by EV density) ───────────────
      const maxEV = Math.max(...route.segments.map((s) => s.evCount));

      // Route segments with EV-density color gradient
      route.segments.forEach((seg) => {
        const ratio = maxEV > 0 ? seg.evCount / maxEV : 0;
        const r = Math.round(ratio > 0.5 ? 255 : ratio * 2 * 255);
        const g = Math.round(ratio > 0.5 ? (1 - ratio) * 2 * 255 : 255);
        const color = `rgb(${r}, ${g}, 60)`;

        const line = L.polyline([seg.from, seg.to], {
          color,
          weight: 6,
          opacity: 0.88,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(lg);

        line.bindTooltip(`${seg.evCount} EVs on segment`, {
          className: 'hex-tooltip',
          sticky: true,
        });
      });

      L.polyline(route.path, {
        color: '#2563EB',
        weight: 2,
        opacity: 0.4,
        dashArray: '8, 12',
      }).addTo(lg);

      // ③ Intermediate waypoint markers (Dijkstra graph hops) ─────────────
      // hexesOnPath holds the location IDs along the shortest path
      const viaIds: string[] = (route.hexesOnPath ?? []).slice(1, -1);
      viaIds.forEach((locId) => {
        const loc = LOCATIONS.find((l) => l.id === locId);
        if (!loc) return;

        const waypointIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 22px; height: 22px; border-radius: 50%;
              background: linear-gradient(135deg, #6366F1, #4F46E5);
              border: 2.5px solid #fff;
              box-shadow: 0 2px 8px rgba(99,102,241,0.45);
              display: flex; align-items: center; justify-content: center;
            ">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #fff;"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([loc.lat, loc.lng], { icon: waypointIcon })
          .addTo(lg)
          .bindTooltip(`Via: ${loc.name}`, {
            className: 'hex-tooltip',
            direction: 'top',
            offset: [0, -14],
          });
      });

      // ④ Origin marker ────────────────────────────────────────────────────
      const originIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px; border-radius: 50%;
            background: linear-gradient(135deg, #059669, #047857);
            border: 3px solid #fff; display: flex; align-items: center;
            justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(5,150,105,0.35);
          ">🟢</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([route.origin.lat, route.origin.lng], { icon: originIcon })
        .addTo(lg)
        .bindTooltip(`Start: ${route.origin.name}`, { className: 'hex-tooltip', direction: 'top', offset: [0, -20] });

      // ⑤ Destination marker ───────────────────────────────────────────────
      const destIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px; border-radius: 50%;
            background: linear-gradient(135deg, #DC2626, #B91C1C);
            border: 3px solid #fff; display: flex; align-items: center;
            justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(220,38,38,0.35);
          ">📍</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([route.destination.lat, route.destination.lng], { icon: destIcon })
        .addTo(lg)
        .bindTooltip(`End: ${route.destination.name}`, { className: 'hex-tooltip', direction: 'top', offset: [0, -20] });

      // EV count labels
      route.segments.forEach((seg, i) => {
        if (i % 3 !== 1) return;
        const midLat = (seg.from[0] + seg.to[0]) / 2;
        const midLng = (seg.from[1] + seg.to[1]) / 2;

        const evIcon = L.divIcon({
          className: '',
          html: `<div style="background:rgba(255,255,255,0.96);border:1px solid rgba(0,0,0,0.06);border-radius:8px;padding:3px 8px;font-size:11px;font-weight:700;color:#D97706;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.1);">⚡${seg.evCount}</div>`,
          iconSize: [50, 24],
          iconAnchor: [25, 12],
        });

        L.marker([midLat, midLng], { icon: evIcon }).addTo(lg);
      });

      map.fitBounds(route.path.map((p) => [p[0], p[1]]) as [number, number][], {
        padding: [50, 50],
      });
    });
  }, [route, loaded]);

  return (
    <div className="map-container relative">
      <div ref={containerRef} className="h-[50vh] min-h-[320px] max-h-[450px] w-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50/90 to-slate-100/90 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-slate-400 text-sm font-medium">Loading Route Map...</span>
          </div>
        </div>
      )}
      {!route && loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass-card-static px-6 py-4 text-center">
            <p className="text-slate-400 text-sm">Select origin & destination to view route</p>
          </div>
        </div>
      )}
    </div>
  );
}
