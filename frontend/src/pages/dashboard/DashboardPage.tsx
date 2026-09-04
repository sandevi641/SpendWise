import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { DashboardSummary } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  ChevronRight,
  Target,
  PieChart as PieChartIcon,
  Sparkles,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await analyticsService.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleUpdate = () => fetchDashboard();
    window.addEventListener('transaction-updated', handleUpdate);
    return () => window.removeEventListener('transaction-updated', handleUpdate);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-copper border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-espresso-400">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-red-800">Unable to load dashboard</h3>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button onClick={fetchDashboard} className="btn-secondary text-xs mt-3">
          Try Again
        </button>
      </div>
    );
  }

  const cur = user?.currency || 'USD';
  const categoryChartData = data?.spendingByCategory?.map((c) => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Balance"
          value={formatCurrency(data?.totalBalance, cur)}
          subtitle="Across all configured accounts"
          icon={Wallet}
          variant="copper"
        />

        <StatCard
          title="Monthly Income"
          value={`+${formatCurrency(data?.currentMonth.income, cur)}`}
          subtitle="Current calendar month"
          icon={TrendingUp}
          variant="emerald"
          trend={
            data?.currentMonth.incomeDeltaPercent !== undefined && data?.currentMonth.incomeDeltaPercent !== 0
              ? {
                  value: `${data.currentMonth.incomeDeltaPercent > 0 ? '+' : ''}${data.currentMonth.incomeDeltaPercent}%`,
                  isPositive: data.currentMonth.incomeDeltaPercent >= 0,
                  label: 'vs last month',
                }
              : undefined
          }
        />

        <StatCard
          title="Monthly Expenses"
          value={`-${formatCurrency(data?.currentMonth.expenses, cur)}`}
          subtitle="Current calendar month"
          icon={TrendingDown}
          variant="rose"
          trend={
            data?.currentMonth.expenseDeltaPercent !== undefined && data?.currentMonth.expenseDeltaPercent !== 0
              ? {
                  value: `${data.currentMonth.expenseDeltaPercent > 0 ? '+' : ''}${data.currentMonth.expenseDeltaPercent}%`,
                  isPositive: data.currentMonth.expenseDeltaPercent <= 0,
                  label: 'vs last month',
                }
              : undefined
          }
        />

        <StatCard
          title="Savings Rate"
          value={`${data?.currentMonth.savingsRate || 0}%`}
          subtitle={`Net Surplus: ${formatCurrency(data?.currentMonth.netCashFlow, cur)}`}
          icon={PiggyBank}
          variant="default"
        />
      </div>

      {/* Middle Row: Budget Health & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress Box */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div>
                <h3 className="text-sm font-bold text-espresso-900">Monthly Budget Burn</h3>
                <p className="text-[11px] text-espresso-400">Spending against monthly limit</p>
              </div>
              <Link to="/budgets" className="text-xs font-bold text-copper hover:underline flex items-center">
                Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-espresso-800 mb-1.5">
                  <span>Used: {formatCurrency(data?.budgetSummary.totalSpent, cur)}</span>
                  <span>Limit: {formatCurrency(data?.budgetSummary.totalAllocated, cur)}</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-beige-100 rounded-full overflow-hidden p-0.5 border border-brand-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      data?.budgetSummary.isExceeded
                        ? 'bg-rose-600'
                        : (data?.budgetSummary.percentageUsed || 0) >= 80
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-copper to-brand-600'
                    }`}
                    style={{ width: `${Math.min(100, data?.budgetSummary.percentageUsed || 0)}%` }}
                  />
                </div>
              </div>

              {data?.budgetSummary.isExceeded ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>
                    Monthly budget limit exceeded by {formatCurrency((data.budgetSummary.totalSpent - data.budgetSummary.totalAllocated), cur)}.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-beige-50 rounded-xl border border-brand-100 flex justify-between text-xs text-espresso-700">
                  <span>Remaining safe spend:</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(data?.budgetSummary.remaining, cur)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Active Savings Goals quick glimpse */}
          <div className="mt-6 pt-4 border-t border-beige-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-espresso-700 flex items-center">
                <Target className="w-3.5 h-3.5 text-copper mr-1.5" />
                Active Savings Milestone
              </span>
              <Link to="/savings" className="text-[11px] font-bold text-copper hover:underline">
                View All
              </Link>
            </div>
            {data?.savingsGoals && data.savingsGoals.length > 0 ? (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-brand-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-espresso-900">
                  <span>{data.savingsGoals[0].name}</span>
                  <span className="text-copper">{data.savingsGoals[0].progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-beige-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-copper rounded-full"
                    style={{ width: `${data.savingsGoals[0].progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-espresso-400">No savings goals created yet.</p>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
          <div className="flex items-center justify-between pb-3 border-b border-beige-200">
            <div>
              <h3 className="text-sm font-bold text-espresso-900">Monthly Spending by Category</h3>
              <p className="text-[11px] text-espresso-400">Visual distribution of all monthly outlays</p>
            </div>
            <Link to="/analytics" className="text-xs font-bold text-copper hover:underline flex items-center">
              Deep Analytics <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {categoryChartData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val, cur), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#1E1914',
                        borderColor: '#C27B38',
                        borderRadius: '0.75rem',
                        color: '#FAF8F5',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {categoryChartData.map((cat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-beige-50/50 hover:bg-beige-100 text-xs transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-espresso-800">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-espresso-900">
                      {formatCurrency(cat.value, cur)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-center text-espresso-400">
              <PieChartIcon className="w-10 h-10 mb-2 opacity-40 text-brand-400" />
              <p className="text-xs font-medium">No expenses recorded for this month.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Itemized Transactions */}
      <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
        <div className="flex items-center justify-between pb-4 border-b border-beige-200">
          <div>
            <h3 className="text-base font-bold text-espresso-900">Recent Transactions</h3>
            <p className="text-xs text-espresso-400">Latest activity across your accounts</p>
          </div>
          <Link
            to="/transactions"
            className="btn-secondary text-xs"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
          <div className="divide-y divide-beige-100 mt-2">
            {data.recentTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 hover:bg-beige-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-espresso-900">{tx.description}</h4>
                      <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-espresso-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="font-medium text-espresso-600">{tx.category?.name || 'General'}</span>
                        <span>•</span>
                        <span className="text-brand-500 font-mono text-[10px]">{tx.account?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, cur)}
                    </span>
                    <span className="block text-[10px] text-espresso-400 font-mono">
                      {tx.paymentMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-espresso-400">
            <p className="text-xs">No transactions found. Record your first transaction above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
