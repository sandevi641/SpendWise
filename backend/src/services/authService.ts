import { UserRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/token';
import { prisma } from '../config/database';
import { seedUserData } from '../utils/seedDefaults';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email address is already registered');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      currency: data.currency || 'USD',
    });

    // Seed default accounts and categories for new user
    await seedUserData(prisma, user.id);

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await UserRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currency: user.currency,
      monthlyIncomeGoal: user.monthlyIncomeGoal,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }

  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; currency?: string; monthlyIncomeGoal?: number }
  ) {
    return UserRepository.update(userId, data);
  }

  static async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await comparePassword(oldPass, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const newHash = await hashPassword(newPass);
    await UserRepository.updatePassword(userId, newHash);
    return { success: true };
  }
}
