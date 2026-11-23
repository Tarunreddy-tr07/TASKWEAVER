import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/design';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  animate?: boolean;
}

export function Card({
  children,
  className,
  glass = false,
  hover = false,
  padding = 'md',
  onClick,
  animate = false,
}: CardProps) {
  const base = 'rounded-2xl border border-slate-200/90 relative overflow-hidden transition-all duration-300 bg-white shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.04)]';
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  
  const glassStyle = glass
    ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-md'
    : 'bg-white';
    
  const hoverStyle = hover
    ? 'cursor-pointer hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)]'
    : '';

  const Comp = animate ? motion.div : 'div';

  return (
    <Comp
      className={cn(base, paddings[padding], glassStyle, hoverStyle, className)}
      onClick={onClick}
      {...(animate ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } } : {})}
    >
      {children}
    </Comp>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-heading text-base font-bold text-slate-900 tracking-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate font-normal">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
