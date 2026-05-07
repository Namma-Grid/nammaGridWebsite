'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CHARGING_STATIONS,
  PRIORITY_ZONES,
  recommendCharging,
  isPeakHour,
  isOffPeak,
  type ChargingStation,
  type PriorityZone,
} from '@/app/data/explore-stations';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CityHUDProps {
  nearestStation: ChargingStation | null;
  stationDistance: number;
  nearestPriority: PriorityZone | null;
  priorityDistance: number;
  hour: number;
  speed: number;
  vehicleX: number;
  vehicleZ: number;
  vehicleAngle: number;
  stationPositions: { id: string; wx: number; wz: number }[];
  priorityPositions: { id: string; wx: number; wz: number }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDist(d: number): string {
  if (d < 1000) return `${Math.round(d)} m`;
  return `${(d / 1000).toFixed(1)} km`;
}

function formatHour(h: number): string {
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hr12}:00 ${ampm}`;
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '● Available' },
    busy:      { bg: 'bg-amber-100',   text: 'text-amber-700',   label: '● Busy' },
    offline:   { bg: 'bg-red-100',     text: 'text-red-700',     label: '● Offline' },
  };
  const s = map[status] ?? map.available;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function typeLabel(type: string) {
  const colors: Record<string, string> = {
    'ultra-rapid': 'text-purple-600 bg-purple-50 border-purple-200',
    'fast':        'text-blue-600 bg-blue-50 border-blue-200',
    'standard':    'text-slate-600 bg-slate-50 border-slate-200',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colors[type] ?? colors.standard}`}>
      {type.replace('-', ' ')}
    </span>
  );
}

// Snap helper — limits useMemo invalidation to coarse position changes
function snap(v: number, step: number) { return Math.round(v / step) * step; }

// ═══════════════════════════════════════════════════════════════════════════

