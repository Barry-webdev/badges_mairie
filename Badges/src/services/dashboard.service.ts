import api from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return data.data!;
  },
};
