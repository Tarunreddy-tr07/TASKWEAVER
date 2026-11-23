import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, CheckSquare, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/Progress';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { formatDate } from '../../utils/design';
import type { Task } from '../../types';

const demoTasks: Task[] = [
  { id: 't1', name: 'API Rate Limiting Implementation', description: 'Implement rate limiting middleware for all public API endpoints.', project_id: '1', project_name: 'E-Commerce Platform', assigned_to: 'emp3', assigned_name: 'Sarah Kim', priority: 'critical', status: 'in_progress', complexity: 'high', estimated_duration: 5, actual_duration: undefined, start_date: '2026-10-25', deadline: '2026-11-08', completion_percentage: 40, prerequisite_tasks: ['t2'], delay_probability: 0.82, risk_level: 'critical', created_at: '2026-10-20', updated_at: '2026-11-01' },
  { id: 't2', name: 'User Authentication Module', description: 'JWT-based authentication with refresh tokens.', project_id: '1', project_name: 'E-Commerce Platform', assigned_to: 'emp1', assigned_name: 'Emily Chen', priority: 'high', status: 'completed', complexity: 'medium', estimated_duration: 7, actual_duration: 8, start_date: '2026-09-15', deadline: '2026-10-01', completion_percentage: 100, prerequisite_tasks: [], delay_probability: 0.05, risk_level: 'low', created_at: '2026-09-10', updated_at: '2026-10-03' },
  { id: 't3', name: 'Payment Gateway Integration', description: 'Stripe and PayPal payment processing integration.', project_id: '1', project_name: 'E-Commerce Platform', assigned_to: 'emp2', assigned_name: 'James Lee', priority: 'critical', status: 'blocked', complexity: 'high', estimated_duration: 10, start_date: '2026-10-28', deadline: '2026-11-20', completion_percentage: 30, prerequisite_tasks: ['t2'], delay_probability: 0.78, risk_level: 'critical', created_at: '2026-10-25', updated_at: '2026-11-01' },
  { id: 't4', name: 'Database Index Optimization', description: 'Optimize slow queries by adding proper indexes.', project_id: '3', project_name: 'Data Warehouse', assigned_to: 'emp4', assigned_name: 'Tom Parker', priority: 'medium', status: 'in_progress', complexity: 'medium', estimated_duration: 3, start_date: '2026-11-01', deadline: '2026-11-12', completion_percentage: 70, prerequisite_tasks: [], delay_probability: 0.35, risk_level: 'moderate', created_at: '2026-10-30', updated_at: '2026-11-01' },
  { id: 't5', name: 'CRM Data Mapping', description: 'Map Salesforce fields to internal customer schema.', project_id: '4', project_name: 'CRM Integration', assigned_to: 'emp5', assigned_name: 'Carol Davis', priority: 'high', status: 'not_started', complexity: 'high', estimated_duration: 8, start_date: '2026-11-05', deadline: '2026-11-25', completion_percentage: 0, prerequisite_tasks: [], delay_probability: 0.65, risk_level: 'high', created_at: '2026-11-01', updated_at: '2026-11-01' },
  { id: 't6', name: 'Mobile Push Notifications', description: 'FCM/APNS push notification service integration.', project_id: '2', project_name: 'Mobile Banking App', assigned_to: 'emp1', assigned_name: 'Emily Chen', priority: 'medium', status: 'in_progress', complexity: 'medium', estimated_duration: 5, start_date: '2026-10-20', deadline: '2026-11-15', completion_percentage: 55, prerequisite_tasks: ['t2'], delay_probability: 0.28, risk_level: 'low', created_at: '2026-10-15', updated_at: '2026-11-01' },
];

const defaultTaskForm = {
  name: '', description: '', project_id: '1', assigned_to: '',
  priority: 'medium', status: 'not_started', complexity: 'medium',
  estimated_duration: 5, start_date: '', deadline: '', completion_percentage: 0,
};

