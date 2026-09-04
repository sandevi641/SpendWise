import api from './api';
import { SavingsGoal, ApiResponse } from '../types';

export const savingsService = {
  async getGoals(): Promise<SavingsGoal[]> {
    const res = await api.get<ApiResponse<SavingsGoal[]>>('/savings');
    return res.data.data;
  },

  async createGoal(data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string | null;
    category?: string;
    color?: string;
  }): Promise<SavingsGoal> {
    const res = await api.post<ApiResponse<SavingsGoal>>('/savings', data);
    return res.data.data;
  },

  async updateGoal(
    id: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      targetDate?: string | null;
      category?: string;
      color?: string;
      status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    }
  ): Promise<SavingsGoal> {
    const res = await api.patch<ApiResponse<SavingsGoal>>(`/savings/${id}`, data);
    return res.data.data;
  },

  async addFunds(id: string, amount: number): Promise<SavingsGoal> {
    const res = await api.post<ApiResponse<SavingsGoal>>(`/savings/${id}/contribute`, { amount });
    return res.data.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await api.delete(`/savings/${id}`);
  },
};
