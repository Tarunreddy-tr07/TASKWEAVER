import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { getApiErrorMessage } from '../../services/api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager', 'member']),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: authRegister, isAuthenticated } = useAuth();
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'manager' },
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: FormData) => {
    try {
      setAuthError('');
      await authRegister(data);
    } catch (error: unknown) {
      setAuthError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-indigo-100/60 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 right-1/4 w-[550px] h-[550px] bg-sky-100/50 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] relative z-10"
      >
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
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8 font-normal">
          Join predictive intelligence teams managing projects with AI
        </p>

        {authError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 mb-6 text-xs text-rose-700">
            <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Sarah Connor"
            icon={<User size={15} />}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Work Email"
            type="email"
            placeholder="you@company.com"
            icon={<Mail size={15} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password (min 8 chars)"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={15} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Select
            label="Your Role"
            options={[
              { value: 'manager', label: 'Project Manager / Lead' },
              { value: 'admin', label: 'Engineering Director / Admin' },
              { value: 'member', label: 'Team Member / Contributor' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />

          <Button
            type="submit"
            className="w-full text-sm py-2.5 mt-2"
            loading={isSubmitting}
          >
            Create Workspace Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
