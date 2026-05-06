import type { ChargingStation } from '@/app/lib/types';

// Synthetic but plausible EV charging stations across Bangalore.
// Coordinates target major malls, tech parks, and arterial junctions
// where public chargers actually cluster.

export const CHARGING_STATIONS: ChargingStation[] = [
  { id: 'cs-phoenix',      name: 'Phoenix Marketcity',         operator: 'Tata Power EZ Charge', kw: 60, lat: 12.9952, lng: 77.6962 },
  { id: 'cs-forum',        name: 'Forum Mall Koramangala',     operator: 'Statiq',               kw: 50, lat: 12.9341, lng: 77.6128 },
  { id: 'cs-mantri',       name: 'Mantri Square Malleshwaram', operator: 'Tata Power EZ Charge', kw: 25, lat: 13.0036, lng: 77.5697 },
  { id: 'cs-ubcity',       name: 'UB City Mall',               operator: 'ChargeZone',           kw: 50, lat: 12.9719, lng: 77.5961 },
  { id: 'cs-orion',        name: 'Orion Mall Rajajinagar',     operator: 'Statiq',               kw: 50, lat: 12.9909, lng: 77.5560 },
  { id: 'cs-vega',         name: 'Vega City Mall Yelahanka',   operator: 'Tata Power EZ Charge', kw: 25, lat: 13.0989, lng: 77.5950 },
  { id: 'cs-manyata',      name: 'Manyata Tech Park',          operator: 'Ather Grid',           kw: 22, lat: 13.0467, lng: 77.6217 },
  { id: 'cs-rmz',          name: 'RMZ Ecospace Bellandur',     operator: 'Statiq',               kw: 50, lat: 12.9230, lng: 77.6814 },
  { id: 'cs-bommanahalli', name: 'Bommanahalli Hosur Road',    operator: 'Reliance BP Pulse',    kw: 60, lat: 12.8990, lng: 77.6190 },
  { id: 'cs-ecity',        name: 'Electronic City Phase 1',    operator: 'Tata Power EZ Charge', kw: 50, lat: 12.8458, lng: 77.6629 },
  { id: 'cs-elements',     name: 'Elements Mall Hennur',       operator: 'Statiq',               kw: 25, lat: 13.0316, lng: 77.6385 },
  { id: 'cs-itpl',         name: 'ITPL Whitefield',            operator: 'ChargeZone',           kw: 60, lat: 12.9854, lng: 77.7311 },
  { id: 'cs-mahadevapura', name: 'Mahadevapura Outer Ring Rd', operator: 'Tata Power EZ Charge', kw: 50, lat: 12.9907, lng: 77.6920 },
  { id: 'cs-jpnagar',      name: 'JP Nagar 7th Phase',         operator: 'Statiq',               kw: 25, lat: 12.9077, lng: 77.5840 },
  { id: 'cs-banashankari', name: 'Banashankari BDA Complex',   operator: 'Tata Power EZ Charge', kw: 22, lat: 12.9251, lng: 77.5471 },
  { id: 'cs-marathahalli', name: 'Marathahalli Bridge',        operator: 'Reliance BP Pulse',    kw: 50, lat: 12.9586, lng: 77.6970 },
  { id: 'cs-silkboard',    name: 'Silk Board Junction',        operator: 'ChargeZone',           kw: 50, lat: 12.9176, lng: 77.6234 },
  { id: 'cs-hebbal',       name: 'Hebbal Flyover',             operator: 'Tata Power EZ Charge', kw: 60, lat: 13.0367, lng: 77.5974 },
  { id: 'cs-btm',          name: 'BTM Layout 2nd Stage',       operator: 'Statiq',               kw: 25, lat: 12.9166, lng: 77.6101 },
  { id: 'cs-indiranagar',  name: 'Indiranagar 100ft Road',     operator: 'Ather Grid',           kw: 22, lat: 12.9719, lng: 77.6411 },
];
