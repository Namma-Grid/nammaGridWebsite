const BASE = (process.env.NEXT_PUBLIC_BESCOM_AI_URL ?? 'https://bescom-ev-ai.vercel.app').replace(/\/$/, '');

// Module-level cache: survives page navigation within the same session
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearCache(path?: string): void {
  if (path) _cache.delete(path);
  else _cache.clear();
}

async function get<T>(path: string, bust = false): Promise<T> {
  if (!bust) {
    const hit = _cache.get(path);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
      return hit.data as T;
    }
  }
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`BESCOM API ${path} → ${res.status}`);
  const data = await res.json();
  _cache.set(path, { data, ts: Date.now() });
  return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface GridStatus {
  zone: string;
  grid_capacity_mw: number;
  avg_utilization: number;
  peak_utilization: number;
  headroom_mw: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ForecastRow {
  timestamp: string;
  zone: string;
  predicted_ev_mw: number;
  predicted_base_mw: number;
  predicted_total_mw: number;
  grid_capacity_mw: number;
  utilization_pct: number;
  is_peak_risk: number;
}

export interface ScheduleResult {
  zone: string;
  date: string;
  num_evs: number;
  total_ev_demand_mwh: number;
  managed_peak_mw: number;
  unmanaged_peak_mw: number;
  peak_reduction_mw: number;
  peak_reduction_pct: number;
  managed_avg_util_pct: number;
  charging_windows: ChargingWindow[];
  hourly: HourlySchedule[];
  solver: string;
}

export interface ChargingWindow {
  start_hour: number;
  end_hour: number;
  duration_h: number;
  label: string;
}

export interface HourlySchedule {
  hour: number;
  base_demand_mw: number;
  managed_ev_mw: number;
  unmanaged_ev_mw: number;
  managed_total_mw: number;
  unmanaged_total_mw: number;
  grid_capacity_mw: number;
  managed_utilization_pct: number;
  unmanaged_util_pct: number;
  recommendation: 'CHARGE' | 'PARTIAL' | 'AVOID';
}

export interface LocationRecommendation {
  zone: string;
  lat: number;
  lon: number;
  composite_score: number;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  demand_pressure_norm: number;
  ev_growth_norm: number;
  coverage_gap_norm: number;
  suggested_ports: number;
  suggested_capacity_kw: number;
  recommendation: string;
}

export interface UnderservedZone {
  zone: string;
  current_evs: number;
  total_ports: number;
  ports_per_1000_evs: number;
  deficit_ports: number;
}

export interface GridStress {
  zone: string;
  stress_score: number;
  risk_level: string;
}

export interface ZoneSummary {
  zone: string;
  avg_demand_mw: number;
  peak_demand_mw: number;
  ev_count: number;
  station_count: number;
  total_ports: number;
}

// ── API functions (bust=true bypasses cache) ─────────────────────────────────

export const fetchGridStatus = (zone?: string, bust = false) =>
  get<GridStatus[]>(`/grid/status${zone ? `?zone=${encodeURIComponent(zone)}` : ''}`, bust);

export const fetchGridRisk = (bust = false) =>
  get<GridStatus[]>('/grid/risk', bust);

export const fetchGridStress = (bust = false) =>
  get<GridStress[]>('/grid/stress', bust);

export const fetchForecast = (zone: string, horizonHours = 24, bust = false) =>
  get<ForecastRow[]>(`/forecast/${encodeURIComponent(zone)}?horizon_hours=${horizonHours}`, bust);

export const fetchSchedule = (zone: string, numEvs = 500, bust = false) =>
  get<ScheduleResult>(`/schedule/${encodeURIComponent(zone)}?num_evs=${numEvs}`, bust);

export const fetchScheduleAll = (numEvs = 500, bust = false) =>
  get<ScheduleResult[]>(`/schedule?num_evs=${numEvs}`, bust);

export const fetchLocationRecommendations = (n = 5, bust = false) =>
  get<LocationRecommendation[]>(`/locations/recommend?n=${n}`, bust);

export const fetchUnderservedZones = (bust = false) =>
  get<UnderservedZone[]>('/locations/underserved', bust);

export const fetchZoneSummary = (bust = false) =>
  get<ZoneSummary[]>('/data/summary', bust);

export const fetchHourlyProfile = (zone: string, bust = false) =>
  get<Array<{ hour: number; avg_base_demand_mw: number; avg_ev_demand_mw: number }>>(
    `/data/profile/${encodeURIComponent(zone)}`,
    bust,
  );

export const fetchFullReport = (zone: string, bust = false) =>
  get<Record<string, unknown>>(`/report/${encodeURIComponent(zone)}`, bust);

export const fetchZones = (bust = false) =>
  get<{ zones: string[] }>('/zones', bust);
