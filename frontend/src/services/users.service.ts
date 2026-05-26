import { api } from '@/lib/api';

export const usersService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/users', { params }),

  getById: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}`, data),

  approve: (id: string) => api.patch(`/users/${id}/approve`),

  block: (id: string) => api.patch(`/users/${id}/block`),

  delete: (id: string) => api.delete(`/users/${id}`),
};
