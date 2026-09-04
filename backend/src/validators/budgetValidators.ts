import { body, query } from 'express-validator';

export const setBudgetValidator = [
  body('categoryId')
    .optional({ nullable: true })
    .isString(),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be valid (e.g. 2026)'),
  body('allocatedAmount')
    .isFloat({ gt: 0 })
    .withMessage('Allocated amount must be greater than 0'),
  body('alertThreshold')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Alert threshold must be a percentage between 1 and 100'),
];

export const budgetQueryValidator = [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000, max: 2100 }),
];
