import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { accountService, categoryService } from '../../services/accountService';
import { Account, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  User,
  Shield,
  CreditCard,
  Tags,
  Check,
  PlusCircle,
  Trash2,
  DollarSign,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ACCOUNTS' | 'CATEGORIES' | 'SECURITY'>('PROFILE');

  // Profile Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(user?.monthlyIncomeGoal?.toString() || '0');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('CHECKING');
  const [newAccBalance, setNewAccBalance] = useState('0');

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setCurrency(user.currency);
      setMonthlyIncomeGoal(user.monthlyIncomeGoal?.toString() || '0');
    }
  }, [user]);

  const loadAccountsAndCategories = async () => {
    try {
      const [accs, cats] = await Promise.all([
        accountService.getAccounts(),
        categoryService.getCategories(),
      ]);
      setAccounts(accs);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAccountsAndCategories();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        currency,
        monthlyIncomeGoal: parseFloat(monthlyIncomeGoal) || 0,
      });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    try {
      await accountService.createAccount({
        name: newAccName.trim(),
        type: newAccType,
        balance: parseFloat(newAccBalance) || 0,
      });
      setNewAccName('');
      setNewAccBalance('0');
      loadAccountsAndCategories();
      window.dispatchEvent(new Event('transaction-updated'));
    } catch (err) {
      alert('Failed to create account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Delete this account and all associated transactions?')) return;
    try {
      await accountService.deleteAccount(id);
      loadAccountsAndCategories();
      window.dispatchEvent(new Event('transaction-updated'));
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryService.createCategory({
        name: newCatName.trim(),
        type: newCatType,
      });
      setNewCatName('');
      loadAccountsAndCategories();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this custom category?')) return;
    try {
      await categoryService.deleteCategory(id);
      loadAccountsAndCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-espresso-900 tracking-tight">
          System Settings & Preferences
        </h1>
        <p className="text-xs text-espresso-400 mt-0.5">
          Configure personal details, currencies, accounts, custom categories, and security
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-brand-200 pb-2">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PROFILE'
              ? 'bg-copper text-white shadow-soft-sm'
              : 'text-espresso-600 hover:bg-beige-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Currency</span>
        </button>

        <button
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ACCOUNTS'
              ? 'bg-copper text-white shadow-soft-sm'
              : 'text-espresso-600 hover:bg-beige-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Accounts Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CATEGORIES'
              ? 'bg-copper text-white shadow-soft-sm'
              : 'text-espresso-600 hover:bg-beige-100'
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SECURITY'
              ? 'bg-copper text-white shadow-soft-sm'
              : 'text-espresso-600 hover:bg-beige-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Auth</span>
        </button>
      </div>

      {/* Profile & Currency Tab */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm max-w-2xl">
          <h3 className="text-base font-bold text-espresso-900 mb-1">User Profile</h3>
          <p className="text-xs text-espresso-400 mb-5">Update your identity and display preferences</p>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center">
              <Check className="w-4 h-4 mr-1.5" /> Profile settings saved successfully!
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-beige-100 border border-brand-200 rounded-xl text-xs text-espresso-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">Monthly Income Target ($)</label>
                <input
                  type="number"
                  step="100"
                  value={monthlyIncomeGoal}
                  onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary text-xs mt-2">
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Accounts Management Tab */}
      {activeTab === 'ACCOUNTS' && (
        <div className="space-y-6 max-w-3xl">
          {/* Add Account Card */}
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
            <h3 className="text-base font-bold text-espresso-900 mb-3">Add Financial Account</h3>
            <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-espresso-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Chase Checking, Gold Wallet"
                  className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">Type</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CASH">Cash Wallet</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>

              <button type="submit" className="btn-primary text-xs h-[38px]">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Account
              </button>
            </form>
          </div>

          {/* Accounts List */}
          <div className="bg-white rounded-2xl border border-brand-100 shadow-soft-sm divide-y divide-beige-100">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-espresso-900">{acc.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-espresso-400 mt-0.5">
                    <span className="badge bg-beige-100 text-espresso-700 font-mono text-[10px]">
                      {acc.type}
                    </span>
                    {acc.isDefault && (
                      <span className="badge bg-copper/15 text-copper text-[10px]">Default</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-mono text-sm font-bold text-espresso-900">
                    {formatCurrency(acc.balance, currency)}
                  </span>
                  {!acc.isDefault && (
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-1.5 text-espresso-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Management Tab */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-6 max-w-3xl">
          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
            <h3 className="text-base font-bold text-espresso-900 mb-3">Add Custom Category</h3>
            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-espresso-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Gym & Fitness, Study Books"
                  className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">Flow Type</label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
                >
                  <option value="EXPENSE">Expense (-)</option>
                  <option value="INCOME">Income (+)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary text-xs h-[38px]">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Category
              </button>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm">
            <h4 className="text-xs font-bold text-espresso-400 uppercase tracking-wider mb-3">
              Active Category Taxonomy ({categories.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 bg-beige-50/60 rounded-xl border border-brand-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-espresso-900">{cat.name}</span>
                    <span className="text-[10px] text-espresso-400 font-mono">({cat.type[0]})</span>
                  </div>
                  {cat.userId && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-espresso-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security & Password Tab */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-soft-sm max-w-2xl">
          <h3 className="text-base font-bold text-espresso-900 mb-1">Security & Authentication</h3>
          <p className="text-xs text-espresso-400 mb-5">Change password and verify session encryption</p>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center">
              <Check className="w-4 h-4 mr-1.5" /> Password updated successfully!
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 bg-beige-50/50 border border-brand-200 rounded-xl text-xs text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40"
              />
            </div>

            <button type="submit" className="btn-primary text-xs mt-2">
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
