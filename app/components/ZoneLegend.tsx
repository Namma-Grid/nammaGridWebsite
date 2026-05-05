import { ZONE_COLORS, ZONE_LABELS, ZONE_ICONS } from '@/app/lib/map-config';

interface ZoneLegendProps {
  zoneCounts?: Record<string, number>;
}

export default function ZoneLegend({ zoneCounts }: ZoneLegendProps) {
  const zones = Object.keys(ZONE_COLORS);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {zones.map((zone) => (
        <div
          key={zone}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
        >
          <span className="text-base">{ZONE_ICONS[zone]}</span>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: ZONE_COLORS[zone] }}
          />
          <span className="text-sm text-slate-600">{ZONE_LABELS[zone]}</span>
          {zoneCounts && zoneCounts[zone] !== undefined && (
            <span className="text-xs text-slate-400 font-mono">
              ({zoneCounts[zone]})
            </span>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <div className="w-3 h-3 rounded-sm border-2 border-amber-500 bg-amber-200" />
        <span className="text-sm text-slate-600">High Demand</span>
      </div>
    </div>
  );
}
