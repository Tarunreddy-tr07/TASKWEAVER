import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskweaver_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.endsWith('/auth/login')) {
      localStorage.removeItem('taskweaver_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ─── Projects ───────────────────────────────────────────
export const projectsApi = {
  list: (params?: Record<string, unknown>) => api.get('/projects', { params }),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post('/projects', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  members: (id: string) => api.get(`/projects/${id}/members`),
  addMember: (id: string, employeeId: string) =>
    api.post(`/projects/${id}/members`, { employee_id: employeeId }),
};

// ─── Tasks ──────────────────────────────────────────────
export const tasksApi = {
  list: (params?: Record<string, unknown>) => api.get('/tasks', { params }),
  get: (id: string) => api.get(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => api.post('/tasks', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  history: (id: string) => api.get(`/tasks/${id}/history`),
  dependencies: (id: string) => api.get(`/tasks/${id}/dependencies`),
  addDependency: (id: string, dependsOnId: string) =>
    api.post(`/tasks/${id}/dependencies`, { depends_on_task_id: dependsOnId }),
  removeDependency: (id: string, depId: string) =>
    api.delete(`/tasks/${id}/dependencies/${depId}`),
};

// ─── Employees ──────────────────────────────────────────
export const employeesApi = {
  list: () => api.get('/employees'),
  get: (id: string) => api.get(`/employees/${id}`),
  workload: () => api.get('/employees/workload'),
};

// ─── Predictions ────────────────────────────────────────
export const predictionsApi = {
  taskDelay: (taskId: string) => api.post(`/predictions/task-delay/${taskId}`),
  batchPredict: (projectId: string) => api.post(`/predictions/batch/${projectId}`),
  projectCompletion: (projectId: string) => api.get(`/predictions/project-completion/${projectId}`),
  dependencySuggestions: (projectId: string) =>
    api.get(`/predictions/dependencies/${projectId}`),
  approveDependency: (id: string) => api.post(`/predictions/dependencies/${id}/approve`),
};

// ─── Simulation ─────────────────────────────────────────
export const simulationApi = {
  run: (data: {
    project_id: string;
    task_id: string;
    additional_delay_days: number;
    employee_reallocation?: Record<string, string>;
  }) => api.post('/simulation/run', data),
  list: (projectId: string) => api.get(`/simulation/results/${projectId}`),
};

// ─── Delay Propagation ──────────────────────────────────
export const propagationApi = {
  analyze: (taskId: string, delayDays: number) =>
    api.post(`/propagation/analyze`, { task_id: taskId, delay_days: delayDays }),
};

// ─── Dashboard KPI ──────────────────────────────────────
export const dashboardApi = {
  kpi: () => api.get('/dashboard/kpi'),
  recentActivity: () => api.get('/dashboard/activity'),
  riskAlerts: () => api.get('/dashboard/risk-alerts'),
  timeline: () => api.get('/dashboard/timeline'),
};

// ─── AI Assistant ───────────────────────────────────────
export const assistantApi = {
  chat: (message: string, context?: Record<string, unknown>) =>
    api.post('/assistant/chat', { message, context }),
};

// ─── Notifications ──────────────────────────────────────
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
