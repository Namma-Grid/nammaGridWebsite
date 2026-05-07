import { LOCATIONS } from './ev-routes';

// ─── Charging Station Types ─────────────────────────────────────────────────

export interface ChargingStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area: string;
  type: 'fast' | 'standard' | 'ultra-rapid';
  capacity: number;          // total charging points
  occupied: number;          // currently in-use
  currentLoad: number;       // grid load percentage 0–100
  gridHeadroom: number;      // remaining transformer capacity in kW
  pricePerKwh: number;       // ₹ per kWh
  offPeakPrice: number;      // ₹ per kWh during off-peak (11 PM – 5 AM)
  demandZone: 'residential' | 'workplace' | 'marketplace';
  demandIntensity: number;   // 0–100 — how much EV demand this zone attracts
  peakHours: string;         // human-readable, e.g. "6 PM – 10 PM"
  peakWindow: [number, number]; // [startHour, endHour] inclusive
  status: 'available' | 'busy' | 'offline';
  rating: number;            // 1–5
  whyHere: string;           // explainability tag
}

// ─── Priority zones for new station siting (Part B) ─────────────────────────

export interface PriorityZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  demandIntensity: number;   // 0–100 projected demand
  growthRate: number;        // % YoY EV adoption growth
  feederHeadroom: number;    // available transformer capacity in kW
  reason: string;            // explainability
  recommendedType: 'fast' | 'ultra-rapid';
}

// ─── Deterministic seeded random ────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Zone metadata ──────────────────────────────────────────────────────────

const ZONE_MAP: Record<string, 'residential' | 'workplace' | 'marketplace'> = {
  mgroad: 'marketplace', koramangala: 'workplace', indiranagar: 'marketplace',
  whitefield: 'workplace', ecity: 'workplace', hebbal: 'residential',
  jayanagar: 'residential', malleshwaram: 'residential', btm: 'residential',
  hsr: 'residential', marathahalli: 'workplace', rajajinagar: 'residential',
  majestic: 'marketplace', silkboard: 'workplace', yelahanka: 'residential',
  jpnagar: 'residential', banashankari: 'residential', shivajinagar: 'marketplace',
  manyata: 'workplace', bommanahalli: 'residential', sarjapur: 'workplace',
  bannerghatta: 'residential', orr: 'workplace', hennur: 'residential',
};

const PEAK_HOURS_LABEL: Record<string, string> = {
  residential: '6 PM – 10 PM',
  workplace: '9 AM – 6 PM',
  marketplace: '11 AM – 9 PM',
};

const PEAK_WINDOW: Record<string, [number, number]> = {
  residential: [18, 22],
  workplace:   [9, 18],
  marketplace: [11, 21],
};

const WHY_HERE: Record<string, string[]> = {
  residential: [
    'High EV density in residential cluster',
    'Evening demand surge detected',
    'Off-peak grid capacity available at night',
    'Growing EV adoption in neighborhood',
  ],
  workplace: [
    'Office-hour charging demand peak',
    'Tech corridor with high EV penetration',
    'Adequate transformer headroom',
    'Commuter charging pattern detected',
  ],
  marketplace: [
    'High footfall commercial zone',
    'Opportunity charging during shopping',
    'Mixed-use area with diverse demand',
    'Transit hub with rapid turnover',
  ],
};

// ─── Generate stations from LOCATIONS ───────────────────────────────────────

export const CHARGING_STATIONS: ChargingStation[] = LOCATIONS.map((loc, i) => {
  const seed = loc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const zone = ZONE_MAP[loc.id] || 'residential';

  const typeRoll = seededRandom(seed);
  const type: ChargingStation['type'] =
    typeRoll < 0.3 ? 'ultra-rapid' : typeRoll < 0.65 ? 'fast' : 'standard';

  const capacity = Math.floor(seededRandom(seed + 1) * 8) + 4;
  const occupied = Math.floor(seededRandom(seed + 2) * (capacity + 1));
  const currentLoad = Math.round(seededRandom(seed + 3) * 80 + 10);
  const gridHeadroom = Math.round(seededRandom(seed + 4) * 300 + 50);
  const priceBase = type === 'ultra-rapid' ? 18 : type === 'fast' ? 14 : 10;
  const pricePerKwh = Math.round((priceBase + seededRandom(seed + 5) * 4) * 10) / 10;
  const offPeakPrice = Math.round(pricePerKwh * 0.6 * 10) / 10;

  const statusRoll = seededRandom(seed + 6);
  const status: ChargingStation['status'] =
    occupied >= capacity ? 'busy' : statusRoll < 0.08 ? 'offline' : 'available';

  const rating = Math.round((3.5 + seededRandom(seed + 7) * 1.5) * 10) / 10;
  const demandIntensity = Math.round(40 + seededRandom(seed + 8) * 60);

  const whyOptions = WHY_HERE[zone];
  const whyHere = whyOptions[i % whyOptions.length];

  return {
    id: `station-${loc.id}`,
    name: `${loc.name} EV Station`,
    lat: loc.lat,
    lng: loc.lng,
    area: loc.area,
    type,
    capacity,
    occupied,
    currentLoad,
    gridHeadroom,
    pricePerKwh,
    offPeakPrice,
    demandZone: zone,
    demandIntensity,
    peakHours: PEAK_HOURS_LABEL[zone],
    peakWindow: PEAK_WINDOW[zone],
    status,
    rating,
    whyHere,
  };
});

