import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Category, Budget } from '../../types';
import { budgetService } from '../../services/budgetService';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  currentMonth: number;
  currentYear: number;
  existingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  currentMonth,
  currentYear,
  existingBudget,
}) => {
  const [categoryId, setCategoryId] = useState<string>(existingBudget?.categoryId || '');
  const [allocatedAmount, setAllocatedAmount] = useState<string>(
    existingBudget ? existingBudget.allocatedAmount.toString() : ''
  );
  const [alertThreshold, setAlertThreshold] = useState<string>(
    existingBudget ? existingBudget.alertThreshold.toString() : '80'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(allocatedAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter an allocated budget amount greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetService.setBudget({
        categoryId: categoryId === '' ? null : categoryId,
        month: currentMonth,
        year: currentYear,
        allocatedAmount: amount,
        alertThreshold: parseFloat(alertThreshold) || 80,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingBudget ? 'Edit Budget' : 'Configure Budget'}
      subtitle={`Set spending caps for ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-espresso-700 mb-1">
            Budget Scope
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
          >
            <option value="">Overall Monthly Budget (All Expenses)</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                Category: {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-espresso-700 mb-1">
            Allocated Limit Amount ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={allocatedAmount}
            onChange={(e) => setAllocatedAmount(e.target.value)}
            placeholder="e.g. 500.00"
            className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-sm font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-espresso-700">
              Early Warning Alert Threshold: <span className="text-copper">{alertThreshold}%</span>
            </label>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="w-full accent-copper cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-espresso-400 mt-1">
            <span>50% (Conservative)</span>
            <span>80% (Standard)</span>
            <span>100% (Strict)</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-beige-200">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-xs">
            {isSubmitting ? 'Saving...' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
