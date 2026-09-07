import api from './api';
import type { Agent, AgentFormData, PaginatedResponse } from '../types';

export interface AgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  statut?: string;
}

export const agentService = {
  async getAll(filters: AgentFilters = {}): Promise<PaginatedResponse<Agent>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.statut) params.set('statut', filters.statut);

    const { data } = await api.get<PaginatedResponse<Agent>>(`/agents?${params}`);
    return data;
  },

  async getById(id: string): Promise<Agent> {
    const { data } = await api.get<{ success: boolean; data: Agent }>(`/agents/${id}`);
    return data.data!;
  },

  async create(formData: AgentFormData): Promise<Agent> {
    const form = buildFormData(formData);
    const { data } = await api.post<{ success: boolean; data: Agent }>('/agents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data!;
  },

  async update(id: string, formData: Partial<AgentFormData>): Promise<Agent> {
    const form = buildFormData(formData);
    const { data } = await api.put<{ success: boolean; data: Agent }>(`/agents/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/agents/${id}`);
  },

  getPhotoUrl(filename?: string): string {
    if (!filename) return '';
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    return `${baseUrl}/uploads/photos/${filename}`;
  },
};

function buildFormData(data: Partial<AgentFormData>): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      form.append(key, value);
    } else if (value !== null && value !== undefined && value !== '') {
      form.append(key, String(value));
    }
  });
  return form;
}
