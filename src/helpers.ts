import type { Tire, Sale, Location } from './types';

export const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return formatDateString(d);
};

export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfWeek = (d: Date): Date => {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfCurrentMonth = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

export const getEndOfCurrentMonth = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

export const getStartOfLastMonth = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);

export const getEndOfLastMonth = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);

// Default data
export const DEFAULT_LOCATIONS: Location[] = [
  { id: 'loc1', name: 'Main Warehouse' },
  { id: 'loc2', name: 'Downtown Store' },
];

export const DEFAULT_TIRE_TYPES = ['Passenger', 'SUV/Truck', 'Performance', 'Winter', 'All-Season', 'Off-Road'];

export const DEFAULT_TIRES: Tire[] = [
  { id: 't1', name: 'Michelin Pilot Sport 4S', type: 'Performance', quantity: 24, locationId: 'loc1', createdAt: getRelativeDateString(30) },
  { id: 't2', name: 'Bridgestone Blizzak WS90', type: 'Winter', quantity: 18, locationId: 'loc1', createdAt: getRelativeDateString(25) },
  { id: 't3', name: 'Goodyear Wrangler Duratrac', type: 'Off-Road', quantity: 12, locationId: 'loc1', createdAt: getRelativeDateString(20) },
  { id: 't4', name: 'Continental ExtremeContact DWS06', type: 'All-Season', quantity: 3, locationId: 'loc1', createdAt: getRelativeDateString(15) },
  { id: 't5', name: 'Pirelli Scorpion Verde', type: 'SUV/Truck', quantity: 8, locationId: 'loc1', createdAt: getRelativeDateString(10) },
  { id: 't6', name: 'Michelin Defender LTX', type: 'SUV/Truck', quantity: 15, locationId: 'loc2', createdAt: getRelativeDateString(12) },
  { id: 't7', name: 'Nokian Hakkapeliitta R3', type: 'Winter', quantity: 20, locationId: 'loc2', createdAt: getRelativeDateString(8) },
  { id: 't8', name: 'Toyo Open Country M/T', type: 'Off-Road', quantity: 10, locationId: 'loc2', createdAt: getRelativeDateString(5) },
];

export const DEFAULT_SALES = (): Sale[] => [
  { id: 's1', tireId: 't1', tireName: 'Michelin Pilot Sport 4S', tireType: 'Performance', quantity: 2, saleDate: getRelativeDateString(0), locationId: 'loc1' },
  { id: 's2', tireId: 't4', tireName: 'Continental ExtremeContact DWS06', tireType: 'All-Season', quantity: 1, saleDate: getRelativeDateString(0), locationId: 'loc1' },
  { id: 's3', tireId: 't2', tireName: 'Bridgestone Blizzak WS90', tireType: 'Winter', quantity: 4, saleDate: getRelativeDateString(1), locationId: 'loc1' },
  { id: 's4', tireId: 't3', tireName: 'Goodyear Wrangler Duratrac', tireType: 'Off-Road', quantity: 2, saleDate: getRelativeDateString(3), locationId: 'loc1' },
  { id: 's5', tireId: 't5', tireName: 'Pirelli Scorpion Verde', tireType: 'SUV/Truck', quantity: 2, saleDate: getRelativeDateString(8), locationId: 'loc1' },
  { id: 's6', tireId: 't1', tireName: 'Michelin Pilot Sport 4S', tireType: 'Performance', quantity: 4, saleDate: getRelativeDateString(10), locationId: 'loc1' },
  { id: 's7', tireId: 't6', tireName: 'Michelin Defender LTX', tireType: 'SUV/Truck', quantity: 3, saleDate: getRelativeDateString(1), locationId: 'loc2' },
  { id: 's8', tireId: 't7', tireName: 'Nokian Hakkapeliitta R3', tireType: 'Winter', quantity: 5, saleDate: getRelativeDateString(2), locationId: 'loc2' },
];
