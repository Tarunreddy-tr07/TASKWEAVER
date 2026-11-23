import React from 'react';
import { cn } from '../../utils/design';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold',
  secondary: 'bg-sky-50 text-sky-700 border border-sky-200/80 font-semibold',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold',
  ghost: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium',
  info: 'bg-sky-50 text-sky-700 border border-sky-200/80 font-semibold',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-600',
  secondary: 'bg-sky-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  danger: 'bg-rose-600',
  ghost: 'bg-slate-500',
  info: 'bg-sky-600',
};

export function Badge({ children, variant = 'primary', size = 'sm', dot = false, className }: BadgeProps) {
  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      sizeStyles,
      variantStyles[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

// Status-specific badge
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    not_started: { label: 'Not Started', variant: 'ghost' },
    in_progress: { label: 'In Progress', variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    blocked: { label: 'Blocked', variant: 'danger' },
    delayed: { label: 'Delayed', variant: 'warning' },
    planning: { label: 'Planning', variant: 'info' },
    active: { label: 'Active', variant: 'primary' },
  };

  const current = map[status] || { label: status, variant: 'ghost' };
  return <Badge variant={current.variant} dot>{current.label}</Badge>;
}

// Priority badge
export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    low: { label: 'Low', variant: 'ghost' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    critical: { label: 'Critical', variant: 'danger' },
  };

  const current = map[priority] || { label: priority, variant: 'ghost' };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

// Risk badge
export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    low: { label: 'Low Risk', variant: 'success' },
    moderate: { label: 'Moderate Risk', variant: 'warning' },
    high: { label: 'High Risk', variant: 'danger' },
    critical: { label: 'Critical Risk', variant: 'danger' },
  };

  const current = map[level] || { label: level, variant: 'ghost' };
  return <Badge variant={current.variant} dot>{current.label}</Badge>;
}
