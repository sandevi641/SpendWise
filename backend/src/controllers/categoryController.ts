import { Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class CategoryController {
  static async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const categories = await CategoryService.getUserCategories(req.user!.id);
      return ApiResponse.success(res, categories);
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const category = await CategoryService.createCategory({
        userId: req.user!.id,
        ...req.body,
      });
      return ApiResponse.created(res, category, 'Category created successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await CategoryService.updateCategory(req.params.id, req.user!.id, req.body);
      return ApiResponse.success(res, updated, 'Category updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response) {
    try {
      await CategoryService.deleteCategory(req.params.id, req.user!.id);
      return ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
