import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'emerald'
}) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      icon: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      icon: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-100 dark:border-amber-900/30'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      icon: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      icon: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-100 dark:border-purple-900/30'
    }
  };

  const scheme = colorClasses[color];

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border ${scheme.border} shadow-xs hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${scheme.bg} ${scheme.icon}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-xs">
          <span className={`font-bold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend.value}
          </span>
          <span className="text-slate-400 dark:text-slate-500">{trend.label || "مقارنة بالشهر السابق"}</span>
        </div>
      )}
    </div>
  );
};
