import type { ForecastRow, ScheduleResult, LocationRecommendation, UnderservedZone } from './bescom-api';

export const MOCK_FORECAST: ForecastRow[] = Array.from({ length: 24 }, (_, h) => ({
  timestamp: new Date(2026, 4, 15, h).toISOString(),
  zone: 'Koramangala',
  predicted_ev_mw: 2 + Math.sin((h - 7) / 3) * 1.5 + (h >= 18 && h <= 21 ? 3 : 0),
  predicted_base_mw: 8 + Math.sin((h - 9) / 4) * 2,
  predicted_total_mw: 10 + Math.sin((h - 8) / 3.5) * 3 + (h >= 18 && h <= 21 ? 3 : 0),
  grid_capacity_mw: 18,
  utilization_pct: 55 + Math.sin((h - 8) / 3.5) * 15 + (h >= 18 && h <= 21 ? 15 : 0),
  is_peak_risk: h >= 18 && h <= 21 ? 1 : 0,
}));

export const MOCK_SCHEDULE: ScheduleResult = {
  zone: 'Koramangala',
  date: '2026-05-15',
  num_evs: 500,
  total_ev_demand_mwh: 42.5,
  managed_peak_mw: 4.2,
  unmanaged_peak_mw: 6.8,
  peak_reduction_mw: 2.6,
  peak_reduction_pct: 38.2,
  managed_avg_util_pct: 61.4,
  charging_windows: [
    { start_hour: 23, end_hour: 5, duration_h: 6, label: '23:00–05:00' },
    { start_hour: 11, end_hour: 14, duration_h: 3, label: '11:00–14:00' },
  ],
  hourly: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    base_demand_mw: 8 + Math.sin((h - 9) / 4) * 2,
    managed_ev_mw: h >= 23 || h <= 5 || (h >= 11 && h <= 14) ? 2.1 : 0.4,
    unmanaged_ev_mw: h >= 18 && h <= 21 ? 3.4 : 1.2,
    managed_total_mw: (8 + Math.sin((h - 9) / 4) * 2) + (h >= 23 || h <= 5 ? 2.1 : 0.4),
    unmanaged_total_mw: (8 + Math.sin((h - 9) / 4) * 2) + (h >= 18 && h <= 21 ? 3.4 : 1.2),
    grid_capacity_mw: 18,
    managed_utilization_pct: 55 + (h >= 18 && h <= 21 ? 5 : 0),
    unmanaged_util_pct: 55 + (h >= 18 && h <= 21 ? 20 : 0),
    recommendation: h >= 23 || h <= 5 || (h >= 11 && h <= 14) ? 'CHARGE' : h >= 18 && h <= 21 ? 'AVOID' : 'PARTIAL',
  })),
  solver: 'LP-fallback',
};

export const MOCK_RECOMMENDATIONS: LocationRecommendation[] = [
  { zone: 'Koramangala 5th Block', lat: 12.934, lon: 77.624, composite_score: 91, priority: 'URGENT', demand_pressure_norm: 0.94, ev_growth_norm: 0.88, coverage_gap_norm: 0.91, suggested_ports: 20, suggested_capacity_kw: 150, recommendation: 'Critical gap — install immediately' },
  { zone: 'Whitefield Tech Park', lat: 12.968, lon: 77.748, composite_score: 87, priority: 'URGENT', demand_pressure_norm: 0.91, ev_growth_norm: 0.95, coverage_gap_norm: 0.82, suggested_ports: 30, suggested_capacity_kw: 200, recommendation: 'High workplace EV density' },
  { zone: 'HSR Layout Sector 2', lat: 12.911, lon: 77.645, composite_score: 82, priority: 'HIGH', demand_pressure_norm: 0.83, ev_growth_norm: 0.79, coverage_gap_norm: 0.84, suggested_ports: 15, suggested_capacity_kw: 100, recommendation: 'Rapid EV adoption — add capacity' },
  { zone: 'Electronic City Phase 1', lat: 12.847, lon: 77.664, composite_score: 79, priority: 'HIGH', demand_pressure_norm: 0.78, ev_growth_norm: 0.86, coverage_gap_norm: 0.74, suggested_ports: 25, suggested_capacity_kw: 180, recommendation: 'IT hub — workplace fast-chargers needed' },
  { zone: 'Indiranagar 100ft Road', lat: 12.978, lon: 77.641, composite_score: 76, priority: 'HIGH', demand_pressure_norm: 0.80, ev_growth_norm: 0.71, coverage_gap_norm: 0.77, suggested_ports: 12, suggested_capacity_kw: 90, recommendation: 'Commercial corridor gap' },
  { zone: 'Marathahalli Bridge', lat: 12.956, lon: 77.700, composite_score: 73, priority: 'MEDIUM', demand_pressure_norm: 0.72, ev_growth_norm: 0.74, coverage_gap_norm: 0.73, suggested_ports: 10, suggested_capacity_kw: 75, recommendation: 'Transit hub coverage needed' },
];

export const MOCK_UNDERSERVED: UnderservedZone[] = [
  { zone: 'Yelahanka', current_evs: 4200, total_ports: 3, ports_per_1000_evs: 0.71, deficit_ports: 32 },
  { zone: 'Sarjapur', current_evs: 3800, total_ports: 4, ports_per_1000_evs: 1.05, deficit_ports: 24 },
  { zone: 'Bannerghatta Road', current_evs: 5100, total_ports: 6, ports_per_1000_evs: 1.18, deficit_ports: 38 },
  { zone: 'Kanakapura Road', current_evs: 2900, total_ports: 3, ports_per_1000_evs: 1.03, deficit_ports: 20 },
  { zone: 'Tumkur Road', current_evs: 3200, total_ports: 4, ports_per_1000_evs: 1.25, deficit_ports: 21 },
];
