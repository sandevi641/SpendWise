import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse';

export function validateRequest(req: Request, res: Response, next: NextFunction): void | Response {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param,
      message: err.msg,
      value: (err as any).value,
    }));
    return ApiResponse.badRequest(res, 'Validation failed for input fields', formattedErrors);
  }
  next();
}
