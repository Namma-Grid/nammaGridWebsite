import type {
  ChargingStation,
  EVRoute,
  LocationOption,
  RouteSegment,
} from '@/app/lib/types';
import { CHARGING_STATIONS } from '@/app/data/charging-stations';

const STATION_PROXIMITY_KM = 1.5;

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

// ─── Bangalore Road Network Graph ───────────────────────────────────────────
// Undirected edges representing major road connections between localities.
// Edge weights are computed from Haversine distance at graph-build time.

const EDGES: [string, string][] = [
  // Central / MG Road corridor
  ['mgroad',       'shivajinagar'],
  ['mgroad',       'indiranagar'],
  ['mgroad',       'koramangala'],
  ['mgroad',       'majestic'],
  ['shivajinagar', 'majestic'],
  ['shivajinagar', 'malleshwaram'],
  ['shivajinagar', 'manyata'],

  // North corridor
  ['majestic',     'malleshwaram'],
  ['majestic',     'rajajinagar'],
  ['malleshwaram', 'rajajinagar'],
  ['malleshwaram', 'hebbal'],
  ['hebbal',       'manyata'],
  ['hebbal',       'yelahanka'],
  ['manyata',      'hennur'],

  // East / Indiranagar corridor
  ['indiranagar',  'koramangala'],
  ['indiranagar',  'marathahalli'],
  ['indiranagar',  'hennur'],
  ['marathahalli', 'whitefield'],
  ['marathahalli', 'orr'],
  ['whitefield',   'orr'],
  ['orr',          'sarjapur'],

  // South / Koramangala corridor
  ['koramangala',  'btm'],
  ['koramangala',  'silkboard'],
  ['koramangala',  'hsr'],
  ['btm',          'silkboard'],
  ['btm',          'jayanagar'],
  ['btm',          'bommanahalli'],
  ['btm',          'hsr'],
  ['hsr',          'silkboard'],
  ['hsr',          'sarjapur'],
  ['hsr',          'bommanahalli'],
  ['silkboard',    'bommanahalli'],

  // South-West / Jayanagar corridor
  ['jayanagar',    'jpnagar'],
  ['jayanagar',    'banashankari'],
  ['jpnagar',      'banashankari'],
  ['jpnagar',      'bannerghatta'],
  ['banashankari', 'bannerghatta'],

  // South / Electronic City corridor
  ['bannerghatta', 'bommanahalli'],
  ['bommanahalli', 'ecity'],
  ['sarjapur',     'ecity'],
  ['ecity',        'bannerghatta'],
];

// ─── Utilities ───────────────────────────────────────────────────────────────

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

// ─── Graph Construction ───────────────────────────────────────────────────────

type AdjList = Map<string, { id: string; dist: number }[]>;

function buildGraph(): AdjList {
  const graph: AdjList = new Map();
  for (const loc of LOCATIONS) graph.set(loc.id, []);

  for (const [a, b] of EDGES) {
    const locA = LOCATIONS.find((l) => l.id === a);
    const locB = LOCATIONS.find((l) => l.id === b);
    if (!locA || !locB) continue;
    const dist = haversineDistance(locA.lat, locA.lng, locB.lat, locB.lng);
    graph.get(a)!.push({ id: b, dist });
    graph.get(b)!.push({ id: a, dist });
  }
  return graph;
}

// ─── Dijkstra's Shortest Path ────────────────────────────────────────────────

function dijkstra(originId: string, destId: string): string[] | null {
  const graph = buildGraph();
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const loc of LOCATIONS) {
    dist.set(loc.id, Infinity);
    prev.set(loc.id, null);
  }
  dist.set(originId, 0);

  // Min-heap via sorted array — fine for N=24 nodes
  const queue: { id: string; cost: number }[] = [{ id: originId, cost: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { id: current } = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);
    if (current === destId) break;

    for (const { id: neighbor, dist: edgeDist } of graph.get(current) ?? []) {
      if (visited.has(neighbor)) continue;
      const newDist = dist.get(current)! + edgeDist;
      if (newDist < dist.get(neighbor)!) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, current);
        queue.push({ id: neighbor, cost: newDist });
      }
    }
  }

  if (dist.get(destId) === Infinity) return null; // no path

  // Reconstruct
  const path: string[] = [];
  let cur: string | null = destId;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }
  return path;
}

// ─── Path interpolation between two lat/lng points ──────────────────────────

