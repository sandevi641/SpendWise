import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types';
import { savingsService } from '../../services/savingsService';
import { PlusCircle } from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: SavingsGoal | null;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goal,
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const deposit = parseFloat(amount);
    if (isNaN(deposit) || deposit <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await savingsService.addFunds(goal.id, deposit);
      onSuccess();
      onClose();
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Contribution failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Funds to Goal"
      subtitle={`Depositing into "${goal.name}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="p-4 bg-beige-100 rounded-xl border border-brand-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-espresso-400 block font-medium">Current Balance</span>
            <span className="font-bold text-espresso-900">${goal.currentAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-espresso-400 block font-medium">Remaining to Target</span>
            <span className="font-bold text-copper">${remaining.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-espresso-700 mb-1">
            Deposit Amount ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-lg font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-beige-200">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-xs">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Depositing...' : 'Confirm Deposit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
