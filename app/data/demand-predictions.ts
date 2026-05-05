import type { HourlyDemand } from '@/app/lib/types';

// ─── Peak hour definitions ──────────────────────────────────────────────────

const MORNING_PEAK  = [7, 8, 9];
const EVENING_PEAK  = [17, 18, 19, 20, 21];
const NIGHT_OFF     = [0, 1, 2, 3, 4, 5];

function isPeak(hour: number): boolean {
  return MORNING_PEAK.includes(hour) || EVENING_PEAK.includes(hour);
}

// ─── Demand curve generators by zone type ───────────────────────────────────

function residentialDemandCurve(hour: number): number {
  // Residential: peaks evening 6-10 PM (post-work charging)
  if (EVENING_PEAK.includes(hour)) return 70 + Math.random() * 25;
  if (MORNING_PEAK.includes(hour)) return 30 + Math.random() * 15;
  if (NIGHT_OFF.includes(hour))    return 5 + Math.random() * 10;
  return 20 + Math.random() * 20;
}

function workplaceDemandCurve(hour: number): number {
  // Workplace: peaks mid-day (office charging)
  if (hour >= 9 && hour <= 17) return 60 + Math.random() * 30;
  if (MORNING_PEAK.includes(hour)) return 40 + Math.random() * 15;
  if (NIGHT_OFF.includes(hour))    return 2 + Math.random() * 5;
  return 15 + Math.random() * 15;
}

function marketplaceDemandCurve(hour: number): number {
  // Marketplace: peaks afternoon–evening
  if (hour >= 11 && hour <= 20) return 50 + Math.random() * 30;
  if (MORNING_PEAK.includes(hour)) return 25 + Math.random() * 15;
  if (NIGHT_OFF.includes(hour))    return 3 + Math.random() * 7;
  return 15 + Math.random() * 20;
}

// ─── Generate 24-hour prediction for a zone ─────────────────────────────────

export function generate24hPrediction(
  zone: string,
  areaName: string,
  dateOffset: number = 0
): HourlyDemand[] {
  const curveFn =
    zone === 'residential' ? residentialDemandCurve
    : zone === 'workplace' ? workplaceDemandCurve
    : marketplaceDemandCurve;

  // Add slight variation per area (seeded by name)
  const areaSeed = areaName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const areaFactor = 0.8 + (areaSeed % 40) / 100;  // 0.8–1.2

  return Array.from({ length: 24 }, (_, hour) => {
    const baseDemand = curveFn(hour) * areaFactor;
    // Apply date offset for slightly different predictions
    const dayVariance = 1 + (dateOffset * 0.02 * Math.sin(hour));

    const demand = Math.round(baseDemand * dayVariance * 10) / 10;

    return {
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      demand: Math.max(0, demand),
      confidence: isPeak(hour) ? 0.75 + Math.random() * 0.15 : 0.85 + Math.random() * 0.12,
      isPeak: isPeak(hour),
    };
  });
}

// ─── Generate demand snapshot for all cells at a given hour ──────────────────

export function generateDemandSnapshot(
  cells: { h3Index: string; zone: string; nearestArea: string }[],
  hour: number
): Map<string, number> {
  const snapshot = new Map<string, number>();

  for (const cell of cells) {
    const curveFn =
      cell.zone === 'residential' ? residentialDemandCurve
      : cell.zone === 'workplace' ? workplaceDemandCurve
      : marketplaceDemandCurve;

    snapshot.set(cell.h3Index, Math.round(curveFn(hour) * 10) / 10);
  }

  return snapshot;
}

// ─── Aggregate city-wide stats ──────────────────────────────────────────────

export function getCityWideStats(demands: HourlyDemand[]) {
  const total = demands.reduce((s, d) => s + d.demand, 0);
  const peak = demands.reduce((max, d) => (d.demand > max.demand ? d : max), demands[0]);
  const offPeak = demands.reduce((min, d) => (d.demand < min.demand ? d : min), demands[0]);
  const avg = total / demands.length;

  return {
    totalDailyDemand: Math.round(total),
    peakHour: peak.label,
    peakDemand: peak.demand,
    offPeakHour: offPeak.label,
    offPeakDemand: offPeak.demand,
    averageDemand: Math.round(avg * 10) / 10,
  };
}
