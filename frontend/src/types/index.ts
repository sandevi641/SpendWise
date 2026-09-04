export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
  monthlyIncomeGoal: number;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT';
  balance: number;
  color: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER';
  receiptUrl?: string;
  tags?: string;
  isRecurring?: boolean;
  category: Category;
  account: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  month: number;
  year: number;
  allocatedAmount: number;
  alertThreshold: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  actualPercentage: number;
  isExceeded: boolean;
  isWarning: boolean;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  category?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  color: string;
  remaining: number;
  progressPercent: number;
}

export interface DashboardSummary {
  totalBalance: number;
  currentMonth: {
    income: number;
    expenses: number;
    netCashFlow: number;
    savingsRate: number;
    expenseDeltaPercent: number;
    incomeDeltaPercent: number;
  };
  budgetSummary: {
    totalAllocated: number;
    totalSpent: number;
    remaining: number;
    percentageUsed: number;
    isExceeded: boolean;
  };
  spendingByCategory: Array<{ name: string; color: string; amount: number }>;
  recentTransactions: Transaction[];
  savingsGoals: SavingsGoal[];
}

export interface SpendingInsight {
  id: string;
  type: 'WARNING' | 'SUCCESS' | 'INFO' | 'TIP';
  title: string;
  message: string;
  metric?: string;
  actionableText?: string;
}

export interface SpendingPrediction {
  currentSpend: number;
  estimatedMonthEndSpend: number;
  dailyAverage: number;
  remainingDays: number;
  projectedNextMonthSpend: number;
  confidenceScore: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface AnalyticsData {
  period: { year: number; month: number };
  dailyData: Array<{ day: number; date: string; income: number; expense: number; net: number }>;
  categoryBreakdown: Array<{ name: string; color: string; amount: number; count: number; type: string }>;
  monthlyTrends: Array<{ month: number; name: string; income: number; expense: number; savings: number }>;
  prediction: SpendingPrediction;
  insights: SpendingInsight[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: any;
}
