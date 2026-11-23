import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar, CircularProgress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const employees = [
  { id: 'e1', name: 'Emily Chen', role: 'Senior Frontend Dev', dept: 'Engineering', active_tasks: 5, capacity: 40, utilized: 91, performance: 94, avatar: 'EC', tasks: ['Mobile Push Notifications', 'UI Component Library', 'Dashboard Charts', 'Search Engine', 'User Profile Page'] },
  { id: 'e2', name: 'James Lee', role: 'Backend Engineer', dept: 'Engineering', active_tasks: 4, capacity: 40, utilized: 78, performance: 87, avatar: 'JL', tasks: ['Product Catalog API', 'Order Processing', 'Inventory Service', 'Admin API'] },
  { id: 'e3', name: 'Sarah Kim', role: 'Full Stack Dev', dept: 'Engineering', active_tasks: 6, capacity: 40, utilized: 95, performance: 81, avatar: 'SK', tasks: ['API Rate Limiting', 'CRM Sync', 'Auth Middleware', 'Data Validation', 'Report Generator', 'Integration Tests'] },
  { id: 'e4', name: 'Tom Parker', role: 'Data Engineer', dept: 'Data', active_tasks: 3, capacity: 40, utilized: 62, performance: 91, avatar: 'TP', tasks: ['Database Index Optimization', 'ETL Pipeline', 'Data Warehouse Schema'] },
  { id: 'e5', name: 'Carol Davis', role: 'Solutions Architect', dept: 'Architecture', active_tasks: 4, capacity: 32, utilized: 88, performance: 96, avatar: 'CD', tasks: ['CRM Data Mapping', 'API Architecture', 'Tech Spec Docs', 'Code Reviews'] },
  { id: 'e6', name: 'David Wilson', role: 'DevOps Engineer', dept: 'Infrastructure', active_tasks: 2, capacity: 40, utilized: 35, performance: 89, avatar: 'DW', tasks: ['CI/CD Pipeline', 'Container Orchestration'] },
];

function getUtilColor(util: number): string {
  if (util >= 90) return '#FF5C75';
  if (util >= 75) return '#FFB84D';
  return '#20C997';
}

export function WorkloadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workload Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">Team capacity and workload distribution analysis</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Team Members', value: employees.length, color: '#4F46E5', icon: Users },
          { label: 'Overloaded (>85%)', value: employees.filter(e => e.utilized > 85).length, color: '#EF4444', icon: AlertCircle },
          { label: 'Optimal Capacity', value: employees.filter(e => e.utilized >= 60 && e.utilized <= 85).length, color: '#10B981', icon: CheckCircle2 },
          { label: 'Avg Utilization', value: `${Math.round(employees.reduce((s, e) => s + e.utilized, 0) / employees.length)}%`, color: '#0284C7', icon: TrendingUp },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} style={{ color: s.color }} />
              <span className="text-xs text-slate-600 font-medium">{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Overload Alert */}
      {employees.some(e => e.utilized > 90) && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-900 mb-1">Workload Imbalance Detected</p>
            <p className="text-xs text-slate-700 leading-relaxed">
              {employees.filter(e => e.utilized > 90).map(e => e.name).join(', ')} {employees.filter(e => e.utilized > 90).length === 1 ? 'is' : 'are'} operating above 90% utilization. Consider redistributing tasks to {employees.filter(e => e.utilized < 60).map(e => e.name).join(', ')} who have available capacity.
            </p>
            <p className="text-xs text-amber-800 mt-1 font-semibold">⚠ Note: Task redistribution requires manager approval.</p>
          </div>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {employees.map((emp, i) => {
          const utilColor = getUtilColor(emp.utilized);
          const overloaded = emp.utilized > 85;
          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white border-2 rounded-2xl p-5 shadow-xs transition-all ${overloaded ? 'border-rose-300' : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                    {emp.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                  </div>
                </div>
                <CircularProgress value={emp.utilized} size={56} strokeWidth={5} color={utilColor}>
                  <span className="text-xs font-bold" style={{ color: utilColor }}>{emp.utilized}%</span>
                </CircularProgress>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <div className="text-base font-bold text-indigo-600">{emp.active_tasks}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Active Tasks</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <div className="text-base font-bold" style={{ color: utilColor }}>{emp.utilized}%</div>
                  <div className="text-[10px] text-slate-500 font-medium">Utilized</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <div className="text-base font-bold text-emerald-600">{emp.performance}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Perf Score</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-600">Capacity Utilization</span>
                  <span style={{ color: utilColor }}>{emp.utilized}%</span>
                </div>
                <ProgressBar value={emp.utilized} color={overloaded ? 'danger' : emp.utilized > 70 ? 'warning' : 'success'} size="md" />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Tasks</p>
                <div className="space-y-1">
                  {emp.tasks.slice(0, 3).map(t => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {t}
                    </div>
                  ))}
                  {emp.tasks.length > 3 && (
                    <div className="text-xs text-slate-400">+{emp.tasks.length - 3} more tasks</div>
                  )}
                </div>
              </div>

              {overloaded && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="w-full !border-rose-200 !text-rose-700 hover:!bg-rose-50">
                    Request Rebalance (Manager Approval)
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
