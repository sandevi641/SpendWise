import { Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest, DateFilterQuery } from '../types';

export class TransactionController {
  static async getTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const filters: DateFilterQuery = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        month: req.query.month ? parseInt(req.query.month as string, 10) : undefined,
        year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
        categoryId: req.query.categoryId as string,
        accountId: req.query.accountId as string,
        type: req.query.type as 'INCOME' | 'EXPENSE',
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await TransactionService.getTransactions(req.user!.id, filters);
      return ApiResponse.success(res, result.transactions, 'Transactions retrieved', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async getTransactionById(req: AuthenticatedRequest, res: Response) {
    try {
      const tx = await TransactionService.getTransactionById(req.params.id, req.user!.id);
      return ApiResponse.success(res, tx);
    } catch (error: any) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  static async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const tx = await TransactionService.createTransaction({
        userId: req.user!.id,
        ...req.body,
      });
      return ApiResponse.created(res, tx, 'Transaction created successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async updateTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await TransactionService.updateTransaction(req.params.id, req.user!.id, req.body);
      return ApiResponse.success(res, updated, 'Transaction updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      await TransactionService.deleteTransaction(req.params.id, req.user!.id);
      return ApiResponse.success(res, null, 'Transaction deleted successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async suggestCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const description = (req.query.description as string) || '';
      const type = req.query.type as 'INCOME' | 'EXPENSE' | undefined;
      const suggestion = TransactionService.suggestCategoryForDescription(description, type);
      return ApiResponse.success(res, suggestion, 'Category suggested');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
