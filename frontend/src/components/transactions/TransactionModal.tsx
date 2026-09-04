import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Transaction, Account, Category } from '../../types';
import { transactionService } from '../../services/transactionService';
import { Sparkles } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<Transaction>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
  accounts,
  categories,
  initialData,
}) => {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('CARD');
  const [tags, setTags] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  const [suggestedCategoryName, setSuggestedCategoryName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setAccountId(transactionToEdit.accountId);
      setCategoryId(transactionToEdit.categoryId);
      setDate(transactionToEdit.date.split('T')[0]);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setTags(transactionToEdit.tags || '');
      setIsRecurring(transactionToEdit.isRecurring || false);
      setSuggestedCategoryName(null);
    } else if (initialData) {
      if (initialData.type) setType(initialData.type);
      if (initialData.amount) setAmount(initialData.amount.toString());
      if (initialData.description) setDescription(initialData.description);
      if (initialData.date) setDate(initialData.date.split('T')[0]);
      if (initialData.accountId) setAccountId(initialData.accountId);
      if (initialData.categoryId) setCategoryId(initialData.categoryId);
      if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
    } else {
      // Default state
      setType('EXPENSE');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('CARD');
      setTags('');
      setIsRecurring(false);
      setSuggestedCategoryName(null);
      if (accounts.length > 0) {
        const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
        setAccountId(defaultAcc.id);
      }
      if (categories.length > 0) {
        const defaultCat = categories.find((c) => c.type === 'EXPENSE') || categories[0];
        setCategoryId(defaultCat.id);
      }
    }
    setError(null);
  }, [transactionToEdit, initialData, isOpen, accounts, categories]);

  // Live Automatic Rule-based categorization suggestion
  const handleDescriptionChange = async (val: string) => {
    setDescription(val);
    if (val.trim().length > 2 && !transactionToEdit) {
      try {
        const suggestion = await transactionService.suggestCategory(val, type);
        if (suggestion && suggestion.confidence >= 0.7) {
          const matched = categories.find(
            (c) => c.name.toLowerCase() === suggestion.categoryName.toLowerCase() && c.type === type
          );
          if (matched) {
            setSuggestedCategoryName(matched.name);
            setCategoryId(matched.id);
          }
        }
      } catch (err) {
        // quiet failure
      }
    }
  };

  const handleTypeChange = (newType: 'INCOME' | 'EXPENSE') => {
    setType(newType);
    setSuggestedCategoryName(null);
    const firstMatchingCat = categories.find((c) => c.type === newType);
    if (firstMatchingCat) {
      setCategoryId(firstMatchingCat.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);
      if (transactionToEdit) {
        await transactionService.updateTransaction(transactionToEdit.id, {
          accountId,
          categoryId,
          amount: parsedAmount,
          type,
          description: description.trim(),
          date,
          paymentMethod,
          tags,
          isRecurring,
        });
      } else {
        await transactionService.createTransaction({
          accountId,
          categoryId,
          amount: parsedAmount,
          type,
          description: description.trim(),
          date,
          paymentMethod,
          tags,
          isRecurring,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
      subtitle="Track your daily income or expense accurately"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Transaction Type Segmented Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-beige-100 rounded-xl border border-brand-200">
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-soft-sm'
                : 'text-espresso-600 hover:text-espresso-900'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-soft-sm'
                : 'text-espresso-600 hover:text-espresso-900'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-espresso-700 mb-1">
            Amount ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-lg font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
          />
        </div>

        {/* Description with Auto Categorization feedback */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-espresso-700">
              Description <span className="text-red-500">*</span>
            </label>
            {suggestedCategoryName && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-copper bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 animate-in fade-in">
                <Sparkles className="w-3 h-3 text-copper" />
                <span>Auto-categorized as {suggestedCategoryName}</span>
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="e.g. Uber to University, Whole Foods Groceries, Client Milestone"
            className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
          />
        </div>

        {/* Category & Account selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${acc.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="CARD">Debit / Credit Card</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="ONLINE">Online / PayPal</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-beige-200">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-xs">
            {isSubmitting ? 'Saving...' : transactionToEdit ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
