import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface DateFilterQuery {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE';
  accountId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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
  confidenceScore: number; // 0 to 100
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface OcrReceiptResult {
  merchant: string;
  date: string | null;
  totalAmount: number | null;
  suggestedCategory: string;
  items: Array<{ name: string; price?: number }>;
  rawText: string;
}
