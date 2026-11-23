import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getApiErrorMessage } from '../../services/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: FormData) => {
    try {
      setAuthError('');
      await login(data.email, data.password);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Sign-in failed. Please try again.');
      setAuthError(message === 'Invalid email or password'
        ? 'Invalid email or password. Try demo@taskweaver.app / password123'
        : message);
    }
  };

  const fillDemo = () => {
    setValue('email', 'demo@taskweaver.app');
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex relative overflow-hidden">
      {/* Soft Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-100/70 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] bg-sky-100/60 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      </div>

      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-slate-900 text-lg tracking-tight">TASKWEAVER</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest -mt-0.5">Project Intelligence</span>
            </div>
          </Link>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-8 font-normal">
            Sign in to access your predictive workspace & forecasts
          </p>

          {authError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 mb-6 text-xs text-rose-700">
              <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              icon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={15} />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-sm py-2.5 mt-2"
              loading={isSubmitting || isLoading}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-6 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div className="text-[11px] min-w-0">
              <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-600" />
                Demo Credentials
              </p>
              <p className="text-slate-600 truncate mt-0.5 font-mono text-[10px]">demo@taskweaver.app / password123</p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex-shrink-0 ml-2 shadow-2xs"
            >
              Auto Fill
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right — Showcase Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white relative overflow-hidden items-center justify-center p-12 border-l border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

        <div className="text-center relative z-10 max-w-md">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/25"
          >
            <Zap size={38} className="text-white" />
          </motion.div>
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Predict Delays.<br />
            <span className="gradient-text">
              Deliver Smarter.
            </span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Neural delay estimation, dependency risk modeling, and Monte Carlo critical-path simulations for high-velocity teams.
          </p>
        </div>

        {/* Floating Metric Badges */}
        {[
          { top: '18%', left: '10%', delay: 0, text: 'LSTM Forecasting', sub: '94% calibration' },
          { top: '72%', right: '12%', delay: 1, text: 'Risk Detected Early', sub: 'Critical Path Protected' },
          { top: '48%', left: '8%', delay: 2, text: 'Dependency Graph', sub: '3 task bottlenecks flagged' },
        ].map((card, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: card.delay, ease: 'easeInOut' }}
            className="absolute rounded-2xl px-4 py-3 bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5"
            style={{ top: card.top, left: (card as any).left, right: (card as any).right }}
          >
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              {card.text}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{card.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
