import api from './api';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', credentials);
    return data.data!;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ success: boolean; data: User }>('/auth/me');
    return data.data!;
  },
};
