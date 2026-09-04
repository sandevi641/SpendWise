import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200, meta?: any): Response {
    const responseBody: ApiResponseData<T> = {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    };
    return res.status(statusCode).json(responseBody);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message = 'Internal Server Error', statusCode = 500, errors?: any): Response {
    const responseBody: ApiResponseData = {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    };
    return res.status(statusCode).json(responseBody);
  }

  static badRequest(res: Response, message = 'Bad Request', errors?: any): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message = 'Unauthorized access'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden: Access is denied'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }
}
