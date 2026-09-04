import { prisma } from '../config/database';

export class BudgetRepository {
  static async findByUserAndPeriod(userId: string, month: number, year: number) {
    return prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      include: {
        category: true,
      },
      orderBy: { allocatedAmount: 'desc' },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  static async upsert(data: {
    userId: string;
    categoryId: string | null;
    month: number;
    year: number;
    allocatedAmount: number;
    alertThreshold?: number;
  }) {
    const existing = await prisma.budget.findFirst({
      where: {
        userId: data.userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    });

    if (existing) {
      return prisma.budget.update({
        where: { id: existing.id },
        data: {
          allocatedAmount: data.allocatedAmount,
          alertThreshold: data.alertThreshold ?? existing.alertThreshold,
        },
        include: { category: true },
      });
    }

    return prisma.budget.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
        allocatedAmount: data.allocatedAmount,
        alertThreshold: data.alertThreshold ?? 80.0,
      },
      include: { category: true },
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.budget.deleteMany({
      where: { id, userId },
    });
  }
}
