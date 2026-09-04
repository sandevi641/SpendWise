import { BudgetRepository } from '../repositories/budgetRepository';
import { prisma } from '../config/database';
import { DecimalMath } from '../utils/decimalMath';

export class BudgetService {
  /**
   * Retrieves all budgets for a given month and year with calculated spent amounts and alert statuses
   */
  static async getBudgetsWithProgress(userId: string, month: number, year: number) {
    const budgets = await BudgetRepository.findByUserAndPeriod(userId, month, year);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch all expenses in this period
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { amount: true, categoryId: true },
    });

    const categorySpendMap: Record<string, number> = {};
    let totalMonthlyExpense = 0;

    expenses.forEach((tx) => {
      totalMonthlyExpense = DecimalMath.add(totalMonthlyExpense, tx.amount);
      categorySpendMap[tx.categoryId] = DecimalMath.add(
        categorySpendMap[tx.categoryId] || 0,
        tx.amount
      );
    });

    const enrichedBudgets = budgets.map((b) => {
      // If categoryId is null, it tracks total monthly spending
      const spent = b.categoryId ? (categorySpendMap[b.categoryId] || 0) : totalMonthlyExpense;
      const remaining = DecimalMath.round(Math.max(0, b.allocatedAmount - spent));
      const percentageUsed = b.allocatedAmount > 0
        ? DecimalMath.percentage(spent, b.allocatedAmount)
        : 0;
      const isExceeded = spent > b.allocatedAmount;
      const isWarning = !isExceeded && percentageUsed >= b.alertThreshold;

      return {
        ...b,
        spent: DecimalMath.round(spent),
        remaining,
        percentageUsed: Math.min(100, percentageUsed),
        actualPercentage: percentageUsed,
        isExceeded,
        isWarning,
      };
    });

    const totalAllocated = budgets.reduce((sum, b) => DecimalMath.add(sum, b.allocatedAmount), 0);

    return {
      period: { month, year },
      totalAllocated: DecimalMath.round(totalAllocated),
      totalSpent: DecimalMath.round(totalMonthlyExpense),
      budgets: enrichedBudgets,
    };
  }

  static async setBudget(data: {
    userId: string;
    categoryId: string | null;
    month: number;
    year: number;
    allocatedAmount: number;
    alertThreshold?: number;
  }) {
    return BudgetRepository.upsert(data);
  }

  static async deleteBudget(id: string, userId: string) {
    const budget = await BudgetRepository.findById(id, userId);
    if (!budget) throw new Error('Budget not found');
    return BudgetRepository.delete(id, userId);
  }
}
