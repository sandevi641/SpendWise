export const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: 'Housing & Rent', type: 'EXPENSE', icon: 'Home', color: '#8B5E3C' },
  { name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#D97706' },
  { name: 'Groceries', type: 'EXPENSE', icon: 'ShoppingCart', color: '#059669' },
  { name: 'Transportation', type: 'EXPENSE', icon: 'Car', color: '#2563EB' },
  { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'Zap', color: '#DC2626' },
  { name: 'Entertainment', type: 'EXPENSE', icon: 'Film', color: '#7C3AED' },
  { name: 'Healthcare', type: 'EXPENSE', icon: 'Activity', color: '#DB2777' },
  { name: 'Education & Study', type: 'EXPENSE', icon: 'BookOpen', color: '#4F46E5' },
  { name: 'Personal Care', type: 'EXPENSE', icon: 'Smile', color: '#E11D48' },
  { name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingBag', color: '#EA580C' },
  { name: 'General Expense', type: 'EXPENSE', icon: 'Layers', color: '#6B7280' },

  // Income Categories
  { name: 'Salary & Wages', type: 'INCOME', icon: 'Briefcase', color: '#16A34A' },
  { name: 'Freelance & Projects', type: 'INCOME', icon: 'Laptop', color: '#0D9488' },
  { name: 'Investments & Dividends', type: 'INCOME', icon: 'TrendingUp', color: '#0284C7' },
  { name: 'Gifts & Grants', type: 'INCOME', icon: 'Gift', color: '#9333EA' },
  { name: 'Other Income', type: 'INCOME', icon: 'PlusCircle', color: '#65A30D' },
];

export const ACCOUNT_TYPES = ['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT'] as const;
export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;
export const PAYMENT_METHODS = ['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER'] as const;
export const SAVINGS_GOAL_STATUS = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
