import { Response } from 'express';
import { AccountService } from '../services/accountService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class AccountController {
  static async getAccounts(req: AuthenticatedRequest, res: Response) {
    try {
      const accounts = await AccountService.getUserAccounts(req.user!.id);
      return ApiResponse.success(res, accounts);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async createAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const account = await AccountService.createAccount({
        userId: req.user!.id,
        ...req.body,
      });
      return ApiResponse.created(res, account, 'Account created successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async updateAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await AccountService.updateAccount(req.params.id, req.user!.id, req.body);
      return ApiResponse.success(res, updated, 'Account updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      await AccountService.deleteAccount(req.params.id, req.user!.id);
      return ApiResponse.success(res, null, 'Account deleted successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
