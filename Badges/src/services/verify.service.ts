import api from './api';
import type { VerificationData } from '../types';

export const verifyService = {
  async verify(token: string): Promise<VerificationData> {
    const { data } = await api.get<{ success: boolean; data: VerificationData }>(`/verify/${token}`);
    return data.data!;
  },
};
