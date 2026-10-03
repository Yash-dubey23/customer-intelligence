
type BadgeVariant = 'low' | 'medium' | 'high' | 'default' | 'info' | 'error' | 'success' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses: Record<BadgeVariant, string> = {
    high: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    error: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10',
    low: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10',
    default: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/10',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

/** Convenience component for risk-level badges */
export function RiskBadge({ risk }: { risk?: string | null }) {
  if (!risk) return <Badge variant="default">No prediction</Badge>;

  const variantMap: Record<string, BadgeVariant> = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };

  return (
    <Badge variant={variantMap[risk] || 'default'}>
      {risk}
    </Badge>
  );
}
