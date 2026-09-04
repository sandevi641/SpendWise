import { prisma } from '../config/database';

export class CategoryRepository {
  static async findByUserId(userId: string) {
    return prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
    });
  }

  static async create(data: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
    color?: string;
    budgetLimit?: number;
  }) {
    return prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon || 'Tag',
        color: data.color || '#8B5E3C',
        budgetLimit: data.budgetLimit ?? 0,
      },
    });
  }

  static async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      type?: string;
      icon?: string;
      color?: string;
      budgetLimit?: number;
    }
  ) {
    return prisma.category.updateMany({
      where: { id, userId },
      data,
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.category.deleteMany({
      where: { id, userId },
    });
  }
}
