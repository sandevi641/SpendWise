import React, { useState, useEffect } from 'react';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/accountService';
import { Budget, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { BudgetModal } from '../../components/budgets/BudgetModal';
import {
  PieChart,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  ShieldAlert,
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetService.getBudgets(month, year);
      setBudgets(res.budgets);
      setTotalAllocated(res.totalAllocated);
      setTotalSpent(res.totalSpent);
    } catch (e) {
      console.error('Failed to load budgets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadCategories() {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await budgetService.deleteBudget(id);
      fetchBudgets();
      window.dispatchEvent(new Event('transaction-updated'));
    } catch (e) {
      alert('Failed to delete budget');
    }
  };

  const cur = user?.currency || 'USD';
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-espresso-900 tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs text-espresso-400 mt-0.5">
            Plan, monitor, and enforce monthly category spending limits
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month Selector */}
          <div className="flex items-center bg-white border border-brand-200 rounded-xl px-2 py-1 shadow-soft-sm text-xs font-bold text-espresso-800">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-beige-100 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-copper mr-1.5" />
              {monthName}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-beige-100 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Set Budget Limit
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-soft-sm">
          <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider">
            Total Allocated Budget
          </span>
          <h3 className="text-2xl font-extrabold text-espresso-900 mt-1 font-mono">
            {formatCurrency(totalAllocated, cur)}
          </h3>
          <p className="text-xs text-espresso-400 mt-1">{budgets.length} active budget targets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-soft-sm">
          <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider">
            Total Monthly Spend
          </span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            {formatCurrency(totalSpent, cur)}
          </h3>
          <p className="text-xs text-espresso-400 mt-1">
            {totalAllocated > 0
              ? `${Math.round((totalSpent / totalAllocated) * 100)}% of total allocation consumed`
              : 'No master allocation set'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-soft-sm">
          <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider">
            Safe Remaining Capacity
          </span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {formatCurrency(Math.max(0, totalAllocated - totalSpent), cur)}
          </h3>
          <p className="text-xs text-espresso-400 mt-1">Available for remaining month</p>
        </div>
      </div>

      {/* Budget Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-espresso-400">
            <div className="w-6 h-6 border-2 border-copper border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading budgets for {monthName}...
          </div>
        ) : budgets.length === 0 ? (
          <div className="col-span-2 py-16 bg-white rounded-2xl border border-brand-100 text-center text-espresso-400 p-8 shadow-soft-sm">
            <PieChart className="w-10 h-10 mx-auto mb-2 opacity-30 text-copper" />
            <h4 className="text-sm font-bold text-espresso-800">No Budgets Configured for {monthName}</h4>
            <p className="text-xs text-espresso-400 mt-1 max-w-sm mx-auto">
              Setting category budgets helps you curb impulse spending and automatically sends threshold warnings.
            </p>
            <button
              onClick={() => {
                setSelectedBudget(null);
                setIsModalOpen(true);
              }}
              className="btn-primary text-xs mt-4"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Configure First Budget
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const isOverall = !b.categoryId;
            return (
              <div
                key={b.id}
                className={`p-6 rounded-2xl border shadow-soft-sm transition-all bg-white ${
                  b.isExceeded
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : b.isWarning
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-brand-100 hover:shadow-soft-md'
                }`}
              >
                <div className="flex items-start justify-between pb-3 border-b border-beige-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-espresso-900">
                        {isOverall ? 'Master Monthly Budget' : b.category?.name || 'Category'}
                      </span>
                      {b.isExceeded ? (
                        <span className="badge bg-rose-100 text-rose-800 border-rose-200">
                          Exceeded
                        </span>
                      ) : b.isWarning ? (
                        <span className="badge bg-amber-100 text-amber-800 border-amber-200">
                          Near Limit
                        </span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">
                          On Track
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-espresso-400 mt-0.5 font-mono">
                      Alert Trigger: {b.alertThreshold}%
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedBudget(b);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-espresso-400 hover:text-copper hover:bg-beige-100 rounded-lg"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      className="p-1.5 text-espresso-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="text-espresso-400 block font-medium">Spent so far</span>
                      <span className="text-base font-bold font-mono text-espresso-900">
                        {formatCurrency(b.spent, cur)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-espresso-400 block font-medium">Allocated Cap</span>
                      <span className="text-base font-bold font-mono text-espresso-900">
                        {formatCurrency(b.allocatedAmount, cur)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-beige-100 rounded-full overflow-hidden p-0.5 border border-brand-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.isExceeded
                          ? 'bg-rose-600'
                          : b.isWarning
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-copper to-brand-600'
                      }`}
                      style={{ width: `${b.percentageUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-espresso-500 font-medium">
                      {b.actualPercentage.toFixed(1)}% utilized
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        b.isExceeded ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {b.isExceeded
                        ? `Over by ${formatCurrency(b.spent - b.allocatedAmount, cur)}`
                        : `${formatCurrency(b.remaining, cur)} remaining`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={() => {
          fetchBudgets();
          window.dispatchEvent(new Event('transaction-updated'));
        }}
        categories={categories}
        currentMonth={month}
        currentYear={year}
        existingBudget={selectedBudget}
      />
    </div>
  );
};
