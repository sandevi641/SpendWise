import { ForecastingService } from '../../src/services/forecastingService';

describe('ForecastingService - Predictive Spending Model', () => {
  it('should extrapolate current month spending based on daily burn rate', () => {
    // 15 days elapsed with $1500 spend ($100/day) in a 30-day month
    const mockExpenses = [
      { amount: 500, date: new Date(2026, 3, 5) },
      { amount: 1000, date: new Date(2026, 3, 15) },
    ];
    const historicalTotals = [3000, 3100, 2900];
    const targetDate = new Date(2026, 3, 15); // April 15 (30 days total)

    const prediction = ForecastingService.predictMonthlySpending(
      mockExpenses,
      historicalTotals,
      targetDate
    );

    expect(prediction.currentSpend).toBe(1500);
    expect(prediction.dailyAverage).toBe(100);
    expect(prediction.remainingDays).toBe(15);
    expect(prediction.estimatedMonthEndSpend).toBe(3000); // 1500 + 15 * 100
    expect(prediction.confidenceScore).toBeGreaterThan(70);
  });

  it('should determine increasing trend when projection exceeds past month significantly', () => {
    const mockExpenses = [{ amount: 4000, date: new Date(2026, 3, 10) }];
    const historicalTotals = [2000]; // Last month was 2000, this month projected ~12000
    const targetDate = new Date(2026, 3, 10);

    const prediction = ForecastingService.predictMonthlySpending(
      mockExpenses,
      historicalTotals,
      targetDate
    );

    expect(prediction.trend).toBe('INCREASING');
  });
});