export default function CityHUD({
  nearestStation,
  stationDistance,
  nearestPriority,
  priorityDistance,
  hour,
  speed,
  vehicleX,
  vehicleZ,
  vehicleAngle,
  stationPositions,
  priorityPositions,
}: CityHUDProps) {
  const [showList, setShowList] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowControls(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const displaySpeed = Math.round(speed);
  const showStationCard = !!nearestStation && stationDistance < 90;
  const showPriorityAlert = !!nearestPriority && priorityDistance < 110;

  const recommendation = useMemo(() => {
    if (!nearestStation) return null;
    return recommendCharging(nearestStation, hour);
  }, [nearestStation, hour]);

  // Stations sorted by distance — only recompute when vehicle moves > ~25 units
  const sx = snap(vehicleX, 25);
  const sz = snap(vehicleZ, 25);
  const stationsWithDist = useMemo(() => {
    return CHARGING_STATIONS.map((s) => {
      const sp = stationPositions.find((p) => p.id === s.id);
      const dx = sp ? sx - sp.wx : 9999;
      const dz = sp ? sz - sp.wz : 9999;
      return { ...s, dist: Math.sqrt(dx * dx + dz * dz) };
    }).sort((a, b) => a.dist - b.dist);
  }, [sx, sz, stationPositions]);

  const peakNow = nearestStation ? isPeakHour(nearestStation, hour) : false;
  const offPeak = isOffPeak(hour);

  // ── Aggregate grid stats ────────────────────────────────────────────────
  const gridStats = useMemo(() => {
    const total = CHARGING_STATIONS.length;
    let available = 0, busy = 0, offline = 0;
    let totalLoad = 0, totalHeadroom = 0;
    CHARGING_STATIONS.forEach((s) => {
      if (s.status === 'available') available++;
      else if (s.status === 'busy') busy++;
      else offline++;
      totalLoad += s.currentLoad;
      totalHeadroom += s.gridHeadroom;
    });
    return {
      total, available, busy, offline,
      avgLoad: Math.round(totalLoad / total),
      headroom: totalHeadroom,
    };
  }, []);

  return (
    <div className="hud-overlay">
      {/* ── Top-center title + clock ─────────────────────────────────────── */}
      <div className="hud-title">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">⚡</div>
          <span className="text-sm font-bold text-slate-800">NammaGrid</span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">3D Explorer</span>
        </div>
      </div>

      <div className="hud-clock">
        <div className="hud-clock-time">{formatHour(hour)}</div>
        <div className={`hud-clock-tag ${offPeak ? 'tag-offpeak' : peakNow ? 'tag-peak' : 'tag-normal'}`}>
          {offPeak ? 'Off-Peak' : peakNow ? 'Peak Hour' : 'Mid-Load'}
        </div>
      </div>

      {/* ── Speedometer ──────────────────────────────────────────────────── */}
      <div className="hud-speed">
        <div className="hud-speed-value">{displaySpeed}</div>
        <div className="hud-speed-unit">km/h</div>
        <div className="hud-speed-bar">
          <div className="hud-speed-fill" style={{ width: `${Math.min(100, (speed / 84) * 100)}%` }} />
        </div>
      </div>

      {/* ── Controls hint ────────────────────────────────────────────────── */}
      {showControls && (
        <div className="hud-controls animate-fade-in">
          <div className="hud-controls-title">🎮 Controls</div>
          <div className="hud-controls-grid">
            <div className="hud-key">W / ↑</div><span className="text-slate-400">Accelerate</span>
            <div className="hud-key">S / ↓</div><span className="text-slate-400">Brake</span>
            <div className="hud-key">A / ←</div><span className="text-slate-400">Turn Left</span>
            <div className="hud-key">D / →</div><span className="text-slate-400">Turn Right</span>
            <div className="hud-key">Space</div><span className="text-slate-400">Handbrake</span>
          </div>
          <button
            onClick={() => setShowControls(false)}
            className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Grid stats (top-left under controls hides) ───────────────────── */}
      <div className="hud-stats">
        <div className="hud-stats-title">Grid Snapshot</div>
        <div className="hud-stats-row">
          <span className="hud-stats-label">Stations</span>
          <span className="hud-stats-val">
            <span className="text-emerald-600 font-bold">{gridStats.available}</span>
            <span className="text-slate-300 mx-0.5">/</span>
            <span className="text-amber-600 font-bold">{gridStats.busy}</span>
            <span className="text-slate-300 mx-0.5">/</span>
            <span className="text-red-600 font-bold">{gridStats.offline}</span>
          </span>
        </div>
        <div className="hud-stats-row">
          <span className="hud-stats-label">Avg Load</span>
          <span className="hud-stats-val font-bold text-blue-600">{gridStats.avgLoad}%</span>
        </div>
        <div className="hud-stats-row">
          <span className="hud-stats-label">Headroom</span>
          <span className="hud-stats-val font-bold text-slate-700">{(gridStats.headroom / 1000).toFixed(1)} MW</span>
        </div>
        <div className="hud-stats-row">
          <span className="hud-stats-label">Priority Sites</span>
          <span className="hud-stats-val font-bold text-pink-600">{PRIORITY_ZONES.length}</span>
        </div>
      </div>

      {/* ── Priority Zone Alert (top, slides in when nearby) ─────────────── */}
      {showPriorityAlert && nearestPriority && (
        <div className="hud-priority-alert animate-slide-down">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🏗️</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
              Recommended Site · Part B
            </span>
          </div>
          <div className="text-sm font-bold text-slate-800 mb-1">{nearestPriority.name}</div>
          <div className="text-[11px] text-slate-500 leading-snug mb-2">{nearestPriority.reason}</div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="hud-pz-stat">
              <div className="hud-pz-label">Demand</div>
              <div className="hud-pz-val text-pink-600">{nearestPriority.demandIntensity}</div>
            </div>
            <div className="hud-pz-stat">
              <div className="hud-pz-label">Growth</div>
              <div className="hud-pz-val text-emerald-600">+{nearestPriority.growthRate}%</div>
            </div>
            <div className="hud-pz-stat">
              <div className="hud-pz-label">Headroom</div>
              <div className="hud-pz-val text-blue-600">{nearestPriority.feederHeadroom}kW</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-pink-700 font-bold">
            Recommended type: {nearestPriority.recommendedType.replace('-', ' ').toUpperCase()}
          </div>
        </div>
      )}

      {/* ── Nearest Station Card ─────────────────────────────────────────── */}
      {showStationCard && nearestStation && (
        <div className="hud-station-card animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-sm font-bold text-slate-800">{nearestStation.name}</div>
                <div className="text-[10px] text-slate-400">{nearestStation.area} · {formatDist(stationDistance)}</div>
              </div>
            </div>
            {statusBadge(nearestStation.status)}
          </div>

          <div className="flex items-center gap-2 mb-3">
            {typeLabel(nearestStation.type)}
            <span className="text-[11px] text-slate-500">
              ₹{nearestStation.pricePerKwh}/kWh
              <span className="text-emerald-600 ml-1">· off-peak ₹{nearestStation.offPeakPrice}</span>
            </span>
          </div>

          {/* Capacity bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-500">Chargers</span>
              <span className="font-bold text-slate-700">
                {nearestStation.occupied}/{nearestStation.capacity} occupied
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(nearestStation.occupied / nearestStation.capacity) * 100}%`,
                  background: nearestStation.occupied >= nearestStation.capacity
                    ? '#ef4444'
                    : nearestStation.occupied > nearestStation.capacity * 0.7
                      ? '#f59e0b'
                      : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Grid load bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-500">Grid Load</span>
              <span className="font-bold text-slate-700">{nearestStation.currentLoad}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${nearestStation.currentLoad}%`,
                  background: nearestStation.currentLoad > 80
                    ? '#ef4444'
                    : nearestStation.currentLoad > 50
                      ? '#f59e0b'
                      : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Grid info row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-slate-400">Headroom</div>
              <div className="text-sm font-bold text-blue-600">{nearestStation.gridHeadroom} kW</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-slate-400">Peak Hours</div>
              <div className="text-[11px] font-bold text-amber-600">{nearestStation.peakHours}</div>
            </div>
          </div>

          {/* Recommendation banner — Part A scheduling guidance */}
          {recommendation && (
            <div className={`hud-reco hud-reco-${recommendation.action}`}>
              <div className="flex items-start gap-1.5">
                <span className="text-sm">
                  {recommendation.action === 'shift_to_offpeak' ? '🌙'
                    : recommendation.action === 'charge_now' ? '✅'
                    : recommendation.action === 'try_alternate' ? '⚠️'
                    : '⚡'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="hud-reco-title">
                    {recommendation.action === 'shift_to_offpeak' ? 'Load-Shift Recommended'
                      : recommendation.action === 'charge_now' ? 'Optimal Window'
                      : recommendation.action === 'try_alternate' ? 'Try Alternate'
                      : 'Charge Available'}
                  </div>
                  <div className="hud-reco-msg">{recommendation.message}</div>
                  {recommendation.savingsRupees ? (
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      <span className="text-emerald-700 font-bold">Save ₹{recommendation.savingsRupees}</span>
                      {recommendation.gridLoadDelta !== undefined && (
                        <span className="text-blue-700 font-bold">
                          Grid {recommendation.gridLoadDelta}%
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Explainability */}
          <div className="flex items-start gap-1.5 p-2 bg-indigo-50 rounded-lg border border-indigo-100 mt-2">
            <span className="text-xs">💡</span>
            <div>
              <div className="text-[10px] font-bold text-indigo-600 mb-0.5">Why This Location?</div>
              <div className="text-[10px] text-indigo-500 leading-relaxed">{nearestStation.whyHere}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-slate-400">Rating</span>
            <span className="text-xs text-amber-500">{'★'.repeat(Math.floor(nearestStation.rating))}</span>
            <span className="text-[10px] font-bold text-slate-600">{nearestStation.rating}</span>
          </div>
        </div>
      )}

      {/* ── Direction indicator when station is far ─────────────────────── */}
      {nearestStation && !showStationCard && (
        <div className="hud-direction">
          <span className="text-sm">⚡</span>
          <span className="text-xs text-slate-600 font-medium">
            Nearest: {nearestStation.name}
          </span>
          <span className="text-xs font-bold text-blue-600">{formatDist(stationDistance)}</span>
        </div>
      )}

      {/* ── Minimap ──────────────────────────────────────────────────────── */}
      <div className="hud-minimap">
        <svg viewBox="-450 -450 900 900" className="w-full h-full">
          <rect x="-400" y="-400" width="800" height="800" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" rx="6" />

          {/* Heatmap blobs */}
          {stationPositions.map((sp) => {
            const s = CHARGING_STATIONS.find((c) => c.id === sp.id);
            if (!s) return null;
            const fill = s.demandZone === 'residential'
              ? 'rgba(110,164,255,0.20)'
              : s.demandZone === 'workplace'
                ? 'rgba(251,191,36,0.20)'
                : 'rgba(52,211,153,0.20)';
            const r = 30 + (s.demandIntensity / 100) * 25;
            return <circle key={`h-${sp.id}`} cx={sp.wx} cy={sp.wz} r={r} fill={fill} />;
          })}

          {/* Priority zones (Part B) */}
          {priorityPositions.map((pp) => (
            <g key={pp.id}>
              <circle cx={pp.wx} cy={pp.wz} r={32} fill="rgba(244,114,182,0.15)" />
              <polygon
                points={`${pp.wx},${pp.wz - 14} ${pp.wx - 8},${pp.wz + 8} ${pp.wx + 8},${pp.wz + 8}`}
                fill="#f472b6" stroke="#fff" strokeWidth="1.5"
              />
            </g>
          ))}

          {/* Stations */}
          {stationPositions.map((sp) => {
            const st = CHARGING_STATIONS.find((s) => s.id === sp.id);
            const color = !st ? '#22c55e'
              : st.status === 'offline' ? '#ef4444'
              : st.status === 'busy' ? '#f59e0b' : '#22c55e';
            return (
              <circle
                key={sp.id}
                cx={sp.wx} cy={sp.wz} r={9}
                fill={color} opacity={0.9}
                stroke="#fff" strokeWidth="1.5"
              />
            );
          })}

          {/* Vehicle */}
          <g transform={`translate(${vehicleX}, ${vehicleZ}) rotate(${(-vehicleAngle * 180) / Math.PI})`}>
            <polygon points="0,-12 -7,8 7,8" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
          </g>

          {/* Range circle */}
          <circle
            cx={vehicleX} cy={vehicleZ} r={80}
            fill="none" stroke="#2563eb" strokeWidth="1.5"
            strokeDasharray="6,4" opacity="0.4"
          />
        </svg>

        <div className="hud-minimap-legend">
          <span className="legend-dot bg-emerald-500" /> Avail
          <span className="legend-dot bg-amber-500" /> Busy
          <span className="legend-dot bg-pink-500" /> Priority
        </div>
      </div>

      {/* ── Station list toggle ──────────────────────────────────────────── */}
      <button onClick={() => setShowList(!showList)} className="hud-list-toggle">
        {showList ? '✕ Close' : '📋 Stations'}
      </button>

      {showList && (
        <div className="hud-station-list">
          <div className="text-sm font-bold text-slate-800 mb-3 px-1">All Charging Stations</div>
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
            {stationsWithDist.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  s.id === nearestStation?.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background: s.status === 'available' ? '#22c55e'
                        : s.status === 'busy' ? '#f59e0b' : '#ef4444',
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.type} · {s.occupied}/{s.capacity}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-blue-600 shrink-0 ml-2">
                  {formatDist(s.dist)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
