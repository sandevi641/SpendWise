import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, User, DollarSign } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        currency,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-espresso-950 border border-brand-300 flex items-center justify-center shadow-copper-glow mb-4">
          <Sparkles className="w-7 h-7 text-copper" />
        </div>
        <h2 className="text-3xl font-extrabold text-espresso-900 tracking-tight">
          Spend<span className="text-copper">Wise</span>
        </h2>
        <p className="text-xs text-espresso-400 mt-1 uppercase tracking-widest font-mono">
          Create Your Personal Finance Ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-soft-lg border border-brand-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-espresso-900">Create your account</h3>
            <p className="text-xs text-espresso-400 mt-0.5">
              Start managing your expenses, budgets, and savings goals
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-espresso-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full pl-9 pr-3 py-2.5 bg-beige-50/40 border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Morgan"
                  className="w-full px-3 py-2.5 bg-beige-50/40 border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-espresso-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-beige-50/40 border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-espresso-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-beige-50/40 border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">Base Currency</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-espresso-400 absolute left-3.5 top-3" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-beige-50/40 border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40 focus:bg-white"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-sm py-3 mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-espresso-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-copper hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
