import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    currency?: string;
    monthlyIncomeGoal?: number;
  }): Promise<User> {
    const res = await api.patch<ApiResponse<User>>('/auth/me', data);
    return res.data.data;
  },

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    await api.post('/auth/change-password', data);
  },
};
