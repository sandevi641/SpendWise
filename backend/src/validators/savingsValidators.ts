import { body } from 'express-validator';
import { SAVINGS_GOAL_STATUS, ACCOUNT_TYPES } from '../config/constants';

export const createSavingsGoalValidator = [
  body('name').trim().notEmpty().withMessage('Goal name is required'),
  body('targetAmount')
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be greater than 0'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current amount must be non-negative'),
  body('targetDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Target date must be a valid date'),
  body('category').optional().isString(),
  body('color').optional().isString(),
];

export const updateSavingsGoalValidator = [
  body('name').optional().trim().notEmpty(),
  body('targetAmount').optional().isFloat({ gt: 0 }),
  body('currentAmount').optional().isFloat({ min: 0 }),
  body('targetDate').optional({ nullable: true }).isISO8601(),
  body('category').optional().isString(),
  body('color').optional().isString(),
  body('status').optional().isIn(SAVINGS_GOAL_STATUS),
];

export const addContributionValidator = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Contribution amount must be greater than 0'),
];

export const createAccountValidator = [
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type').optional().isIn(ACCOUNT_TYPES).withMessage(`Account type must be one of: ${ACCOUNT_TYPES.join(', ')}`),
  body('balance').optional().isFloat(),
  body('color').optional().isString(),
  body('isDefault').optional().isBoolean(),
];
