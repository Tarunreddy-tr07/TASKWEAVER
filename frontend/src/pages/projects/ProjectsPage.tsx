import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, FolderKanban, Calendar, Users, MoreVertical, Trash2, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge, PriorityBadge, RiskBadge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/Progress';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { projectsApi, employeesApi } from '../../services/api';
import { formatDate } from '../../utils/design';
import type { Project, Employee, ProjectStatus, Priority } from '../../types';

// Demo data
const demoProjects: Project[] = [
  {
    id: '1', name: 'E-Commerce Platform Rebuild', description: 'Complete redesign of the customer-facing e-commerce platform with modern tech stack.',
    status: 'active', priority: 'high', manager_id: 'emp1', manager_name: 'Alice Johnson',
    team_members: ['emp1', 'emp2', 'emp3'], start_date: '2026-09-01', deadline: '2026-12-01',
    completion_percentage: 72, total_tasks: 48, completed_tasks: 35, delayed_tasks: 4,
    predicted_completion_date: '2026-12-04', predicted_delay_days: 3, risk_level: 'moderate',
    category: 'Web Development', created_at: '2026-09-01', updated_at: '2026-11-01',
  },
  {
    id: '2', name: 'Mobile Banking App v2', description: 'Next generation mobile banking application with biometric auth and AI-powered spending insights.',
    status: 'active', priority: 'critical', manager_id: 'emp2', manager_name: 'Bob Smith',
    team_members: ['emp2', 'emp4'], start_date: '2026-09-15', deadline: '2026-11-28',
    completion_percentage: 45, total_tasks: 62, completed_tasks: 28, delayed_tasks: 8,
    predicted_completion_date: '2026-12-05', predicted_delay_days: 7, risk_level: 'high',
    category: 'Mobile', created_at: '2026-09-15', updated_at: '2026-11-01',
  },
  {
    id: '3', name: 'Data Warehouse Migration', description: 'Migrate legacy data warehouse to cloud-native architecture with real-time analytics.',
    status: 'active', priority: 'medium', manager_id: 'emp3', manager_name: 'Carol Davis',
    team_members: ['emp3', 'emp5'], start_date: '2026-10-01', deadline: '2026-11-15',
    completion_percentage: 91, total_tasks: 32, completed_tasks: 29, delayed_tasks: 1,
    predicted_completion_date: '2026-11-15', predicted_delay_days: 0, risk_level: 'low',
    category: 'Data Engineering', created_at: '2026-10-01', updated_at: '2026-11-01',
  },
  {
    id: '4', name: 'CRM Integration Suite', description: 'Integrate Salesforce CRM with internal systems and build unified customer data platform.',
    status: 'active', priority: 'high', manager_id: 'emp1', manager_name: 'Alice Johnson',
    team_members: ['emp1', 'emp4', 'emp6'], start_date: '2026-10-15', deadline: '2026-12-20',
    completion_percentage: 28, total_tasks: 55, completed_tasks: 15, delayed_tasks: 6,
    predicted_completion_date: '2027-01-01', predicted_delay_days: 12, risk_level: 'high',
    category: 'Integration', created_at: '2026-10-15', updated_at: '2026-11-01',
  },
  {
    id: '5', name: 'AI Analytics Dashboard', description: 'Real-time analytics dashboard with machine learning insights for executive reporting.',
    status: 'planning', priority: 'medium', manager_id: 'emp2', manager_name: 'Bob Smith',
    team_members: ['emp2', 'emp5'], start_date: '2026-11-01', deadline: '2027-01-31',
    completion_percentage: 8, total_tasks: 41, completed_tasks: 3, delayed_tasks: 0,
    risk_level: 'low', category: 'Analytics', created_at: '2026-11-01', updated_at: '2026-11-01',
  },
];

