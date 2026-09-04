import api from './api';
import { Transaction, ApiResponse } from '../types';

export const transactionService = {
  async getTransactions(params?: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    type?: 'INCOME' | 'EXPENSE';
    categoryId?: string;
    accountId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; meta?: any }> {
    const res = await api.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return { transactions: res.data.data, meta: res.data.meta };
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const res = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return res.data.data;
  },

  async createTransaction(data: {
    accountId: string;
    categoryId: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    date?: string;
    paymentMethod?: string;
    tags?: string;
    isRecurring?: boolean;
  }): Promise<Transaction> {
    const res = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return res.data.data;
  },

  async updateTransaction(
    id: string,
    data: {
      accountId?: string;
      categoryId?: string;
      amount?: number;
      type?: 'INCOME' | 'EXPENSE';
      description?: string;
      date?: string;
      paymentMethod?: string;
      tags?: string;
      isRecurring?: boolean;
    }
  ): Promise<Transaction> {
    const res = await api.patch<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return res.data.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async suggestCategory(description: string, type?: 'INCOME' | 'EXPENSE'): Promise<{ categoryName: string; confidence: number }> {
    const res = await api.get<ApiResponse<{ categoryName: string; confidence: number }>>('/transactions/suggest-category', {
      params: { description, type },
    });
    return res.data.data;
  },
};