function interpolateSegment(
  from: [number, number],
  to: [number, number],
  steps: number,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Slight sinusoidal jitter to mimic road curves
    const jLat = Math.sin(t * Math.PI) * (Math.random() * 0.003 - 0.0015);
    const jLng = Math.sin(t * Math.PI) * (Math.random() * 0.003 - 0.0015);
    pts.push([
      from[0] + (to[0] - from[0]) * t + jLat,
      from[1] + (to[1] - from[1]) * t + jLng,
    ]);
  }
  return pts;
}

// ─── Charging stations near a polyline ──────────────────────────────────────

function findStationsOnPath(
  path: [number, number][],
  thresholdKm = STATION_PROXIMITY_KM,
): ChargingStation[] {
  return CHARGING_STATIONS.filter((s) => {
    for (const [lat, lng] of path) {
      if (haversineDistance(s.lat, s.lng, lat, lng) < thresholdKm) return true;
    }
    return false;
  });
}

// ─── EV count seeding (kept stable across OSRM + fallback paths) ────────────

function evCountFor(fromId: string, toId: string, stepIndex: number): number {
  const seed = (fromId + toId)
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 5 + ((seed * (stepIndex + 1) * 17 + 49297) % 30);
}

// ─── Synthetic route (straight-line hops + sinusoidal jitter) ───────────────

function generateSyntheticRoute(
  origin: LocationOption,
  dest: LocationOption,
  locationPath: string[],
): EVRoute {
  const fullPath: [number, number][] = [];
  const segments: RouteSegment[] = [];

  for (let i = 0; i < locationPath.length - 1; i++) {
    const fromLoc = LOCATIONS.find((l) => l.id === locationPath[i])!;
    const toLoc = LOCATIONS.find((l) => l.id === locationPath[i + 1])!;

    const edgeDist = haversineDistance(fromLoc.lat, fromLoc.lng, toLoc.lat, toLoc.lng);
    const steps = Math.max(4, Math.round(edgeDist * 2));

    const subPath = interpolateSegment(
      [fromLoc.lat, fromLoc.lng],
      [toLoc.lat, toLoc.lng],
      steps,
    );

    if (i > 0) subPath.shift();

    for (let j = 0; j < subPath.length - 1; j++) {
      segments.push({
        from: subPath[j],
        to: subPath[j + 1],
        evCount: evCountFor(fromLoc.id, toLoc.id, j),
      });
    }

    fullPath.push(...subPath);
  }

  let totalDist = 0;
  for (let i = 1; i < locationPath.length; i++) {
    const a = LOCATIONS.find((l) => l.id === locationPath[i - 1])!;
    const b = LOCATIONS.find((l) => l.id === locationPath[i])!;
    totalDist += haversineDistance(a.lat, a.lng, b.lat, b.lng);
  }

  const totalEVs = segments.reduce((s, seg) => s + seg.evCount, 0);
  const stationsOnPath = findStationsOnPath(fullPath);
  const viaLocations = locationPath
    .slice(1, -1)
    .map((id) => LOCATIONS.find((l) => l.id === id)!.name);

  return {
    origin,
    destination: dest,
    path: fullPath,
    totalEVs,
    distance: Math.round(totalDist * 10) / 10,
    estimatedTime: Math.round((totalDist / 25) * 60),
    hexesOnPath: locationPath,
    chargingStations: stationsOnPath.length,
    segments,
    stationsOnPath,
    viaLocations,
  };
}

// ─── OSRM road-snapped route ────────────────────────────────────────────────
// Uses the public OSRM demo server. Free, no API key, but rate-limited and
// not suitable for production. For production, self-host OSRM or swap to
// Mapbox Directions / OpenRouteService.

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

interface OsrmStep {
  geometry: { type: 'LineString'; coordinates: [number, number][] }; // [lng, lat]
}
interface OsrmLeg {
  steps: OsrmStep[];
  distance: number;
  duration: number;
}
interface OsrmRoute {
  distance: number; // meters
  duration: number; // seconds
  legs: OsrmLeg[];
}
interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

