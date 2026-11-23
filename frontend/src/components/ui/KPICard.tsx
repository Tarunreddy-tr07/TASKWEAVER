import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/design';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  index?: number;
}

const colorMap = {
  primary: {
    accent: '#4F46E5',
    borderHover: 'hover:border-indigo-300',
    iconGradient: 'from-indigo-50 to-indigo-100/70',
    iconBorder: 'border-indigo-200/80',
    iconColor: 'text-indigo-600',
    barGradient: 'from-indigo-600 to-indigo-400',
    shadowGlow: 'hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.15)]',
  },
  secondary: {
    accent: '#0284C7',
    borderHover: 'hover:border-sky-300',
    iconGradient: 'from-sky-50 to-sky-100/70',
    iconBorder: 'border-sky-200/80',
    iconColor: 'text-sky-600',
    barGradient: 'from-sky-600 to-sky-400',
    shadowGlow: 'hover:shadow-[0_12px_28px_-6px_rgba(2,132,199,0.15)]',
  },
  success: {
    accent: '#059669',
    borderHover: 'hover:border-emerald-300',
    iconGradient: 'from-emerald-50 to-emerald-100/70',
    iconBorder: 'border-emerald-200/80',
    iconColor: 'text-emerald-600',
    barGradient: 'from-emerald-600 to-emerald-400',
    shadowGlow: 'hover:shadow-[0_12px_28px_-6px_rgba(5,150,105,0.15)]',
  },
  warning: {
    accent: '#D97706',
    borderHover: 'hover:border-amber-300',
    iconGradient: 'from-amber-50 to-amber-100/70',
    iconBorder: 'border-amber-200/80',
    iconColor: 'text-amber-600',
    barGradient: 'from-amber-600 to-amber-400',
    shadowGlow: 'hover:shadow-[0_12px_28px_-6px_rgba(217,119,6,0.15)]',
  },
  danger: {
    accent: '#DC2626',
    borderHover: 'hover:border-rose-300',
    iconGradient: 'from-rose-50 to-rose-100/70',
    iconBorder: 'border-rose-200/80',
    iconColor: 'text-rose-600',
    barGradient: 'from-rose-600 to-rose-400',
    shadowGlow: 'hover:shadow-[0_12px_28px_-6px_rgba(220,38,38,0.15)]',
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  loading = false,
  index = 0,
}: KPICardProps) {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="w-14 h-5 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="w-24 h-8 rounded-lg bg-slate-100 animate-pulse mb-2" />
        <div className="w-28 h-3.5 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 cursor-default',
        'bg-white border border-slate-200/80',
        'shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]',
        'transition-all duration-300',
        c.borderHover,
        c.shadowGlow
      )}
    >
      {/* Top Header: Icon & Trend Pill */}
      <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br border shadow-sm transition-transform duration-300 group-hover:scale-105',
            c.iconGradient,
            c.iconBorder,
            c.iconColor
          )}
        >
          {icon}
        </div>

        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
              isPositive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            )}
          >
            {isPositive ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Metric Value */}
      <div className="relative z-10">
        <div className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          {value}
        </div>

        {/* Title */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </div>

        {/* Subtitle / Context */}
        {(subtitle || (trend && trend.label)) && (
          <div className="text-[11px] text-slate-600 mt-1 truncate font-medium">
            {subtitle || trend?.label}
          </div>
        )}
      </div>

      {/* Subtle Bottom Accent Line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity duration-300',
          c.barGradient
        )}
      />
    </motion.div>
  );
}
