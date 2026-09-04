import { prisma } from '../config/database';

export class SavingsRepository {
  static async findByUserId(userId: string) {
    return prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
  }

  static async create(data: {
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: Date | null;
    category?: string;
    color?: string;
  }) {
    return prisma.savingsGoal.create({
      data: {
        userId: data.userId,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount ?? 0,
        targetDate: data.targetDate,
        category: data.category || 'General',
        color: data.color || '#D97706',
        status: (data.currentAmount ?? 0) >= data.targetAmount ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });
  }

  static async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      targetDate?: Date | null;
      category?: string;
      color?: string;
      status?: string;
    }
  ) {
    let status = data.status;
    if (!status && data.targetAmount !== undefined && data.currentAmount !== undefined) {
      status = data.currentAmount >= data.targetAmount ? 'COMPLETED' : 'IN_PROGRESS';
    }

    return prisma.savingsGoal.updateMany({
      where: { id, userId },
      data: {
        ...data,
        ...(status ? { status } : {}),
      },
    });
  }

  static async addFunds(id: string, userId: string, amountToAdd: number) {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
    if (!goal) return null;

    const newAmount = goal.currentAmount + amountToAdd;
    const newStatus = newAmount >= goal.targetAmount ? 'COMPLETED' : 'IN_PROGRESS';

    return prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        status: newStatus,
      },
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.savingsGoal.deleteMany({
      where: { id, userId },
    });
  }
}
