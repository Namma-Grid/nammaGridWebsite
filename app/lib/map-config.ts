// ─── Bangalore Map Configuration ────────────────────────────────────────────

export const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];
export const DEFAULT_ZOOM = 12;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 16;

// CartoDB Voyager — free, no API key, clean light map aesthetic
export const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

// ─── Zone color palette ─────────────────────────────────────────────────────

export const ZONE_COLORS: Record<string, string> = {
  residential: '#2563EB',   // Blue
  workplace:   '#D97706',   // Amber
  marketplace: '#059669',   // Emerald
};

export const ZONE_COLORS_LIGHT: Record<string, string> = {
  residential: 'rgba(37,99,235,0.25)',
  workplace:   'rgba(217,119,6,0.25)',
  marketplace: 'rgba(5,150,105,0.25)',
};

export const ZONE_LABELS: Record<string, string> = {
  residential: 'Residential',
  workplace:   'Workplace',
  marketplace: 'Marketplace',
};

export const ZONE_ICONS: Record<string, string> = {
  residential: '🏠',
  workplace:   '🏢',
  marketplace: '🛒',
};

// ─── Demand heatmap gradient ────────────────────────────────────────────────

export const DEMAND_GRADIENT = {
  low:    '#1E40AF',
  medium: '#F59E0B',
  high:   '#EF4444',
  critical: '#DC2626',
};
