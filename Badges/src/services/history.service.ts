import api from './api';
import type { HistoryItem, PaginatedResponse } from '../types';

export const historyService = {
  async getAll(filters: { page?: number; limit?: number; agentId?: string; action?: string } = {}): Promise<PaginatedResponse<HistoryItem>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.agentId) params.set('agentId', filters.agentId);
    if (filters.action) params.set('action', filters.action);

    const { data } = await api.get<PaginatedResponse<HistoryItem>>(`/history?${params}`);
    return data;
  },
};
