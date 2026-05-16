import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceArea,
} from 'recharts';

interface ChartData {
  hour: number;
  congestion: number;
}

interface FriendlyTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
}

function FriendlyTooltip({ active, payload, label }: FriendlyTooltipProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const congestion = v > 70 ? 'High' : v > 45 ? 'Medium' : 'Low';
  const wait = v > 70 ? '15+ min' : v > 45 ? '5-10 min' : '<5 min';
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-700">{label}:00</p>
      <p className="text-slate-500">Congestion: <span className={v > 70 ? 'text-red-600' : v > 45 ? 'text-amber-600' : 'text-emerald-600'}>{congestion}</span></p>
      <p className="text-slate-500">Expected wait: {wait}</p>
    </div>
  );
}

export default function ForecastChart({ data }: { data: ChartData[] }) {
  const memoizedTooltip = useMemo(() => <FriendlyTooltip />, []);

  return (
    <>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceArea x1={23} x2={24} fill="#10b981" fillOpacity={0.07} />
          <ReferenceArea x1={0} x2={5} fill="#10b981" fillOpacity={0.07} />
          <ReferenceArea x1={18} x2={21} fill="#ef4444" fillOpacity={0.07} />
          <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickFormatter={(h) => `${h}h`} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip content={<FriendlyTooltip />} />
          <Area type="monotone" dataKey="congestion" stroke="#6366f1" fill="url(#congGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-3 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400/30 border border-emerald-400 inline-block" />Off-peak (cheap!)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400/30 border border-red-400 inline-block" />Peak (avoid)</span>
      </div>
    </>
  );
}
