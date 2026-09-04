import { Response } from 'express';
import { BudgetService } from '../services/budgetService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class BudgetController {
  static async getBudgets(req: AuthenticatedRequest, res: Response) {
    try {
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

      const result = await BudgetService.getBudgetsWithProgress(req.user!.id, month, year);
      return ApiResponse.success(res, result);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async setBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const budget = await BudgetService.setBudget({
        userId: req.user!.id,
        categoryId: req.body.categoryId || null,
        month: req.body.month,
        year: req.body.year,
        allocatedAmount: req.body.allocatedAmount,
        alertThreshold: req.body.alertThreshold,
      });
      return ApiResponse.success(res, budget, 'Budget configured successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteBudget(req: AuthenticatedRequest, res: Response) {
    try {
      await BudgetService.deleteBudget(req.params.id, req.user!.id);
      return ApiResponse.success(res, null, 'Budget deleted successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