type ViewMode = 'list' | 'kanban';

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [form, setForm] = useState<typeof defaultTaskForm>(defaultTaskForm);
  const [saving, setSaving] = useState(false);

  const filtered = tasks.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.project_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error('Task name is required'); return; }
    const newTask: Task = {
      id: `t${Date.now()}`,
      name: form.name,
      description: form.description,
      project_id: form.project_id,
      project_name: '',
      assigned_to: form.assigned_to,
      priority: form.priority as Task['priority'],
      status: form.status as Task['status'],
      complexity: form.complexity as Task['complexity'],
      estimated_duration: form.estimated_duration,
      start_date: form.start_date || new Date().toISOString(),
      deadline: form.deadline || new Date().toISOString(),
      completion_percentage: form.completion_percentage,
      prerequisite_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    toast.success('Task created!');
    setCreateOpen(false);
    setForm(defaultTaskForm);
  };

  const handleEdit = () => {
    setTasks(prev => prev.map(t => t.id === editTask.id ? {
      ...t,
      ...form,
      priority: form.priority as Task['priority'],
      status: form.status as Task['status'],
      complexity: form.complexity as Task['complexity'],
    } : t));
    toast.success('Task updated!');
    setEditTask(null);
  };

  const handleDelete = () => {
    if (!deleteTask) return;
    setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
    toast.success('Task deleted.');
    setDeleteTask(null);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({ name: t.name, description: t.description, project_id: t.project_id, assigned_to: t.assigned_to, priority: t.priority, status: t.status, complexity: t.complexity, estimated_duration: t.estimated_duration, start_date: t.start_date, deadline: t.deadline, completion_percentage: t.completion_percentage });
  };

  const TaskForm = () => (
    <div className="space-y-4">
      <Input label="Task Name *" placeholder="E.g. Implement OAuth2 Authentication" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Textarea label="Description" rows={2} placeholder="Task details and requirements..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
          options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
        <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          options={[{ value: 'not_started', label: 'Not Started' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'blocked', label: 'Blocked' }, { value: 'delayed', label: 'Delayed' }]} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Complexity" value={form.complexity} onChange={e => setForm(f => ({ ...f, complexity: e.target.value }))}
          options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
        <Input label="Estimated Duration (days)" type="number" min="1" value={form.estimated_duration} onChange={e => setForm(f => ({ ...f, estimated_duration: parseInt(e.target.value) || 1 }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
        <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
      </div>
      <Input label="Completion (%)" type="number" min="0" max="100" value={form.completion_percentage} onChange={e => setForm(f => ({ ...f, completion_percentage: parseInt(e.target.value) || 0 }))} />
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filtered.map((t, i) => {
        const rColor = t.delay_probability && t.delay_probability > 0.75 ? '#EF4444' : t.delay_probability && t.delay_probability > 0.5 ? '#F59E0B' : t.delay_probability && t.delay_probability > 0.25 ? '#0284C7' : '#10B981';
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                </div>
                <p className="text-xs text-slate-600 mb-2 line-clamp-1">{t.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span>📁 {t.project_name}</span>
                  <span>👤 {t.assigned_name}</span>
                  <span>📅 {formatDate(t.deadline)}</span>
                  <span>⏱ {t.estimated_duration}d est</span>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {t.delay_probability !== undefined && (
                  <span className="text-xs font-bold" style={{ color: rColor }}>
                    {(t.delay_probability * 100).toFixed(0)}% risk
                  </span>
                )}
                <div className="w-24">
                  <ProgressBar value={t.completion_percentage} size="sm" color={t.delay_probability && t.delay_probability > 0.5 ? 'danger' : 'primary'} />
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block text-right">{t.completion_percentage}%</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => setDeleteTask(t)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const statuses = ['not_started', 'in_progress', 'blocked', 'completed'];
  const statusLabels: Record<string, string> = { not_started: 'Not Started', in_progress: 'In Progress', blocked: 'Blocked', completed: 'Completed' };
  const statusHeaderColor: Record<string, string> = { not_started: '#64748B', in_progress: '#0284C7', blocked: '#EF4444', completed: '#10B981' };

  const renderKanban = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map(status => {
        const statusTasks = filtered.filter(t => t.status === status);
        return (
          <div key={status} className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 min-h-64">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: statusHeaderColor[status] }}>{statusLabels[status]}</span>
              <span className="text-xs font-semibold text-slate-500">{statusTasks.length}</span>
            </div>
            <div className="space-y-3">
              {statusTasks.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-3 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm cursor-pointer group">
                  <p className="text-xs font-semibold text-slate-900 mb-2">{t.name}</p>
                  <PriorityBadge priority={t.priority} />
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">{t.assigned_name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEdit(t)} className="p-1 rounded text-slate-500 hover:text-slate-900"><Edit size={11} /></button>
                      <button onClick={() => setDeleteTask(t)} className="p-1 rounded text-slate-500 hover:text-rose-600"><Trash2 size={11} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} tasks · {tasks.filter(t => t.status === 'in_progress').length} in progress</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            {(['list', 'kanban'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${viewMode === m ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>{m}</button>
            ))}
          </div>
          <Button icon={<Plus size={16} />} onClick={() => { setForm(defaultTaskForm); setCreateOpen(true); }}>
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search tasks..." icon={<Search size={15} />} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="sm:w-40"
          options={[{ value: 'all', label: 'All Statuses' }, { value: 'not_started', label: 'Not Started' }, { value: 'in_progress', label: 'In Progress' }, { value: 'blocked', label: 'Blocked' }, { value: 'completed', label: 'Completed' }]} />
        <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="sm:w-40"
          options={[{ value: 'all', label: 'All Priorities' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
      </div>

      {viewMode === 'list' ? renderListView() : renderKanban()}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <CheckSquare size={40} className="text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium">No tasks found</p>
          <Button className="mt-4" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Create Task</Button>
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task" size="lg"
        footer={<><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving}>Create Task</Button></>}>
        <TaskForm />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg"
        footer={<><Button variant="ghost" onClick={() => setEditTask(null)}>Cancel</Button><Button onClick={handleEdit} loading={saving}>Save Changes</Button></>}>
        <TaskForm />
      </Modal>

      <ConfirmDialog isOpen={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={handleDelete}
        title="Delete Task" message={`Delete "${deleteTask?.name}"? This action cannot be undone.`} confirmLabel="Delete Task" />
    </div>
  );
}
