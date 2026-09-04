import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  Calendar,
  Activity,
  Zap,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalytics(selectedYear, selectedMonth);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedMonth]);

  const cur = user?.currency || 'USD';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-espresso-900 tracking-tight">
            Financial Analytics & Forecasting
          </h1>
          <p className="text-xs text-espresso-400 mt-0.5">
            Machine intelligence, behavioral insights, and predictive trend analysis
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-bold text-espresso-800 shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-copper/40"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2026, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-bold text-espresso-800 shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-copper/40"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Advanced Feature 3: Spending Prediction Card */}
      {data?.prediction && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-espresso-950 via-espresso-900 to-[#2A1F18] border border-copper/30 text-white shadow-copper-glow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-copper/20 border border-copper/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-copper" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  Predictive Spending Forecast Model
                  <span className="ml-2 badge bg-copper/20 text-copper border border-copper/40 text-[10px]">
                    Statistical Moving Average
                  </span>
                </h3>
                <p className="text-xs text-brand-200 mt-0.5">
                  Extrapolating daily velocity across {data.prediction.remainingDays} remaining calendar days
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="text-right">
                <span className="text-brand-300 block font-medium">Model Confidence</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {data.prediction.confidenceScore}% High Precision
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] text-brand-300 block">Current Incurred Spend</span>
              <h4 className="text-xl font-bold font-mono text-white mt-1">
                {formatCurrency(data.prediction.currentSpend, cur)}
              </h4>
              <span className="text-[10px] text-espresso-400 mt-1 block">Month-to-date total</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] text-brand-300 block">Daily Average Run Rate</span>
              <h4 className="text-xl font-bold font-mono text-copper mt-1">
                {formatCurrency(data.prediction.dailyAverage, cur)}
              </h4>
              <span className="text-[10px] text-espresso-400 mt-1 block">Per day velocity</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] text-brand-300 block">Estimated Month-End Outflow</span>
              <h4 className="text-xl font-bold font-mono text-amber-400 mt-1">
                ~{formatCurrency(data.prediction.estimatedMonthEndSpend, cur)}
              </h4>
              <span className="text-[10px] text-espresso-400 mt-1 block">Forecasted final spend</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[11px] text-brand-300 block">Projected Next Month Outlay</span>
              <h4 className="text-xl font-bold font-mono text-white mt-1">
                ~{formatCurrency(data.prediction.projectedNextMonthSpend, cur)}
              </h4>
              <span className="text-[10px] text-emerald-400 mt-1 block">Weighted historical projection</span>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Feature 2: Personalized Spending Insights Feed */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-copper" />
          <h3 className="text-sm font-bold text-espresso-900 uppercase tracking-wider">
            Personalized Behavioral Spending Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.insights && data.insights.length > 0 ? (
            data.insights.map((insight) => {
              const isWarning = insight.type === 'WARNING';
              const isSuccess = insight.type === 'SUCCESS';
              return (
                <div
                  key={insight.id}
                  className={`p-5 rounded-2xl border shadow-soft-sm bg-white flex flex-col justify-between ${
                    isWarning
                      ? 'border-amber-200 ring-1 ring-amber-100'
                      : isSuccess
                      ? 'border-emerald-200 ring-1 ring-emerald-100'
                      : 'border-brand-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {isWarning ? (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        ) : isSuccess ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-copper" />
                        )}
                        <span className="text-xs font-bold text-espresso-900">{insight.title}</span>
                      </div>
                      {insight.metric && (
                        <span className="badge font-mono text-[10px] bg-beige-100 text-espresso-700">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-espresso-600 leading-relaxed">{insight.message}</p>
                  </div>

                  {insight.actionableText && (
                    <div className="mt-4 pt-3 border-t border-beige-100 text-[11px] font-medium text-copper flex items-center">
                      <span>💡 {insight.actionableText}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-espresso-400 col-span-3">No insights generated yet.</p>
          )}
        </div>
      </div>

      {/* Chart 1: Daily Cash Flow Timeline (Recharts Area Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
        <div className="flex items-center justify-between pb-4 border-b border-beige-200 mb-4">
          <div>
            <h3 className="text-base font-bold text-espresso-900">Daily Cash Inflow vs Outflow</h3>
            <p className="text-xs text-espresso-400">Day-by-day trajectory for the selected month</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.dailyData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFEB" vertical={false} />
              <XAxis dataKey="day" stroke="#ADA092" fontSize={11} tickLine={false} />
              <YAxis stroke="#ADA092" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val, cur), '']}
                contentStyle={{
                  backgroundColor: '#1E1914',
                  borderColor: '#C27B38',
                  borderRadius: '0.75rem',
                  color: '#FAF8F5',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income (+)"
                stroke="#16A34A"
                fillOpacity={1}
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense (-)"
                stroke="#DC2626"
                fillOpacity={1}
                fill="url(#expenseGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: 12-Month Annual Trends (Recharts Bar Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
        <div className="flex items-center justify-between pb-4 border-b border-beige-200 mb-4">
          <div>
            <h3 className="text-base font-bold text-espresso-900">12-Month Annual Income vs Expense Comparison</h3>
            <p className="text-xs text-espresso-400">Cumulative seasonal trend analysis for {selectedYear}</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyTrends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFEB" vertical={false} />
              <XAxis dataKey="name" stroke="#ADA092" fontSize={11} tickLine={false} />
              <YAxis stroke="#ADA092" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val, cur), '']}
                contentStyle={{
                  backgroundColor: '#1E1914',
                  borderColor: '#C27B38',
                  borderRadius: '0.75rem',
                  color: '#FAF8F5',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Total Inflow" fill="#16A34A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Total Outflow" fill="#C27B38" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
