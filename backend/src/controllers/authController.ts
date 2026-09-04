import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message || 'Registration failed');
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message || 'Invalid credentials');
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await AuthService.getProfile(req.user!.id);
      return ApiResponse.success(res, user, 'Profile retrieved');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await AuthService.updateProfile(req.user!.id, req.body);
      return ApiResponse.success(res, updated, 'Profile updated successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!.id, oldPassword, newPassword);
      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error: any) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}