// ─── Priority zones for new infrastructure (Part B) ─────────────────────────
// Hand-picked under-served growth corridors based on Bengaluru EV-adoption
// trends: peripheral residential growth + outer ORR tech parks where feeder
// headroom is available but stations are sparse.

export const PRIORITY_ZONES: PriorityZone[] = [
  {
    id: 'pz-devanahalli',
    name: 'Devanahalli Corridor',
    lat: 13.2437, lng: 77.7172,
    demandIntensity: 78,
    growthRate: 42,
    feederHeadroom: 420,
    reason: 'Airport-corridor EV adoption +42% YoY · only 1 station within 8 km',
    recommendedType: 'ultra-rapid',
  },
  {
    id: 'pz-sarjapur-outer',
    name: 'Sarjapur Outer Belt',
    lat: 12.8703, lng: 77.7780,
    demandIntensity: 85,
    growthRate: 51,
    feederHeadroom: 380,
    reason: 'Tech-corridor expansion · projected 3.2× demand growth by 2027',
    recommendedType: 'ultra-rapid',
  },
  {
    id: 'pz-kengeri',
    name: 'Kengeri Satellite Town',
    lat: 12.9078, lng: 77.4848,
    demandIntensity: 64,
    growthRate: 28,
    feederHeadroom: 290,
    reason: 'Western residential growth · transformer headroom available',
    recommendedType: 'fast',
  },
  {
    id: 'pz-attibele',
    name: 'Attibele Industrial',
    lat: 12.7833, lng: 77.7714,
    demandIntensity: 71,
    growthRate: 35,
    feederHeadroom: 510,
    reason: 'Logistics hub · commercial fleet electrification',
    recommendedType: 'ultra-rapid',
  },
  {
    id: 'pz-hennur-outer',
    name: 'Hennur Outer Ring',
    lat: 13.0664, lng: 77.6481,
    demandIntensity: 68,
    growthRate: 31,
    feederHeadroom: 240,
    reason: 'Residential cluster growth · evening demand surge predicted',
    recommendedType: 'fast',
  },
  {
    id: 'pz-tumkur-road',
    name: 'Tumkur Road Junction',
    lat: 13.0521, lng: 77.5050,
    demandIntensity: 73,
    growthRate: 38,
    feederHeadroom: 460,
    reason: 'NH-48 transit corridor · long-distance EV charging gap',
    recommendedType: 'ultra-rapid',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getNearestStations(
  lat: number,
  lng: number,
  count: number = 3,
): ChargingStation[] {
  return [...CHARGING_STATIONS]
    .map((s) => ({
      s,
      d: Math.sqrt((s.lat - lat) ** 2 + (s.lng - lng) ** 2),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map(({ s }) => s);
}

// ─── Time-of-day / scheduling logic ─────────────────────────────────────────

export function isPeakHour(station: ChargingStation, hour: number): boolean {
  const [start, end] = station.peakWindow;
  return hour >= start && hour <= end;
}

export function isOffPeak(hour: number): boolean {
  return hour >= 23 || hour < 5;
}

export interface ChargingRecommendation {
  action: 'charge_now' | 'shift_to_offpeak' | 'try_alternate' | 'available';
  message: string;
  savingsRupees?: number;
  gridLoadDelta?: number;
}

export function recommendCharging(
  station: ChargingStation,
  hour: number,
): ChargingRecommendation {
  if (station.status === 'offline') {
    return { action: 'try_alternate', message: 'Station offline — try nearest alternate' };
  }
  const peak = isPeakHour(station, hour);
  const utilization = station.occupied / station.capacity;

  if (peak && (utilization > 0.7 || station.currentLoad > 75)) {
    const kwhAvg = 18; // typical session
    const saving = Math.round((station.pricePerKwh - station.offPeakPrice) * kwhAvg);
    return {
      action: 'shift_to_offpeak',
      message: `Peak load. Delay charge to 11 PM – 5 AM`,
      savingsRupees: saving,
      gridLoadDelta: -Math.round(station.currentLoad * 0.4),
    };
  }

  if (isOffPeak(hour)) {
    return {
      action: 'charge_now',
      message: 'Off-peak window — optimal time to charge',
      savingsRupees: Math.round((station.pricePerKwh - station.offPeakPrice) * 18),
    };
  }

  return {
    action: 'available',
    message: peak ? 'Peak hour — moderate load' : 'Available — grid healthy',
  };
}
