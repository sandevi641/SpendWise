import React, { useState, useEffect } from 'react';
import { savingsService } from '../../services/savingsService';
import { SavingsGoal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { SavingsGoalModal } from '../../components/savings/SavingsGoalModal';
import { ContributeModal } from '../../components/savings/ContributeModal';
import {
  Target,
  PlusCircle,
  PiggyBank,
  CheckCircle2,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const SavingsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await savingsService.getGoals();
      setGoals(data);
    } catch (e) {
      console.error('Failed to load savings goals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await savingsService.deleteGoal(id);
      fetchGoals();
    } catch (e) {
      alert('Failed to delete savings goal');
    }
  };

  const cur = user?.currency || 'USD';
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedCount = goals.filter((g) => g.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-espresso-900 tracking-tight">
            Savings Goals & Targets
          </h1>
          <p className="text-xs text-espresso-400 mt-0.5">
            Turn your financial dreams and university milestones into achievable targets
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="btn-primary text-xs"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
          Create New Goal
        </button>
      </div>

      {/* Aggregate Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-soft-sm">
          <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider">
            Total Accumulated Savings
          </span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {formatCurrency(totalSaved, cur)}
          </h3>
          <p className="text-xs text-espresso-400 mt-1">Across all active milestone vaults</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-soft-sm">
          <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider">
            Aggregate Milestone Target
          </span>
          <h3 className="text-2xl font-extrabold text-espresso-900 mt-1 font-mono">
            {formatCurrency(totalTarget, cur)}
          </h3>
          <p className="text-xs text-espresso-400 mt-1">
            {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% overall funded` : '0% funded'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-soft-sm">
          <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider">
            Completed Milestones
          </span>
          <h3 className="text-2xl font-extrabold text-copper mt-1 font-mono flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-amber-500" />
            {completedCount} / {goals.length} Goals
          </h3>
          <p className="text-xs text-espresso-400 mt-1">100% Target Reached</p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-espresso-400">
            <div className="w-6 h-6 border-2 border-copper border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading savings targets...
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-3 py-16 bg-white rounded-2xl border border-brand-100 text-center text-espresso-400 p-8 shadow-soft-sm">
            <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-30 text-copper" />
            <h4 className="text-sm font-bold text-espresso-800">No Savings Goals Defined</h4>
            <p className="text-xs text-espresso-400 mt-1 max-w-sm mx-auto">
              Create a dedicated savings target for your emergency fund, study equipment, or travel.
            </p>
            <button
              onClick={() => {
                setSelectedGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="btn-primary text-xs mt-4"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Set First Savings Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const isCompleted = goal.status === 'COMPLETED' || goal.currentAmount >= goal.targetAmount;
            return (
              <div
                key={goal.id}
                className="p-6 bg-white rounded-2xl border border-brand-100 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-beige-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-espresso-900">{goal.name}</span>
                      </div>
                      <span className="inline-block text-[10px] font-bold text-espresso-400 bg-beige-100 px-2 py-0.5 rounded-md mt-1">
                        {goal.category || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="p-1.5 text-espresso-400 hover:text-copper hover:bg-beige-100 rounded-lg"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 text-espresso-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="text-espresso-400 block font-medium">Saved so far</span>
                        <span className="text-base font-bold font-mono text-emerald-600">
                          {formatCurrency(goal.currentAmount, cur)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-espresso-400 block font-medium">Target</span>
                        <span className="text-base font-bold font-mono text-espresso-900">
                          {formatCurrency(goal.targetAmount, cur)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-beige-100 rounded-full overflow-hidden p-0.5 border border-brand-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-copper to-brand-600'
                        }`}
                        style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-bold text-copper font-mono">
                        {goal.progressPercent}% funded
                      </span>
                      {goal.targetDate && (
                        <span className="text-[11px] text-espresso-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-beige-100">
                  {isCompleted ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Milestone Accomplished!
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsContributeModalOpen(true);
                      }}
                      className="w-full btn-secondary text-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-copper" />
                      Deposit Funds
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Goal Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoal(null);
        }}
        onSuccess={fetchGoals}
        goalToEdit={selectedGoal}
      />

      {/* Contribute Funds Modal */}
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => {
          setIsContributeModalOpen(false);
          setSelectedGoal(null);
        }}
        onSuccess={fetchGoals}
        goal={selectedGoal}
      />
    </div>
  );
};
