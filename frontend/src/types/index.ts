export interface Load {
  id: string;
  load_number: string;
  status: 'delivered' | 'in_transit' | 'booked' | 'cancelled';
  origin: string;
  destination: string;
  truck_type: 'Flatbed' | 'Tanker' | 'Reefer' | 'Box Truck' | 'Semi-Truck';
  miles: number;
  revenue: number;
  fuel_cost: number;
  driver_pay: number;
  driver_id: string;
  customer_id: string;
  dispatcher_id?: string;
  created_at: string;
  delivered_at: string | null;
  driver?: Driver;
  customer?: Customer;
}

export interface Driver {
  id: string;
  name: string;
  truck_type: string;
  terminal: string;
  status: 'active' | 'on_trip' | 'rest' | 'inactive';
  phone?: string;
  license_number?: string;
  created_at: string;
  // computed
  rank?: number;
  loads?: number;
  revenue?: number;
  miles?: number;
  fuel?: number;
  rpm?: string;
}

export interface Dispatcher {
  id: string;
  name: string;
  team: string;
  region: string;
  user_id?: string;
  created_at: string;
  // computed
  rank?: number;
  loads?: number;
  revenue?: number;
  profit?: number;
  margin?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  // computed
  loads?: number;
  revenue?: number;
  revenue_share?: string;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  profit: number;
  loads: number;
  fuel: number;
  miles: number;
  driver_pay: number;
}

export interface OverviewStats {
  revenue: number;
  profit: number;
  margin: string;
  miles: number;
  rpm: string;
  fuel: number;
  fcpm: string;
  total_loads: number;
  avg_rev_load: number;
  delivered: number;
  delivery_rate: string;
  in_transit: number;
  booked: number;
  cancelled: number;
  driver_pay: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dispatcher' | 'analyst' | 'driver';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type Period = '3M' | '6M' | '12M';
