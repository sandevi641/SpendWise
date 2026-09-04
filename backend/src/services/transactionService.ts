import { TransactionRepository } from '../repositories/transactionRepository';
import { AccountRepository } from '../repositories/accountRepository';
import { CategorizationService } from './categorizationService';
import { DecimalMath } from '../utils/decimalMath';
import { DateFilterQuery } from '../types';

export class TransactionService {
  static async getTransactions(userId: string, filters: DateFilterQuery) {
    return TransactionRepository.findMany(userId, filters);
  }

  static async getTransactionById(id: string, userId: string) {
    const tx = await TransactionRepository.findById(id, userId);
    if (!tx) throw new Error('Transaction not found');
    return tx;
  }

  static async createTransaction(data: {
    userId: string;
    accountId: string;
    categoryId: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date?: string | Date;
    description: string;
    paymentMethod?: string;
    receiptUrl?: string;
    tags?: string;
    isRecurring?: boolean;
  }) {
    const account = await AccountRepository.findById(data.accountId, data.userId);
    if (!account) throw new Error('Selected account does not exist or does not belong to you');

    const txDate = data.date ? new Date(data.date) : new Date();

    const transaction = await TransactionRepository.create({
      ...data,
      date: txDate,
    });

    // Adjust account balance atomically
    const balanceDelta = data.type === 'INCOME' ? data.amount : -data.amount;
    await AccountRepository.adjustBalance(data.accountId, data.userId, balanceDelta);

    return transaction;
  }

  static async updateTransaction(
    id: string,
    userId: string,
    data: {
      accountId?: string;
      categoryId?: string;
      amount?: number;
      type?: 'INCOME' | 'EXPENSE';
      date?: string | Date;
      description?: string;
      paymentMethod?: string;
      receiptUrl?: string;
      tags?: string;
      isRecurring?: boolean;
    }
  ) {
    const existing = await TransactionRepository.findById(id, userId);
    if (!existing) throw new Error('Transaction not found');

    // If amount, type, or account changed, reverse old balance and apply new
    const targetAccountId = data.accountId || existing.accountId;
    const targetType = data.type || (existing.type as 'INCOME' | 'EXPENSE');
    const targetAmount = data.amount !== undefined ? data.amount : existing.amount;

    if (
      existing.accountId !== targetAccountId ||
      existing.type !== targetType ||
      existing.amount !== targetAmount
    ) {
      // Revert previous transaction impact
      const oldRevertDelta = existing.type === 'INCOME' ? -existing.amount : existing.amount;
      await AccountRepository.adjustBalance(existing.accountId, userId, oldRevertDelta);

      // Apply new transaction impact
      const newDelta = targetType === 'INCOME' ? targetAmount : -targetAmount;
      await AccountRepository.adjustBalance(targetAccountId, userId, newDelta);
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    await TransactionRepository.update(id, userId, updateData);
    return TransactionRepository.findById(id, userId);
  }

  static async deleteTransaction(id: string, userId: string) {
    const existing = await TransactionRepository.findById(id, userId);
    if (!existing) throw new Error('Transaction not found');

    // Revert account balance
    const revertDelta = existing.type === 'INCOME' ? -existing.amount : existing.amount;
    await AccountRepository.adjustBalance(existing.accountId, userId, revertDelta);

    await TransactionRepository.delete(id, userId);
    return { success: true, message: 'Transaction deleted successfully' };
  }

  static suggestCategoryForDescription(description: string, type?: 'INCOME' | 'EXPENSE') {
    return CategorizationService.suggestCategory(description, type);
  }
}
