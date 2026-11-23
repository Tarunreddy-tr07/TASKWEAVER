import React, { forwardRef } from 'react';
import { cn } from '../../utils/design';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs',
              'transition-all duration-200',
              icon ? 'pl-10' : 'pl-4',
              iconRight ? 'pr-10' : 'pr-4',
              'py-2.5',
              error ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full bg-white border rounded-xl text-sm text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs',
            'transition-all duration-200 px-4 py-2.5 cursor-pointer',
            error ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs',
            'transition-all duration-200 px-4 py-2.5 resize-none',
            error ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