async function osrmRoute(
  origin: LocationOption,
  dest: LocationOption,
  locationPath: string[],
  signal?: AbortSignal,
): Promise<EVRoute | null> {
  const waypoints = locationPath
    .map((id) => LOCATIONS.find((l) => l.id === id)!)
    .map((loc) => `${loc.lng},${loc.lat}`)
    .join(';');

  const url = `${OSRM_BASE}/${waypoints}?overview=full&geometries=geojson&steps=true`;

  let resp: Response;
  try {
    resp = await fetch(url, { signal });
  } catch {
    return null;
  }
  if (!resp.ok) return null;

  const data = (await resp.json()) as OsrmResponse;
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) return null;
  if (route.legs.length !== locationPath.length - 1) return null;

  const fullPath: [number, number][] = [];
  const segments: RouteSegment[] = [];

  route.legs.forEach((leg, legIdx) => {
    const fromId = locationPath[legIdx];
    const toId = locationPath[legIdx + 1];

    const legPath: [number, number][] = [];
    leg.steps.forEach((step, stepIdx) => {
      step.geometry.coordinates.forEach((coord, i) => {
        // Skip first point of step (matches last point of previous step)
        if (stepIdx > 0 && i === 0) return;
        legPath.push([coord[1], coord[0]]); // [lng,lat] → [lat,lng]
      });
    });

    // Skip first point of subsequent legs (matches end of previous leg)
    const startIdx = legIdx > 0 ? 1 : 0;

    for (let j = startIdx; j < legPath.length - 1; j++) {
      segments.push({
        from: legPath[j],
        to: legPath[j + 1],
        evCount: evCountFor(fromId, toId, j),
      });
    }

    fullPath.push(...legPath.slice(startIdx));
  });

  if (fullPath.length < 2) return null;

  const totalDistKm = route.distance / 1000;
  const totalEVs = segments.reduce((s, seg) => s + seg.evCount, 0);
  const stationsOnPath = findStationsOnPath(fullPath);
  const viaLocations = locationPath
    .slice(1, -1)
    .map((id) => LOCATIONS.find((l) => l.id === id)!.name);

  return {
    origin,
    destination: dest,
    path: fullPath,
    totalEVs,
    distance: Math.round(totalDistKm * 10) / 10,
    estimatedTime: Math.round(route.duration / 60),
    hexesOnPath: locationPath,
    chargingStations: stationsOnPath.length,
    segments,
    stationsOnPath,
    viaLocations,
  };
}

// ─── Route-aware insights ────────────────────────────────────────────────────

export type RouteInsightSeverity = 'info' | 'positive' | 'warning';

export interface RouteInsight {
  id: string;
  text: string;
  severity: RouteInsightSeverity;
}

const HIGH_DENSITY_CORRIDOR = new Set(['whitefield', 'ecity', 'marathahalli', 'orr']);
const GOOD_CHARGER_RATIO = new Set(['koramangala', 'indiranagar']);

export function getRouteInsights(route: EVRoute, now: Date = new Date()): RouteInsight[] {
  const insights: RouteInsight[] = [];
  const localityIds = new Set(route.hexesOnPath);
  const hour = now.getHours();

  if ([...HIGH_DENSITY_CORRIDOR].some((id) => localityIds.has(id))) {
    insights.push({
      id: 'high-density-corridor',
      text:
        hour >= 18 && hour <= 21
          ? 'Route enters the Whitefield / E-City corridor during peak hours — expect longer station waits.'
          : 'Route enters the Whitefield / E-City corridor — Bengaluru’s highest EV density area, busiest 6–9 PM.',
      severity: 'warning',
    });
  }

  if ([...GOOD_CHARGER_RATIO].some((id) => localityIds.has(id))) {
    insights.push({
      id: 'good-charger-ratio',
      text: 'Route passes through Koramangala / Indiranagar — among the best charger-to-EV ratios in central Bengaluru.',
      severity: 'positive',
    });
  }

  if (hour >= 17) {
    insights.push({
      id: 'evening-availability',
      text: 'Real-time station availability is most accurate when you plan before 5 PM.',
      severity: 'info',
    });
  }

  return insights;
}

// ─── Public route generator ───────────────────────────────────────────────────

export async function generateRoute(
  originId: string,
  destId: string,
  signal?: AbortSignal,
): Promise<EVRoute | null> {
  const origin = LOCATIONS.find((l) => l.id === originId);
  const dest = LOCATIONS.find((l) => l.id === destId);
  if (!origin || !dest) return null;

  const locationPath = dijkstra(originId, destId);
  if (!locationPath || locationPath.length < 2) return null;

  // Try road-snapped route via OSRM; fall back to synthetic on failure.
  const osrmResult = await osrmRoute(origin, dest, locationPath, signal);
  if (osrmResult) return osrmResult;

  return generateSyntheticRoute(origin, dest, locationPath);
}
