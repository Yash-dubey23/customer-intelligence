import type { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Skeleton } from './Skeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  loading?: boolean;
}

export function KpiCard({ title, value, subtitle, trend, icon: Icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
      </div>
      
      <div className="mt-4 flex items-baseline">
        <p className="text-3xl font-semibold text-slate-900">{value}</p>
        
        {trend && (
          <span className={`ml-2 flex items-baseline text-sm font-medium ${
            trend.direction === 'up' ? 'text-emerald-600' :
            trend.direction === 'down' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {trend.direction === 'up' && <ArrowUp className="self-center h-4 w-4 flex-shrink-0" aria-hidden="true" />}
            {trend.direction === 'down' && <ArrowDown className="self-center h-4 w-4 flex-shrink-0" aria-hidden="true" />}
            {trend.direction === 'neutral' && <Minus className="self-center h-4 w-4 flex-shrink-0" aria-hidden="true" />}
            <span className="ml-1">{Math.abs(trend.value)}%</span>
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
