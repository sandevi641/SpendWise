import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  LineChart,
  Settings,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Savings Goals', href: '/savings', icon: Target },
  { name: 'Analytics & Trends', href: '/analytics', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-espresso-950 text-espresso-100 flex flex-col justify-between border-r border-espresso-800 shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-20 flex items-center px-6 border-b border-espresso-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-brand-700 flex items-center justify-center shadow-copper-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-wide">
                Spend<span className="text-copper">Wise</span>
              </h1>
              <p className="text-[10px] tracking-wider text-brand-300 font-mono uppercase">Fintech Ledger</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-copper text-white shadow-soft-sm font-bold'
                      : 'text-espresso-300 hover:text-white hover:bg-espresso-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* University Portfolio Card */}
      <div className="p-4 m-4 rounded-2xl bg-espresso-900 border border-espresso-800">
        <div className="flex items-center space-x-2 text-copper text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Undergraduate IT Project</span>
        </div>
        <p className="text-[11px] text-espresso-400 leading-relaxed">
          Production-grade Full-Stack Architecture with Decimal Math & Predictive Analytics.
        </p>
      </div>
    </aside>
  );
};
