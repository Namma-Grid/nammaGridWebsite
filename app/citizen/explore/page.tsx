'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ChargingStation, PriorityZone } from '@/app/data/explore-stations';

const CityScene = dynamic(() => import('@/app/components/CityScene'), {
  ssr: false,
  loading: () => (
    <div className="explore-loader">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-xl animate-pulse">🏙️</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-[3px] border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-medium">Building the city...</span>
        </div>
      </div>
    </div>
  ),
});

interface PosTuple { id: string; wx: number; wz: number }

export default function CitizenExplorePage() {
  const [nearestStation, setNearestStation] = useState<ChargingStation | null>(null);
  const [stationDistance, setStationDistance] = useState(9999);
  const [nearestPriority, setNearestPriority] = useState<PriorityZone | null>(null);
  const [hour, setHour] = useState(9);
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(78);
  const [isCharging, setIsCharging] = useState(false);
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowTip(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const handleTick = useCallback((d: {
    x: number; z: number; angle: number; speed: number; hour: number;
    battery: number; isCharging: boolean; chargingStationId: string | null;
  }) => {
    setSpeed(d.speed);
    setHour((prev) => (prev === d.hour ? prev : d.hour));
    setBattery(d.battery);
    setIsCharging(d.isCharging);
  }, []);

  const handleNearestStation = useCallback((station: ChargingStation | null, dist: number) => {
    setNearestStation(station);
    setStationDistance(dist);
  }, []);

  const handleNearestPriority = useCallback((zone: PriorityZone | null, _dist: number) => {
    setNearestPriority(zone);
  }, []);

  const isOffPeak = hour >= 23 || hour <= 5;
  const isPeak = hour >= 18 && hour <= 21;
  const bestTime = isOffPeak ? 'Now is a great time to charge! 💚' : isPeak ? 'Peak hours — consider waiting until 10 PM' : 'Moderate demand — good to charge soon';

  return (
    <div className="explore-page">
      <CityScene
        onTick={handleTick}
        onNearestStation={handleNearestStation}
        onNearestPriority={handleNearestPriority}
        onStationsReady={() => {}}
        onPriorityReady={() => {}}
      />

      {/* Friendly HUD overlay — no technical coordinates */}
      <div className="hud-overlay">
        {/* Top: location hint */}
        <div className="hud-title">
          <span className="text-xs font-semibold text-slate-700">
            📍 Exploring Bengaluru EV Network
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOffPeak ? 'bg-emerald-100 text-emerald-700' : isPeak ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {hour < 12 ? `${hour || 12} AM` : `${hour === 12 ? 12 : hour - 12} PM`}
            </span>
          </span>
        </div>

        {/* Speed */}
        <div className="hud-speed">
          <div className="hud-speed-value">{speed.toFixed(0)}</div>
          <div className="hud-speed-unit">km/h</div>
          <div className="hud-speed-bar">
            <div className="hud-speed-fill" style={{ width: `${Math.min(100, speed / 1.2)}%` }} />
          </div>
        </div>

        {/* Battery */}
        <div
          className="absolute left-4 bottom-4 z-20 px-3 py-2.5 rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200/70 shadow-lg w-[180px]"
          style={{ boxShadow: '0 8px 24px -8px rgba(15,23,42,0.18)' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.14em]">
              Battery
            </span>
            {isCharging ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Charging
              </span>
            ) : battery < 15 ? (
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Low</span>
            ) : null}
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className={`font-mono text-xl font-medium tabular-nums tracking-tight ${
              battery < 15 ? 'text-rose-600' : battery < 35 ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {Math.round(battery)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${battery}%`,
                background:
                  battery < 15
                    ? '#e11d48'
                    : battery < 35
                    ? '#f59e0b'
                    : isCharging
                    ? '#10b981'
                    : '#059669',
              }}
            />
          </div>
        </div>

        {/* Nearest charger — friendly version */}
        {nearestStation && (
          <div className="hud-station-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-500 text-lg">⚡</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Nearest Charger</p>
                <p className="text-[11px] text-slate-500">{stationDistance < 1000 ? `${Math.round(stationDistance)} m away` : `${(stationDistance / 1000).toFixed(1)} km away`}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">{nearestStation.name}</p>
            <p className="text-xs text-slate-500">{nearestStation.capacity} bays · {nearestStation.type} charger · ₹{nearestStation.pricePerKwh}/kWh</p>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              {bestTime}
            </div>
          </div>
        )}

        {/* Priority zone */}
        {nearestPriority && (
          <div className="hud-priority-alert" style={{ fontSize: '0.75rem' }}>
            <span className="font-semibold text-slate-700">📍 {nearestPriority.name}</span>
            <span className="text-slate-500 ml-2">Priority charging zone</span>
          </div>
        )}

        {/* Controls tooltip on first load */}
        {showTip && (
          <div className="hud-clock" style={{ top: 110 }}>
            <span className="text-xs text-slate-600">🕹️ Use <strong>WASD</strong> or arrow keys to drive · Blue markers = charging stations</span>
          </div>
        )}
      </div>
    </div>
  );
}
