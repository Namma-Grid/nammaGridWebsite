'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type {
  ChargingStation,
  PriorityZone,
} from '@/app/data/explore-stations';

const CityScene = dynamic(() => import('@/app/components/CityScene'), {
  ssr: false,
  loading: () => (
    <div className="explore-loader">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-3xl shadow-xl animate-pulse">
          🏙️
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-medium">Building the city...</span>
          <span className="text-slate-400 text-xs">Generating 3D environment</span>
        </div>
      </div>
    </div>
  ),
});

const CityHUD = dynamic(() => import('@/app/components/CityHUD'), { ssr: false });

interface PosTuple { id: string; wx: number; wz: number }

export default function ExplorePage() {
  const [nearestStation, setNearestStation] = useState<ChargingStation | null>(null);
  const [stationDistance, setStationDistance] = useState(9999);
  const [nearestPriority, setNearestPriority] = useState<PriorityZone | null>(null);
  const [priorityDistance, setPriorityDistance] = useState(9999);
  const [hour, setHour] = useState(9);
  const [speed, setSpeed] = useState(0);
  const [vehicleX, setVehicleX] = useState(0);
  const [vehicleZ, setVehicleZ] = useState(0);
  const [vehicleAngle, setVehicleAngle] = useState(0);
  const [stationPositions, setStationPositions] = useState<PosTuple[]>([]);
  const [priorityPositions, setPriorityPositions] = useState<PosTuple[]>([]);

  const handleTick = useCallback((d: {
    x: number; z: number; angle: number; speed: number; hour: number;
  }) => {
    setVehicleX(d.x);
    setVehicleZ(d.z);
    setVehicleAngle(d.angle);
    setSpeed(d.speed);
    setHour((prev) => (prev === d.hour ? prev : d.hour));
  }, []);

  const handleNearestStation = useCallback((station: ChargingStation | null, dist: number) => {
    setNearestStation(station);
    setStationDistance(dist);
  }, []);

  const handleNearestPriority = useCallback((zone: PriorityZone | null, dist: number) => {
    setNearestPriority(zone);
    setPriorityDistance(dist);
  }, []);

  const handleStationsReady = useCallback((positions: PosTuple[]) => {
    setStationPositions(positions);
  }, []);

  const handlePriorityReady = useCallback((positions: PosTuple[]) => {
    setPriorityPositions(positions);
  }, []);

  return (
    <div className="explore-page">
      <CityScene
        onTick={handleTick}
        onNearestStation={handleNearestStation}
        onNearestPriority={handleNearestPriority}
        onStationsReady={handleStationsReady}
        onPriorityReady={handlePriorityReady}
      />
      <CityHUD
        nearestStation={nearestStation}
        stationDistance={stationDistance}
        nearestPriority={nearestPriority}
        priorityDistance={priorityDistance}
        hour={hour}
        speed={speed}
        vehicleX={vehicleX}
        vehicleZ={vehicleZ}
        vehicleAngle={vehicleAngle}
        stationPositions={stationPositions}
        priorityPositions={priorityPositions}
      />
    </div>
  );
}
