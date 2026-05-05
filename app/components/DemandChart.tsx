'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { HourlyDemand } from '@/app/lib/types';

interface DemandChartProps {
  data: HourlyDemand[];
  areaName?: string;
  zoneName?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: HourlyDemand }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;

  return (
    <div className="glass-card-static px-4 py-3 text-sm" style={{ minWidth: 160 }}>
      <div className="font-semibold text-slate-800 mb-1">{label}</div>
      <div className="flex justify-between gap-4 text-slate-500">
        <span>Demand</span>
        <span className="font-mono font-semibold text-amber-600">{d.demand} kW</span>
      </div>
      <div className="flex justify-between gap-4 text-slate-500">
        <span>Confidence</span>
        <span className="font-mono">{(d.confidence * 100).toFixed(0)}%</span>
      </div>
      {d.isPeak && (
        <div className="mt-1 badge badge-red text-[10px]">⚠ Peak Hour</div>
      )}
    </div>
  );
}

export default function DemandChart({ data, areaName, zoneName }: DemandChartProps) {
  const peakHour = data.reduce((max, d) => (d.demand > max.demand ? d : max), data[0]);

  return (
    <div>
      {areaName && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-slate-400">Showing prediction for</span>
          <span className="badge badge-blue">{areaName}</span>
          {zoneName && (
            <span className="badge badge-emerald capitalize">{zoneName}</span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#D97706" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#DC2626" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
            tickLine={false}
            interval={2}
          />

          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: 'kW',
              position: 'insideTopLeft',
              offset: 10,
              style: { fill: '#94a3b8', fontSize: 11 },
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            x={peakHour?.label}
            stroke="#DC2626"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: '▲ Peak',
              position: 'top',
              fill: '#DC2626',
              fontSize: 10,
            }}
          />

          <Area
            type="monotone"
            dataKey="demand"
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="url(#demandGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: '#2563EB',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats bar */}
      <div className="flex gap-3 mt-4 flex-wrap">
        <div className="stat-card flex-1 min-w-[100px]">
          <div className="stat-value text-amber-600 text-lg">
            {peakHour?.demand} kW
          </div>
          <div className="stat-label">Peak ({peakHour?.label})</div>
        </div>
        <div className="stat-card flex-1 min-w-[100px]">
          <div className="stat-value text-emerald-600 text-lg">
            {Math.round(data.reduce((s, d) => s + d.demand, 0) / data.length)} kW
          </div>
          <div className="stat-label">Avg Demand</div>
        </div>
        <div className="stat-card flex-1 min-w-[100px]">
          <div className="stat-value text-blue-600 text-lg">
            {data.filter((d) => d.isPeak).length}h
          </div>
          <div className="stat-label">Peak Hours</div>
        </div>
      </div>
    </div>
  );
}
