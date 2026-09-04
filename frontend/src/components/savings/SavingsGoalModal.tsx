import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types';
import { savingsService } from '../../services/savingsService';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalToEdit?: SavingsGoal | null;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goalToEdit,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#D97706');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetDate(goalToEdit.targetDate ? goalToEdit.targetDate.split('T')[0] : '');
      setCategory(goalToEdit.category || 'General');
      setColor(goalToEdit.color || '#D97706');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setCategory('General');
      setColor('#D97706');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please enter a target goal amount greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      if (goalToEdit) {
        await savingsService.updateGoal(goalToEdit.id, {
          name: name.trim(),
          targetAmount: target,
          currentAmount: parseFloat(currentAmount) || 0,
          targetDate: targetDate || null,
          category,
          color,
        });
      } else {
        await savingsService.createGoal({
          name: name.trim(),
          targetAmount: target,
          currentAmount: parseFloat(currentAmount) || 0,
          targetDate: targetDate || null,
          category,
          color,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle="Define a milestone and track your funding progress"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-espresso-700 mb-1">
            Goal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund, Laptop for College, Summer Trip"
            className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">
              Target Amount ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-sm font-bold text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">
              Initial Deposit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="Safety Net">Safety Net / Emergency</option>
              <option value="Education">Education & University</option>
              <option value="Tech & Gadgets">Tech & Gadgets</option>
              <option value="Travel">Travel & Vacation</option>
              <option value="Investment">Investment</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-beige-200">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-xs">
            {isSubmitting ? 'Saving...' : goalToEdit ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
