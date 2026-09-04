import api from './api';
import { Budget, ApiResponse } from '../types';

export const budgetService = {
  async getBudgets(month?: number, year?: number): Promise<{
    period: { month: number; year: number };
    totalAllocated: number;
    totalSpent: number;
    budgets: Budget[];
  }> {
    const res = await api.get<ApiResponse<{
      period: { month: number; year: number };
      totalAllocated: number;
      totalSpent: number;
      budgets: Budget[];
    }>>('/budgets', { params: { month, year } });
    return res.data.data;
  },

  async setBudget(data: {
    categoryId: string | null;
    month: number;
    year: number;
    allocatedAmount: number;
    alertThreshold?: number;
  }): Promise<Budget> {
    const res = await api.post<ApiResponse<Budget>>('/budgets', data);
    return res.data.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
