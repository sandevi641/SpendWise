import { body, query } from 'express-validator';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../config/constants';

export const createTransactionValidator = [
  body('accountId').isString().notEmpty().withMessage('Account ID is required'),
  body('categoryId').isString().notEmpty().withMessage('Category ID is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('type')
    .isIn(TRANSACTION_TYPES)
    .withMessage(`Type must be either ${TRANSACTION_TYPES.join(' or ')}`),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
  body('paymentMethod')
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 string (YYYY-MM-DD)'),
  body('tags').optional().isString(),
  body('isRecurring').optional().isBoolean(),
];

export const updateTransactionValidator = [
  body('accountId').optional().isString().notEmpty().withMessage('Account ID cannot be empty'),
  body('categoryId').optional().isString().notEmpty().withMessage('Category ID cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('type')
    .optional()
    .isIn(TRANSACTION_TYPES)
    .withMessage(`Type must be either ${TRANSACTION_TYPES.join(' or ')}`),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('paymentMethod')
    .optional()
    .isIn(PAYMENT_METHODS),
  body('date')
    .optional()
    .isISO8601(),
  body('tags').optional().isString(),
  body('isRecurring').optional().isBoolean(),
];

export const transactionQueryValidator = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000, max: 2100 }),
  query('type').optional().isIn(TRANSACTION_TYPES),
  query('categoryId').optional().isString(),
  query('accountId').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
