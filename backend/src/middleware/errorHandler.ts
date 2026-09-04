import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  console.error('Unhandled API Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  if (err.name === 'UnauthorizedError') {
    return ApiResponse.unauthorized(res, 'Invalid credentials or token');
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return ApiResponse.badRequest(res, 'A unique constraint was violated (duplicate record).');
    }
    if (err.code === 'P2025') {
      return ApiResponse.notFound(res, 'The requested record does not exist or has been deleted.');
    }
  }

  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'An internal server error occurred',
    500
  );
}
