import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  colorClass: string;
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  colorClass,
  subtitle
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
          {unit && <span className="ml-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl text-white ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

