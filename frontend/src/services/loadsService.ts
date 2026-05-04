import { api } from './api';
import type { Load, PaginatedResponse } from '../types';

export const loadsService = {
  getAll: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<Load>>('/loads', { params }).then(r => r.data),

  getOne: (id: string) =>
    api.get<Load>(`/loads/${id}`).then(r => r.data),

  create: (data: Partial<Load>) =>
    api.post<Load>('/loads', data).then(r => r.data),

  update: (id: string, data: Partial<Load>) =>
    api.put<Load>(`/loads/${id}`, data).then(r => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/loads/${id}/status`, { status }).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/loads/${id}`).then(r => r.data),
};
