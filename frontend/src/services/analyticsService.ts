import api from './api';
import { DashboardSummary, AnalyticsData, SpendingInsight, ApiResponse } from '../types';

export const analyticsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await api.get<ApiResponse<DashboardSummary>>('/analytics/dashboard');
    return res.data.data;
  },

  async getAnalytics(year?: number, month?: number): Promise<AnalyticsData> {
    const res = await api.get<ApiResponse<AnalyticsData>>('/analytics', { params: { year, month } });
    return res.data.data;
  },

  async getInsights(): Promise<SpendingInsight[]> {
    const res = await api.get<ApiResponse<SpendingInsight[]>>('/analytics/insights');
    return res.data.data;
  },
};
