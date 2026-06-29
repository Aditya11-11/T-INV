export interface Tire {
  id: string;
  name: string;
  type: string;
  quantity: number;
  locationId: string;
  createdAt?: string;
}

export interface Sale {
  id: string;
  tireId: string;
  tireName: string;
  tireType: string;
  quantity: number;
  saleDate: string;
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export type AppView =
  | 'dashboard'
  | 'inventory'
  | 'tire-types'
  | 'tire-names'
  | 'sales-logs'
  | 'log-sale'
  | 'locations';
