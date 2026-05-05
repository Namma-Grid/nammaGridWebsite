import type { LocationOption } from '@/app/lib/types';

// ─── Notable Bangalore locations for Uber/Ola-style picker ──────────────────

export const LOCATIONS: LocationOption[] = [
  { id: 'mgroad',       name: 'MG Road',              lat: 12.9716,  lng: 77.5946,  area: 'MG Road' },
  { id: 'koramangala',  name: 'Koramangala',           lat: 12.9352,  lng: 77.6245,  area: 'Koramangala' },
  { id: 'indiranagar',  name: 'Indiranagar',           lat: 12.9784,  lng: 77.6408,  area: 'Indiranagar' },
  { id: 'whitefield',   name: 'Whitefield',            lat: 12.9698,  lng: 77.7500,  area: 'Whitefield' },
  { id: 'ecity',        name: 'Electronic City',       lat: 12.8440,  lng: 77.6603,  area: 'Electronic City' },
  { id: 'hebbal',       name: 'Hebbal',                lat: 13.0358,  lng: 77.5970,  area: 'Hebbal' },
  { id: 'jayanagar',    name: 'Jayanagar',             lat: 12.9308,  lng: 77.5838,  area: 'Jayanagar' },
  { id: 'malleshwaram', name: 'Malleshwaram',          lat: 12.9965,  lng: 77.5700,  area: 'Malleshwaram' },
  { id: 'btm',          name: 'BTM Layout',            lat: 12.9166,  lng: 77.6101,  area: 'BTM Layout' },
  { id: 'hsr',          name: 'HSR Layout',            lat: 12.9116,  lng: 77.6474,  area: 'HSR Layout' },
  { id: 'marathahalli', name: 'Marathahalli',          lat: 12.9591,  lng: 77.6974,  area: 'Marathahalli' },
  { id: 'rajajinagar',  name: 'Rajajinagar',           lat: 12.9900,  lng: 77.5555,  area: 'Rajajinagar' },
  { id: 'majestic',     name: 'Majestic',              lat: 12.9767,  lng: 77.5713,  area: 'Majestic' },
  { id: 'silkboard',    name: 'Silk Board Junction',   lat: 12.9177,  lng: 77.6233,  area: 'Silk Board' },
  { id: 'yelahanka',    name: 'Yelahanka',             lat: 13.1007,  lng: 77.5963,  area: 'Yelahanka' },
  { id: 'jpnagar',      name: 'JP Nagar',              lat: 12.9063,  lng: 77.5857,  area: 'JP Nagar' },
  { id: 'banashankari', name: 'Banashankari',          lat: 12.9255,  lng: 77.5468,  area: 'Banashankari' },
  { id: 'shivajinagar', name: 'Shivajinagar',          lat: 12.9857,  lng: 77.5866,  area: 'Shivajinagar' },
  { id: 'manyata',      name: 'Manyata Tech Park',     lat: 13.0467,  lng: 77.6217,  area: 'Manyata Tech Park' },
  { id: 'bommanahalli', name: 'Bommanahalli',          lat: 12.9010,  lng: 77.6190,  area: 'Bommanahalli' },
  { id: 'sarjapur',     name: 'Sarjapur Road',         lat: 12.9107,  lng: 77.6870,  area: 'Sarjapur Road' },
  { id: 'bannerghatta', name: 'Bannerghatta Road',     lat: 12.8876,  lng: 77.5970,  area: 'Bannerghatta Road' },
  { id: 'orr',          name: 'Outer Ring Road',       lat: 12.9340,  lng: 77.6830,  area: 'Outer Ring Road' },
  { id: 'hennur',       name: 'Hennur',                lat: 13.0320,  lng: 77.6380,  area: 'Hennur' },
];

// ─── Generate a realistic route between two points ──────────────────────────

function interpolatePath(
  from: [number, number],
  to: [number, number],
  steps: number = 12
): [number, number][] {
  const path: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add slight curve for realism
    const jitterLat = Math.sin(t * Math.PI) * (Math.random() * 0.004 - 0.002);
    const jitterLng = Math.sin(t * Math.PI) * (Math.random() * 0.004 - 0.002);
    path.push([
      from[0] + (to[0] - from[0]) * t + jitterLat,
      from[1] + (to[1] - from[1]) * t + jitterLng,
    ]);
  }
  return path;
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function generateRoute(originId: string, destId: string) {
  const origin = LOCATIONS.find((l) => l.id === originId);
  const dest = LOCATIONS.find((l) => l.id === destId);
  if (!origin || !dest) return null;

  const dist = haversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);
  const steps = Math.max(8, Math.round(dist * 2));
  const path = interpolatePath(
    [origin.lat, origin.lng],
    [dest.lat, dest.lng],
    steps
  );

  // Seed-based random for consistent results per route pair
  const seed = (origin.id + dest.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seededRandom = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    segments.push({
      from: path[i],
      to: path[i + 1],
      evCount: Math.floor(seededRandom(25) + 3 + Math.random() * 15),
    });
  }

  const totalEVs = segments.reduce((s, seg) => s + seg.evCount, 0);

  return {
    origin,
    destination: dest,
    path,
    totalEVs,
    distance: Math.round(dist * 10) / 10,
    estimatedTime: Math.round((dist / 25) * 60),  // ~25km/h city avg
    hexesOnPath: path.map((_, i) => `seg_${i}`),
    chargingStations: Math.floor(dist / 3) + 1,
    segments,
  };
}
