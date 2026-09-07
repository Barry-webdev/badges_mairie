import api from './api';
import type { Badge, PaginatedResponse } from '../types';

export const badgeService = {
  async getAll(filters: { page?: number; limit?: number; statut?: string } = {}): Promise<PaginatedResponse<Badge>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.statut) params.set('statut', filters.statut);

    const { data } = await api.get<PaginatedResponse<Badge>>(`/badges?${params}`);
    return data;
  },

  async getById(id: string): Promise<Badge> {
    const { data } = await api.get<{ success: boolean; data: Badge }>(`/badges/${id}`);
    return data.data!;
  },

  async generate(agentId: string, payload: { dateEmission: string; dateExpiration: string }): Promise<Badge> {
    const { data } = await api.post<{ success: boolean; data: Badge }>(`/badges/${agentId}/generate`, payload);
    return data.data!;
  },

  async downloadPdf(badgeId: string, matricule: string): Promise<void> {
    const response = await api.get(`/badges/${badgeId}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `badge-${matricule}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async revoke(badgeId: string, motif: string): Promise<Badge> {
    const { data } = await api.post<{ success: boolean; data: Badge }>(`/badges/${badgeId}/revoke`, { motif });
    return data.data!;
  },

  async suspend(badgeId: string, motif: string): Promise<Badge> {
    const { data } = await api.post<{ success: boolean; data: Badge }>(`/badges/${badgeId}/suspend`, { motif });
    return data.data!;
  },

  async renew(badgeId: string, payload: { dateEmission: string; dateExpiration: string }): Promise<Badge> {
    const { data } = await api.post<{ success: boolean; data: Badge }>(`/badges/${badgeId}/renew`, payload);
    return data.data!;
  },
};
