import { prisma } from '../config/database';
import { DecimalMath } from '../utils/decimalMath';
import { ForecastingService } from './forecastingService';
import { SpendingInsight } from '../types';

export class AnalyticsService {
  /**
   * Calculates dashboard summary (Total balance, current month income/expense, savings rate, budget health)
   */
  static async getDashboardSummary(userId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const startOfPrevMonth = new Date(currentYear, currentMonth - 2, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59, 999);

    // Fetch accounts for total balance
    const accounts = await prisma.account.findMany({ where: { userId } });
    const totalBalance = accounts.reduce((sum, acc) => DecimalMath.add(sum, acc.balance), 0);

    // Fetch transactions for current month
    const currentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true },
    });

    let currentIncome = 0;
    let currentExpenses = 0;
    const categorySpendingMap: Record<string, { name: string; color: string; amount: number }> = {};

    currentTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        currentIncome = DecimalMath.add(currentIncome, tx.amount);
      } else {
        currentExpenses = DecimalMath.add(currentExpenses, tx.amount);
        const catName = tx.category.name;
        if (!categorySpendingMap[catName]) {
          categorySpendingMap[catName] = {
            name: catName,
            color: tx.category.color,
            amount: 0,
          };
        }
        categorySpendingMap[catName].amount = DecimalMath.add(
          categorySpendingMap[catName].amount,
          tx.amount
        );
      }
    });

    // Net cash flow
    const netCashFlow = DecimalMath.subtract(currentIncome, currentExpenses);
    const savingsRate = currentIncome > 0
      ? DecimalMath.percentage(DecimalMath.subtract(currentIncome, currentExpenses), currentIncome)
      : 0;

    // Fetch previous month transactions for comparison
    const prevTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
    });

    let prevIncome = 0;
    let prevExpenses = 0;
    prevTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        prevIncome = DecimalMath.add(prevIncome, tx.amount);
      } else {
        prevExpenses = DecimalMath.add(prevExpenses, tx.amount);
      }
    });

    // Month-over-month deltas
    const expenseDeltaPercent = prevExpenses > 0
      ? DecimalMath.round(((currentExpenses - prevExpenses) / prevExpenses) * 100, 1)
      : 0;
    const incomeDeltaPercent = prevIncome > 0
      ? DecimalMath.round(((currentIncome - prevIncome) / prevIncome) * 100, 1)
      : 0;

    // Fetch budgets for current month
    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: true },
    });

    const totalBudget = budgets.reduce((sum, b) => DecimalMath.add(sum, b.allocatedAmount), 0);
    const budgetUsedPercent = totalBudget > 0 ? DecimalMath.percentage(currentExpenses, totalBudget) : 0;

    // Top spending categories
    const spendingByCategory = Object.values(categorySpendingMap).sort((a, b) => b.amount - a.amount);

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
      take: 6,
    });

    // Active Savings Goals
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { currentAmount: 'desc' },
      take: 3,
    });

    return {
      totalBalance: DecimalMath.round(totalBalance),
      currentMonth: {
        income: DecimalMath.round(currentIncome),
        expenses: DecimalMath.round(currentExpenses),
        netCashFlow: DecimalMath.round(netCashFlow),
        savingsRate: Math.max(0, savingsRate),
        expenseDeltaPercent,
        incomeDeltaPercent,
      },
      budgetSummary: {
        totalAllocated: DecimalMath.round(totalBudget),
        totalSpent: DecimalMath.round(currentExpenses),
        remaining: DecimalMath.round(Math.max(0, totalBudget - currentExpenses)),
        percentageUsed: Math.min(100, budgetUsedPercent),
        isExceeded: currentExpenses > totalBudget && totalBudget > 0,
      },
      spendingByCategory,
      recentTransactions,
      savingsGoals,
    };
  }

  /**
   * Generates deep personalized spending insights based on true user spending habits
   */
  static async generateInsights(userId: string): Promise<SpendingInsight[]> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    const startOfPrevMonth = new Date(currentYear, currentMonth - 2, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59, 999);

    const [currentTxs, prevTxs, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId, month: currentMonth, year: currentYear },
        include: { category: true },
      }),
    ]);

    const insights: SpendingInsight[] = [];

    // 1. Group expenses by category
    const curCatMap: Record<string, number> = {};
    let curTotalExp = 0;
    let curTotalInc = 0;
    currentTxs.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        curCatMap[tx.category.name] = DecimalMath.add(curCatMap[tx.category.name] || 0, tx.amount);
        curTotalExp = DecimalMath.add(curTotalExp, tx.amount);
      } else {
        curTotalInc = DecimalMath.add(curTotalInc, tx.amount);
      }
    });

    const prevCatMap: Record<string, number> = {};
    let prevTotalExp = 0;
    let prevTotalInc = 0;
    prevTxs.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        prevCatMap[tx.category.name] = DecimalMath.add(prevCatMap[tx.category.name] || 0, tx.amount);
        prevTotalExp = DecimalMath.add(prevTotalExp, tx.amount);
      } else {
        prevTotalInc = DecimalMath.add(prevTotalInc, tx.amount);
      }
    });

    // Insight: Top Category Surge
    const sortedCategories = Object.entries(curCatMap).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const topPct = curTotalExp > 0 ? DecimalMath.percentage(topAmount, curTotalExp) : 0;
      const prevTopAmount = prevCatMap[topCategory] || 0;

      if (prevTopAmount > 0 && topAmount > prevTopAmount * 1.25) {
        insights.push({
          id: 'category-surge',
          type: 'WARNING',
          title: `${topCategory} Spike Detected`,
          message: `Your ${topCategory} spending rose by ${DecimalMath.round(((topAmount - prevTopAmount) / prevTopAmount) * 100)}% compared with last month.`,
          metric: `${topPct}% of total spending`,
          actionableText: `Review your ${topCategory} purchases to curb unnecessary expenses.`,
        });
      } else {
        insights.push({
          id: 'top-category',
          type: 'INFO',
          title: `Primary Outflow: ${topCategory}`,
          message: `${topCategory} constitutes ${topPct}% of your total expenditure this month.`,
          metric: `$${topAmount.toLocaleString()}`,
          actionableText: 'Consider setting a specific category budget to cap expenses.',
        });
      }
    }

    // Insight: Budget Health Check
    const totalBudget = budgets.reduce((sum, b) => DecimalMath.add(sum, b.allocatedAmount), 0);
    if (totalBudget > 0) {
      const burnPct = DecimalMath.percentage(curTotalExp, totalBudget);
      const dayOfMonth = now.getDate();
      const totalDays = new Date(currentYear, currentMonth, 0).getDate();
      const expectedBurnRate = (dayOfMonth / totalDays) * 100;

      if (burnPct > 100) {
        insights.push({
          id: 'budget-exceeded',
          type: 'WARNING',
          title: 'Budget Limit Exceeded',
          message: `You have spent ${DecimalMath.round(curTotalExp - totalBudget)} over your total monthly allocated budget.`,
          metric: `${burnPct}% utilized`,
          actionableText: 'Freeze non-essential categories for the rest of the month.',
        });
      } else if (burnPct > expectedBurnRate + 20) {
        insights.push({
          id: 'budget-fast-burn',
          type: 'WARNING',
          title: 'Fast Budget Consumption',
          message: `You've used ${burnPct}% of your budget with ${totalDays - dayOfMonth} days still remaining in the month.`,
          metric: `${Math.round(totalDays - dayOfMonth)} days left`,
          actionableText: 'Slow down discretionary spending to avoid exceeding your monthly limit.',
        });
      } else if (burnPct < expectedBurnRate - 15) {
        insights.push({
          id: 'budget-healthy',
          type: 'SUCCESS',
          title: 'Great Budget Discipline',
          message: `You are spending well within your target allocation for day ${dayOfMonth} of the month.`,
          metric: `${burnPct}% utilized`,
          actionableText: 'Surplus funds can be redirected into your active savings goals.',
        });
      }
    }

    // Insight: Savings Rate Momentum
    if (curTotalInc > 0) {
      const curSavingsRate = DecimalMath.percentage(curTotalInc - curTotalExp, curTotalInc);
      const prevSavingsRate = prevTotalInc > 0 ? DecimalMath.percentage(prevTotalInc - prevTotalExp, prevTotalInc) : 0;

      if (curSavingsRate > prevSavingsRate + 5 && curSavingsRate > 0) {
        insights.push({
          id: 'savings-improved',
          type: 'SUCCESS',
          title: 'Savings Rate Momentum',
          message: `Your savings rate improved to ${curSavingsRate}%, up from ${prevSavingsRate}% last month.`,
          metric: `+${DecimalMath.round(curSavingsRate - prevSavingsRate)}% delta`,
          actionableText: 'Keep this pace to reach your milestone targets ahead of schedule.',
        });
      }
    }

    // Fallback encouraging tip if few insights exist
    if (insights.length < 2) {
      insights.push({
        id: 'portfolio-tip',
        type: 'TIP',
        title: '50/30/20 Rule Recommendation',
        message: 'Aim to allocate 50% of income to Needs, 30% to Wants, and 20% directly into Savings and debt repayment.',
        metric: 'Financial Best Practice',
        actionableText: 'Configure custom category budgets in the Budgets section.',
      });
    }

    return insights;
  }

  /**
   * Analytics Deep Dive: Daily spending series, Category breakdown, Monthly trend, and Forecasting
   */
  static async getAnalytics(userId: string, year = new Date().getFullYear(), month?: number) {
    const targetMonth = month || new Date().getMonth() + 1;
    const startOfMonth = new Date(year, targetMonth - 1, 1);
    const endOfMonth = new Date(year, targetMonth, 0, 23, 59, 59, 999);

    // 1. Current month transactions
    const monthlyTxs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    // Daily spending chart data
    const daysInMonth = new Date(year, targetMonth, 0).getDate();
    const dailyData: Array<{ day: number; date: string; income: number; expense: number; net: number }> = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dailyData.push({
        day: d,
        date: dateStr,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const categoryBreakdownMap: Record<string, { name: string; color: string; amount: number; count: number; type: string }> = {};

    monthlyTxs.forEach((tx) => {
      const dayNum = new Date(tx.date).getDate();
      if (dailyData[dayNum - 1]) {
        if (tx.type === 'INCOME') {
          dailyData[dayNum - 1].income = DecimalMath.add(dailyData[dayNum - 1].income, tx.amount);
        } else {
          dailyData[dayNum - 1].expense = DecimalMath.add(dailyData[dayNum - 1].expense, tx.amount);
        }
        dailyData[dayNum - 1].net = DecimalMath.subtract(
          dailyData[dayNum - 1].income,
          dailyData[dayNum - 1].expense
        );
      }

      const catName = tx.category.name;
      if (!categoryBreakdownMap[catName]) {
        categoryBreakdownMap[catName] = {
          name: catName,
          color: tx.category.color,
          amount: 0,
          count: 0,
          type: tx.type,
        };
      }
      categoryBreakdownMap[catName].amount = DecimalMath.add(
        categoryBreakdownMap[catName].amount,
        tx.amount
      );
      categoryBreakdownMap[catName].count += 1;
    });

    // 2. Full Year 12-Month Trend
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const yearlyTxs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfYear, lte: endOfYear },
      },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthNames.map((name, idx) => ({
      month: idx + 1,
      name,
      income: 0,
      expense: 0,
      savings: 0,
    }));

    const historicalExpenseTotals: number[] = [];

    yearlyTxs.forEach((tx) => {
      const mIndex = new Date(tx.date).getMonth();
      if (tx.type === 'INCOME') {
        monthlyTrends[mIndex].income = DecimalMath.add(monthlyTrends[mIndex].income, tx.amount);
      } else {
        monthlyTrends[mIndex].expense = DecimalMath.add(monthlyTrends[mIndex].expense, tx.amount);
      }
      monthlyTrends[mIndex].savings = DecimalMath.subtract(
        monthlyTrends[mIndex].income,
        monthlyTrends[mIndex].expense
      );
    });

    // Collect historical totals for months prior to targetMonth
    for (let i = targetMonth - 2; i >= 0 && i >= targetMonth - 4; i--) {
      historicalExpenseTotals.push(monthlyTrends[i].expense);
    }

    // 3. Spending Prediction
    const currentMonthExpenseList = monthlyTxs
      .filter((t) => t.type === 'EXPENSE')
      .map((t) => ({ amount: t.amount, date: t.date }));

    const prediction = ForecastingService.predictMonthlySpending(
      currentMonthExpenseList,
      historicalExpenseTotals,
      new Date(year, targetMonth - 1, Math.min(new Date().getDate(), daysInMonth))
    );

    // 4. Personalized Insights
    const insights = await this.generateInsights(userId);

    return {
      period: { year, month: targetMonth },
      dailyData,
      categoryBreakdown: Object.values(categoryBreakdownMap).sort((a, b) => b.amount - a.amount),
      monthlyTrends,
      prediction,
      insights,
    };
  }
}
