import React from 'react';
import { cn } from '../../utils/design';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const colorMap = {
  primary: 'from-indigo-600 to-indigo-500',
  success: 'from-emerald-600 to-teal-500',
  warning: 'from-amber-500 to-orange-500',
  danger: 'from-rose-600 to-red-500',
  secondary: 'from-sky-500 to-indigo-500',
};

const sizeMap = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

export function ProgressBar({
  value, color = 'primary', size = 'md', showLabel = false, label, animated = true, className
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-slate-600 font-medium">{label}</span>}
          {showLabel && <span className="font-bold text-slate-800 font-metric">{clampedValue.toFixed(0)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50', sizeMap[size])}>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r', colorMap[color], animated && 'transition-all duration-700 ease-out')}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

// Circular progress
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export function CircularProgress({ value, size = 80, strokeWidth = 6, color = '#4F46E5', children }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800">
        {children}
      </div>
    </div>
  );
}
