import { Response } from 'express';
import { SavingsService } from '../services/savingsService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class SavingsController {
  static async getGoals(req: AuthenticatedRequest, res: Response) {
    try {
      const goals = await SavingsService.getSavingsGoals(req.user!.id);
      return ApiResponse.success(res, goals);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async createGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const goal = await SavingsService.createGoal({
        userId: req.user!.id,
        ...req.body,
      });
      return ApiResponse.created(res, goal, 'Savings goal created successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async updateGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await SavingsService.updateGoal(req.params.id, req.user!.id, req.body);
      return ApiResponse.success(res, updated, 'Savings goal updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async addContribution(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount } = req.body;
      const updated = await SavingsService.addContribution(req.params.id, req.user!.id, parseFloat(amount));
      return ApiResponse.success(res, updated, 'Funds added to savings goal');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteGoal(req: AuthenticatedRequest, res: Response) {
    try {
      await SavingsService.deleteGoal(req.params.id, req.user!.id);
      return ApiResponse.success(res, null, 'Savings goal deleted successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