const defaultForm = {
  name: '', description: '', priority: 'medium', category: 'Web Development',
  deadline: '', manager_id: '', status: 'planning',
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    projectsApi.list().then(r => {
      const data = r.data?.items || r.data;
      if (Array.isArray(data) && data.length > 0) setProjects(data);
    }).catch(() => { });
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    setSaving(true);
    try {
      const res = await projectsApi.create(form);
      setProjects(prev => [res.data, ...prev]);
      toast.success('Project created!');
    } catch {
      // Demo mode fallback
      const newP: Project = {
        id: Date.now().toString(),
        name: form.name,
        description: form.description,
        status: form.status as ProjectStatus,
        priority: form.priority as Priority,
        category: form.category,
        manager_id: form.manager_id,
        team_members: [],
        start_date: new Date().toISOString(),
        deadline: form.deadline || new Date().toISOString(),
        completion_percentage: 0,
        total_tasks: 0,
        completed_tasks: 0,
        delayed_tasks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProjects(prev => [newP, ...prev]);
      toast.success('Project created! (demo mode)');
    }
    setCreateOpen(false);
    setForm(defaultForm);
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editProject) return;
    setSaving(true);
    try {
      const res = await projectsApi.update(editProject.id, form);
      setProjects(prev => prev.map(p => p.id === editProject.id ? res.data : p));
    } catch {
      setProjects(prev => prev.map(p => p.id === editProject.id ? { ...p, ...form, status: form.status as ProjectStatus, priority: form.priority as Priority } : p));
    }
    toast.success('Project updated!');
    setEditProject(null);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await projectsApi.delete(deleteProject.id);
    } catch { }
    setProjects(prev => prev.filter(p => p.id !== deleteProject.id));
    toast.success('Project deleted.');
    setDeleteProject(null);
    setDeleting(false);
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setForm({ name: p.name, description: p.description, priority: p.priority, category: p.category, deadline: p.deadline, manager_id: p.manager_id, status: p.status });
  };

  const ProjectForm = () => (
    <div className="space-y-4">
      <Input label="Project Name *" placeholder="E.g. Mobile App Redesign" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Textarea label="Description" placeholder="Project overview and goals..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
          options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
        <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          options={[{ value: 'planning', label: 'Planning' }, { value: 'active', label: 'Active' }, { value: 'on_hold', label: 'On Hold' }, { value: 'completed', label: 'Completed' }]} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        <Input label="Category" placeholder="E.g. Web Development" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} projects · {projects.filter(p => p.status === 'active').length} active</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setCreateOpen(true); }}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search projects..." icon={<Search size={15} />} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'planning', label: 'Planning' },
            { value: 'active', label: 'Active' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'completed', label: 'Completed' },
          ]}
          className="sm:w-44"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((p, i) => {
          const riskColor = { low: '#10B981', moderate: '#F59E0B', high: '#F97316', critical: '#EF4444' }[p.risk_level || 'low'];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FolderKanban size={18} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <Link to={`/projects/${p.id}`} className="block text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors leading-tight truncate">
                      {p.name}
                    </Link>
                    <span className="text-xs text-slate-500">{p.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/projects/${p.id}`}>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                      <Eye size={14} />
                    </button>
                  </Link>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteProject(p)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={p.status} />
                <PriorityBadge priority={p.priority} />
                {p.risk_level && <RiskBadge level={p.risk_level} />}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{p.description}</p>

              {/* Progress */}
              <ProgressBar
                value={p.completion_percentage}
                color={p.risk_level === 'low' ? 'success' : p.risk_level === 'moderate' ? 'secondary' : 'danger'}
                size="md"
                label={`Progress`}
                showLabel
                className="mb-4"
              />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Total', value: p.total_tasks },
                  { label: 'Done', value: p.completed_tasks, color: '#10B981' },
                  { label: 'Delayed', value: p.delayed_tasks, color: p.delayed_tasks > 0 ? '#F59E0B' : undefined },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-sm font-bold" style={{ color: s.color || '#0F172A' }}>{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Calendar size={12} />
                  <span>{formatDate(p.deadline)}</span>
                </div>
                {(p.predicted_delay_days || 0) > 0 && (
                  <span className="font-semibold" style={{ color: riskColor }}>
                    +{p.predicted_delay_days}d predicted
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban size={40} className="text-slate-400 mb-4" />
            <p className="text-slate-700 font-medium mb-2">No projects found</p>
            <p className="text-sm text-slate-500 mb-6">Try adjusting filters or create a new project</p>
            <Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setCreateOpen(true); }}>New Project</Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Project"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create Project</Button>
          </>
        }
      >
        <ProjectForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        title="Edit Project"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditProject(null)}>Cancel</Button>
            <Button onClick={handleEdit} loading={saving}>Save Changes</Button>
          </>
        }
      >
        <ProjectForm />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteProject?.name}"? This action cannot be undone and will delete all associated tasks.`}
        confirmLabel="Delete Project"
        loading={deleting}
      />
    </div>
  );
}
