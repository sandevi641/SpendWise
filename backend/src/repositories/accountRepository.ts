import { prisma } from '../config/database';

export class AccountRepository {
  static async findByUserId(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.account.findFirst({
      where: { id, userId },
    });
  }

  static async create(data: {
    userId: string;
    name: string;
    type?: string;
    balance?: number;
    color?: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }

    return prisma.account.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type || 'CHECKING',
        balance: data.balance ?? 0,
        color: data.color || '#C27B38',
        isDefault: data.isDefault || false,
      },
    });
  }

  static async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      type?: string;
      balance?: number;
      color?: string;
      isDefault?: boolean;
    }
  ) {
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: { userId, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return prisma.account.updateMany({
      where: { id, userId },
      data,
    });
  }

  static async adjustBalance(id: string, userId: string, delta: number) {
    return prisma.account.update({
      where: { id },
      data: {
        balance: {
          increment: delta,
        },
      },
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.account.deleteMany({
      where: { id, userId },
    });
  }
}
