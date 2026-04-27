import { api } from './api';
import type { OverviewStats, MonthlyStats, Driver, Dispatcher, Customer, Period } from '../types';

export const statsService = {
  getOverview:   (period: Period = '12M') => api.get<OverviewStats>('/stats/overview',   { params: { period } }).then(r => r.data),
  getMonthly:    (period: Period = '12M') => api.get<MonthlyStats[]>('/stats/monthly',    { params: { period } }).then(r => r.data),
  getFinancials: (period: Period = '12M') => api.get('/stats/financials',                 { params: { period } }).then(r => r.data),
};

export const driversService = {
  getAll:     (sort = 'revenue', order = 'desc') => api.get<Driver[]>('/drivers', { params: { sort, order } }).then(r => r.data),
  getMetrics: ()                                  => api.get('/drivers/metrics').then(r => r.data),
  create:     (data: Partial<Driver>)             => api.post<Driver>('/drivers', data).then(r => r.data),
  update:     (id: string, data: Partial<Driver>) => api.put<Driver>(`/drivers/${id}`, data).then(r => r.data),
  remove:     (id: string)                        => api.delete(`/drivers/${id}`).then(r => r.data),
};

export const dispatchersService = {
  getAll:  ()                                      => api.get<Dispatcher[]>('/dispatchers').then(r => r.data),
  create:  (data: Partial<Dispatcher>)             => api.post<Dispatcher>('/dispatchers', data).then(r => r.data),
  update:  (id: string, data: Partial<Dispatcher>) => api.put<Dispatcher>(`/dispatchers/${id}`, data).then(r => r.data),
  remove:  (id: string)                            => api.delete(`/dispatchers/${id}`).then(r => r.data),
};

export const customersService = {
  getAll:  ()                                    => api.get<Customer[]>('/customers').then(r => r.data),
  create:  (data: Partial<Customer>)             => api.post<Customer>('/customers', data).then(r => r.data),
  update:  (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data).then(r => r.data),
  remove:  (id: string)                          => api.delete(`/customers/${id}`).then(r => r.data),
};