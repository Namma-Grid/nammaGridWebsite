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

// ─── Public route generator ───────────────────────────────────────────────────

export function generateRoute(originId: string, destId: string) {
  const origin = LOCATIONS.find((l) => l.id === originId);
  const dest   = LOCATIONS.find((l) => l.id === destId);
  if (!origin || !dest) return null;

  // ① Find the shortest path (list of location IDs) via Dijkstra
  const locationPath = dijkstra(originId, destId);
  if (!locationPath || locationPath.length < 2) return null;

  // ② Build the full polyline + route segments by interpolating each graph edge
  const fullPath: [number, number][] = [];
  const segments: { from: [number, number]; to: [number, number]; evCount: number }[] = [];

  for (let i = 0; i < locationPath.length - 1; i++) {
    const fromLoc = LOCATIONS.find((l) => l.id === locationPath[i])!;
    const toLoc   = LOCATIONS.find((l) => l.id === locationPath[i + 1])!;

    const edgeDist = haversineDistance(fromLoc.lat, fromLoc.lng, toLoc.lat, toLoc.lng);
    const steps    = Math.max(4, Math.round(edgeDist * 2));

    const subPath = interpolateSegment(
      [fromLoc.lat, fromLoc.lng],
      [toLoc.lat,   toLoc.lng],
      steps,
    );

    // Avoid duplicating the junction node between hops
    if (i > 0) subPath.shift();

    // Deterministic-ish EV count per sub-segment using a hash of the edge + step
    const edgeSeed = (fromLoc.id + toLoc.id)
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

    for (let j = 0; j < subPath.length - 1; j++) {
      const evCount = 5 + ((edgeSeed * (j + 1) * 17 + 49297) % 30);
      segments.push({ from: subPath[j], to: subPath[j + 1], evCount });
    }

    fullPath.push(...subPath);
  }

  // ③ Compute true shortest-path distance (sum of hop distances)
  let totalDist = 0;
  for (let i = 1; i < locationPath.length; i++) {
    const a = LOCATIONS.find((l) => l.id === locationPath[i - 1])!;
    const b = LOCATIONS.find((l) => l.id === locationPath[i])!;
    totalDist += haversineDistance(a.lat, a.lng, b.lat, b.lng);
  }

  const totalEVs = segments.reduce((s, seg) => s + seg.evCount, 0);

  // Intermediate stop names (exclude origin and destination)
  const viaLocations = locationPath
    .slice(1, -1)
    .map((id) => LOCATIONS.find((l) => l.id === id)!.name);

  return {
    origin,
    destination: dest,
    path: fullPath,
    totalEVs,
    distance: Math.round(totalDist * 10) / 10,
    estimatedTime: Math.round((totalDist / 25) * 60),   // ~25 km/h city avg
    hexesOnPath: locationPath,                           // IDs of nodes on path
    chargingStations: Math.floor(totalDist / 3) + 1,
    segments,
    viaLocations,
  };
}
