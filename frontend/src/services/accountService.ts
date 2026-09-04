import api from './api';
import { Account, Category, ApiResponse } from '../types';

export const accountService = {
  async getAccounts(): Promise<Account[]> {
    const res = await api.get<ApiResponse<Account[]>>('/accounts');
    return res.data.data;
  },

  async createAccount(data: {
    name: string;
    type?: string;
    balance?: number;
    color?: string;
    isDefault?: boolean;
  }): Promise<Account> {
    const res = await api.post<ApiResponse<Account>>('/accounts', data);
    return res.data.data;
  },

  async updateAccount(
    id: string,
    data: { name?: string; type?: string; balance?: number; color?: string; isDefault?: boolean }
  ): Promise<Account> {
    const res = await api.patch<ApiResponse<Account>>(`/accounts/${id}`, data);
    return res.data.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  async createCategory(data: {
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon?: string;
    color?: string;
    budgetLimit?: number;
  }): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  async updateCategory(
    id: string,
    data: { name?: string; type?: string; icon?: string; color?: string; budgetLimit?: number }
  ): Promise<Category> {
    const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
