import { Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class AnalyticsController {
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const summary = await AnalyticsService.getDashboardSummary(req.user!.id);
      return ApiResponse.success(res, summary);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const analytics = await AnalyticsService.getAnalytics(req.user!.id, year, month);
      return ApiResponse.success(res, analytics);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async getInsights(req: AuthenticatedRequest, res: Response) {
    try {
      const insights = await AnalyticsService.generateInsights(req.user!.id);
      return ApiResponse.success(res, insights);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
