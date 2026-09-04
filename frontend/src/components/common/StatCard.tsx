import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  variant?: 'default' | 'copper' | 'emerald' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'copper':
        return 'bg-gradient-to-br from-espresso-950 to-espresso-900 text-white border-copper/30 shadow-copper-glow';
      case 'emerald':
        return 'bg-white border-emerald-100 text-espresso-900';
      case 'rose':
        return 'bg-white border-rose-100 text-espresso-900';
      default:
        return 'bg-white border-brand-100 text-espresso-900';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'copper':
        return 'bg-copper text-white';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'rose':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      default:
        return 'bg-brand-50 text-copper border border-brand-200';
    }
  };

  return (
    <div className={`p-5 rounded-2xl border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 ${getVariantStyles()}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${variant === 'copper' ? 'text-brand-300' : 'text-espresso-400'}`}>
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getIconStyles()}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-extrabold tracking-tight">{value}</h3>
        {subtitle && (
          <p className={`text-xs mt-1 ${variant === 'copper' ? 'text-espresso-300' : 'text-espresso-500'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-brand-100/30 flex items-center space-x-1.5 text-xs">
          <span className={`font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.value}
          </span>
          <span className={variant === 'copper' ? 'text-espresso-400' : 'text-espresso-400'}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};
