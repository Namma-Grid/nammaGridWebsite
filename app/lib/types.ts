// ─── Core Data Types ────────────────────────────────────────────────────────

export interface HexCell {
  h3Index: string;
  zone: 'residential' | 'workplace' | 'marketplace';
  nearestArea: string;
  center: { lat: number; lng: number };
  boundary: { lat: number; lng: number }[];
  demanded: boolean;
  demandLevel: number;   // 0–100 normalized
  evCount: number;
}

export interface HexGridMeta {
  city: string;
  h3Resolution: number;
  cellDiameterMeters: number;
  totalCells: number;
  zoneCounts: Record<string, number>;
  generatedAt: string;
  coordinateSystem: string;
  boundaryVertexOrder: string;
}

export interface HexGridData {
  meta: HexGridMeta;
  grid: HexCell[];
}

// ─── Locations (Uber/Ola style picker) ──────────────────────────────────────

export interface LocationOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area: string;
  h3Index?: string;
}

// ─── EV Route ───────────────────────────────────────────────────────────────

export interface EVRoute {
  origin: LocationOption;
  destination: LocationOption;
  path: [number, number][];
  totalEVs: number;
  distance: number;         // km
  estimatedTime: number;    // minutes
  hexesOnPath: string[];    // location IDs along the shortest path
  chargingStations: number;
  segments: RouteSegment[];
  viaLocations: string[];   // intermediate location names (graph hops)
}

export interface RouteSegment {
  from: [number, number];
  to: [number, number];
  evCount: number;
}

// ─── Demand Prediction ──────────────────────────────────────────────────────

export interface DemandPrediction {
  h3Index: string;
  nearestArea: string;
  zone: string;
  timestamp: string;
  hour: number;
  predictedDemand: number;  // kW
  confidence: number;       // 0–1
  peakHour: boolean;
}

export interface HourlyDemand {
  hour: number;
  label: string;
  demand: number;
  confidence: number;
  isPeak: boolean;
}
