import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import { accountService, categoryService } from '../../services/accountService';
import { Transaction, Account, Category } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { TransactionModal } from '../../components/transactions/TransactionModal';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Download,
} from 'lucide-react';
import { statementService } from '../../services/ocrService';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number }>({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modal edit state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getTransactions({
        search: search || undefined,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        categoryId: categoryFilter || undefined,
        accountId: accountFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 15,
      });
      setTransactions(res.transactions);
      if (res.meta) {
        setMeta({
          page: res.meta.page || 1,
          totalPages: res.meta.totalPages || 1,
          total: res.meta.total || 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      const [accs, cats] = await Promise.all([
        accountService.getAccounts(),
        categoryService.getCategories(),
      ]);
      setAccounts(accs);
      setCategories(cats);
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, categoryFilter, accountFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionService.deleteTransaction(id);
      fetchTransactions();
      window.dispatchEvent(new Event('transaction-updated'));
    } catch (e) {
      alert('Failed to delete transaction');
    }
  };

  const handleExportPdf = async () => {
    await statementService.downloadPdf();
  };

  const cur = user?.currency || 'USD';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-espresso-900 tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-espresso-400 mt-0.5">
            Search, filter, and audit all recorded financial entries ({meta.total} total)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportPdf}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-espresso-500" />
            PDF Export
          </button>
          <button
            onClick={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-100 shadow-soft-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or merchant..."
              className="w-full pl-9 pr-4 py-2 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            />
          </form>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="ALL">All Flow Types</option>
              <option value="EXPENSE">Expenses Only (-)</option>
              <option value="INCOME">Incomes Only (+)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={accountFilter}
              onChange={(e) => {
                setAccountFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-beige-50/70 border-b border-brand-100 text-[11px] font-bold text-espresso-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100 text-xs text-espresso-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-espresso-400">
                    <div className="w-6 h-6 border-2 border-copper border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-espresso-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-copper" />
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-beige-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium whitespace-nowrap text-espresso-600">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-4 font-bold text-espresso-900 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: `${tx.category?.color || '#8B5E3C'}15`,
                            color: tx.category?.color || '#8B5E3C',
                          }}
                        >
                          {tx.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-espresso-600 font-mono text-[11px]">
                        {tx.account?.name || 'Main Account'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-espresso-400 text-[11px] font-mono">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, cur)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedTx(tx);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-espresso-400 hover:text-copper hover:bg-beige-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 text-espresso-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-beige-50/50 border-t border-brand-100 text-xs">
            <span className="text-espresso-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-brand-200 bg-white text-espresso-600 hover:bg-beige-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-1.5 rounded-lg border border-brand-200 bg-white text-espresso-600 hover:bg-beige-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTx(null);
        }}
        onSuccess={() => {
          fetchTransactions();
          window.dispatchEvent(new Event('transaction-updated'));
        }}
        transactionToEdit={selectedTx}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
};
