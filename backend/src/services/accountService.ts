import { AccountRepository } from '../repositories/accountRepository';

export class AccountService {
  static async getUserAccounts(userId: string) {
    return AccountRepository.findByUserId(userId);
  }

  static async getAccountById(id: string, userId: string) {
    const account = await AccountRepository.findById(id, userId);
    if (!account) throw new Error('Account not found');
    return account;
  }

  static async createAccount(data: {
    userId: string;
    name: string;
    type?: string;
    balance?: number;
    color?: string;
    isDefault?: boolean;
  }) {
    return AccountRepository.create(data);
  }

  static async updateAccount(
    id: string,
    userId: string,
    data: { name?: string; type?: string; balance?: number; color?: string; isDefault?: boolean }
  ) {
    const existing = await AccountRepository.findById(id, userId);
    if (!existing) throw new Error('Account not found');
    await AccountRepository.update(id, userId, data);
    return AccountRepository.findById(id, userId);
  }

  static async deleteAccount(id: string, userId: string) {
    const existing = await AccountRepository.findById(id, userId);
    if (!existing) throw new Error('Account not found');
    return AccountRepository.delete(id, userId);
  }
}
