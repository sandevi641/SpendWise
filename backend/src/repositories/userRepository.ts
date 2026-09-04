import { prisma } from '../config/database';

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currency: true,
        monthlyIncomeGoal: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        currency: data.currency || 'USD',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currency: true,
        monthlyIncomeGoal: true,
        createdAt: true,
      },
    });
  }

  static async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      currency?: string;
      monthlyIncomeGoal?: number;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currency: true,
        monthlyIncomeGoal: true,
        updatedAt: true,
      },
    });
  }

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
