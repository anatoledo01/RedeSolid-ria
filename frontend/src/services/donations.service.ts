import { api } from '@/lib/api';

export const donationsService = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/donations', { params }),

  getById: (id: string) => api.get(`/donations/${id}`),

  create: (data: {
    title: string;
    description: string;
    categoryId: string;
    quantity?: number;
    locationText?: string;
    imageUrls?: string[];
  }) => api.post('/donations', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/donations/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/donations/${id}/status`, { status }),

  reserve: (id: string) => api.patch(`/donations/${id}/reserve`),

  delete: (id: string) => api.delete(`/donations/${id}`),
};
