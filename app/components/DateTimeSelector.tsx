'use client';

interface DateTimeSelectorProps {
  selectedDate: number;
  selectedHour: number;
  onDateChange: (offset: number) => void;
  onHourChange: (hour: number) => void;
}

const PRESETS = [
  { label: 'Morning Peak', hour: 8, icon: '🌅' },
  { label: 'Afternoon', hour: 14, icon: '☀️' },
  { label: 'Evening Peak', hour: 18, icon: '🌆' },
  { label: 'Off-Peak', hour: 2, icon: '🌙' },
];

function getDateLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}

export default function DateTimeSelector({
  selectedDate,
  selectedHour,
  onDateChange,
  onHourChange,
}: DateTimeSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Date selector */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-medium">
          Prediction Date
        </label>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i}
              onClick={() => onDateChange(i)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedDate === i
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-500 border border-slate-150 hover:bg-slate-50'
              }`}
            >
              {getDateLabel(i)}
            </button>
          ))}
        </div>
      </div>

      {/* Time slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">
            Time of Day
          </label>
          <span className="text-sm font-mono text-slate-800 font-semibold">
            {formatHour(selectedHour)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={selectedHour}
          onChange={(e) => onHourChange(parseInt(e.target.value))}
          className="time-slider"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">12 AM</span>
          <span className="text-[10px] text-slate-400">6 AM</span>
          <span className="text-[10px] text-slate-400">12 PM</span>
          <span className="text-[10px] text-slate-400">6 PM</span>
          <span className="text-[10px] text-slate-400">11 PM</span>
        </div>
      </div>

      {/* Quick presets */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block font-medium">
          Quick Presets
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onHourChange(preset.hour)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedHour === preset.hour
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-white text-slate-500 border border-slate-150 hover:bg-slate-50'
              }`}
            >
              <span>{preset.icon}</span>
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
