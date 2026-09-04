import { SavingsRepository } from '../repositories/savingsRepository';
import { DecimalMath } from '../utils/decimalMath';

export class SavingsService {
  static async getSavingsGoals(userId: string) {
    const goals = await SavingsRepository.findByUserId(userId);
    return goals.map((g) => {
      const remaining = Math.max(0, DecimalMath.subtract(g.targetAmount, g.currentAmount));
      const progressPercent = g.targetAmount > 0
        ? DecimalMath.percentage(g.currentAmount, g.targetAmount)
        : 0;

      return {
        ...g,
        remaining: DecimalMath.round(remaining),
        progressPercent: Math.min(100, progressPercent),
        actualPercent: progressPercent,
      };
    });
  }

  static async getGoalById(id: string, userId: string) {
    const goal = await SavingsRepository.findById(id, userId);
    if (!goal) throw new Error('Savings goal not found');
    return goal;
  }

  static async createGoal(data: {
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string | Date;
    category?: string;
    color?: string;
  }) {
    const targetDate = data.targetDate ? new Date(data.targetDate) : null;
    return SavingsRepository.create({
      ...data,
      targetDate,
    });
  }

  static async updateGoal(
    id: string,
    userId: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      targetDate?: string | Date | null;
      category?: string;
      color?: string;
      status?: string;
    }
  ) {
    const existing = await SavingsRepository.findById(id, userId);
    if (!existing) throw new Error('Savings goal not found');

    const updateData: any = { ...data };
    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }

    await SavingsRepository.update(id, userId, updateData);
    return SavingsRepository.findById(id, userId);
  }

  static async addContribution(id: string, userId: string, amount: number) {
    if (amount <= 0) throw new Error('Contribution amount must be greater than zero');
    const updated = await SavingsRepository.addFunds(id, userId, amount);
    if (!updated) throw new Error('Savings goal not found');
    return updated;
  }

  static async deleteGoal(id: string, userId: string) {
    const existing = await SavingsRepository.findById(id, userId);
    if (!existing) throw new Error('Savings goal not found');
    return SavingsRepository.delete(id, userId);
  }
}
