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
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const token = localStorage.getItem('gc_pita_token');

    const response = await fetch(`${baseUrl}/badges/${String(badgeId)}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erreur ${response.status} : ${errText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `badge-${matricule}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
