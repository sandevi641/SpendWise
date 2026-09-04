import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@spendwise.com');
  const [password, setPassword] = useState('DemoPass123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check credentials.');
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
          Personal Finance & Daily Spending Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-soft-lg border border-brand-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-espresso-900">Sign in to your account</h3>
            <p className="text-xs text-espresso-400 mt-0.5">
              Access your personal ledger, budgets, and predictive analytics
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Quick Demo Login Preset Banner */}
          <div className="mb-5 p-3.5 bg-beige-100/70 border border-brand-200 rounded-xl text-xs text-espresso-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-copper shrink-0" />
              <span>
                Demo credentials pre-filled for university evaluation
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-espresso-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-espresso-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@spendwise.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-beige-50/40 border border-brand-200 rounded-xl text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-copper/40 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-sm py-3 mt-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-espresso-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-copper hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
