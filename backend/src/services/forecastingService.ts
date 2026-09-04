import { DecimalMath } from '../utils/decimalMath';
import { SpendingPrediction } from '../types';

export class ForecastingService {
  /**
   * Generates an explainable monthly spending forecast based on actual transaction history.
   * @param currentMonthExpenses Array of expenses for the active month
   * @param historicalMonthlyTotals Array of total expenses for the last 3-6 previous months
   */
  static predictMonthlySpending(
    currentMonthExpenses: Array<{ amount: number; date: Date }>,
    historicalMonthlyTotals: number[],
    targetDate = new Date()
  ): SpendingPrediction {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth(); // 0-indexed
    const dayOfMonth = targetDate.getDate();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const remainingDays = Math.max(0, totalDaysInMonth - dayOfMonth);

    // Sum current month spending safely
    const currentSpend = currentMonthExpenses.reduce(
      (sum, item) => DecimalMath.add(sum, item.amount),
      0
    );

    // Daily average so far
    const daysElapsed = Math.max(1, dayOfMonth);
    const dailyAverage = DecimalMath.divide(currentSpend, daysElapsed);

    // Estimated month end spending = current spend + (daily average * remaining days)
    const projectedRemaining = DecimalMath.multiply(dailyAverage, remainingDays);
    const estimatedMonthEndSpend = DecimalMath.round(DecimalMath.add(currentSpend, projectedRemaining));

    // Next month projection using weighted moving average if historical data exists
    let projectedNextMonthSpend = estimatedMonthEndSpend;
    let confidenceScore = 65; // Base confidence

    if (historicalMonthlyTotals.length > 0) {
      // Give 50% weight to current month estimate, 30% to last month, 20% to older months average
      const lastMonth = historicalMonthlyTotals[0] || estimatedMonthEndSpend;
      const olderAvg =
        historicalMonthlyTotals.length > 1
          ? historicalMonthlyTotals.slice(1).reduce((a, b) => a + b, 0) /
            (historicalMonthlyTotals.length - 1)
          : lastMonth;

      const weightedForecast =
        estimatedMonthEndSpend * 0.5 + lastMonth * 0.3 + olderAvg * 0.2;
      projectedNextMonthSpend = DecimalMath.round(weightedForecast);

      // Increase confidence based on sample size and consistency
      confidenceScore = Math.min(95, 70 + historicalMonthlyTotals.length * 5);
    } else {
      // Limited historical data
      confidenceScore = dayOfMonth > 15 ? 75 : 55;
    }

    // Determine trend
    let trend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
    if (historicalMonthlyTotals.length > 0) {
      const prevMonth = historicalMonthlyTotals[0];
      const diffPct = DecimalMath.percentage(
        Math.abs(estimatedMonthEndSpend - prevMonth),
        prevMonth || 1
      );
      if (diffPct > 8) {
        trend = estimatedMonthEndSpend > prevMonth ? 'INCREASING' : 'DECREASING';
      }
    }

    return {
      currentSpend: DecimalMath.round(currentSpend),
      estimatedMonthEndSpend,
      dailyAverage: DecimalMath.round(dailyAverage),
      remainingDays,
      projectedNextMonthSpend,
      confidenceScore,
      trend,
    };
  }
}
