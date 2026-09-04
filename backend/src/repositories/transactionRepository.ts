import { prisma } from '../config/database';
import { DateFilterQuery } from '../types';

export class TransactionRepository {
  static async findMany(userId: string, filters: DateFilterQuery) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    } else if (filters.month && filters.year) {
      const startOfMonth = new Date(filters.year, filters.month - 1, 1);
      const endOfMonth = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    if (filters.search) {
      where.description = {
        contains: filters.search,
      };
    }

    const page = filters.page ? Math.max(1, filters.page) : 1;
    const limit = filters.limit ? Math.max(1, filters.limit) : 20;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: {
            select: { id: true, name: true, type: true, color: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        account: true,
      },
    });
  }

  static async create(data: {
    userId: string;
    accountId: string;
    categoryId: string;
    amount: number;
    type: string;
    date: Date;
    description: string;
    paymentMethod?: string;
    receiptUrl?: string;
    tags?: string;
    isRecurring?: boolean;
  }) {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        date: data.date,
        description: data.description,
        paymentMethod: data.paymentMethod || 'CARD',
        receiptUrl: data.receiptUrl,
        tags: data.tags,
        isRecurring: data.isRecurring || false,
      },
      include: {
        category: true,
        account: true,
      },
    });
  }

  static async update(
    id: string,
    userId: string,
    data: {
      accountId?: string;
      categoryId?: string;
      amount?: number;
      type?: string;
      date?: Date;
      description?: string;
      paymentMethod?: string;
      receiptUrl?: string;
      tags?: string;
      isRecurring?: boolean;
    }
  ) {
    return prisma.transaction.updateMany({
      where: { id, userId },
      data,
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.transaction.deleteMany({
      where: { id, userId },
    });
  }

  static async aggregateTotals(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        type: true,
        categoryId: true,
        date: true,
        category: {
          select: { name: true, color: true, icon: true },
        },
      },
    });

    return transactions;
  }
}
