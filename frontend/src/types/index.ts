// Core TypeScript types for TASKWEAVER

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  skills: string[];
  active_tasks: number;
  workload_percentage: number;
  performance_score: number;
  avatar?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'delayed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  manager_id: string;
  manager_name?: string;
  team_members: string[];
  start_date: string;
  deadline: string;
  completion_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  delayed_tasks: number;
  predicted_completion_date?: string;
  predicted_delay_days?: number;
  risk_level?: RiskLevel;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  project_id: string;
  project_name?: string;
  assigned_to: string;
  assigned_name?: string;
  priority: Priority;
  status: TaskStatus;
  complexity: 'low' | 'medium' | 'high';
  estimated_duration: number; // days
  actual_duration?: number;
  start_date: string;
  deadline: string;
  completion_percentage: number;
  prerequisite_tasks: string[];
  dependent_tasks?: string[];
  delay_probability?: number;
  predicted_duration?: number;
  risk_level?: RiskLevel;
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
  is_predicted: boolean;
  confidence?: number;
  approved: boolean;
}

export interface Prediction {
  id: string;
  task_id: string;
  task_name?: string;
  delay_probability: number;
  predicted_duration: number;
  confidence_score: number;
  risk_level: RiskLevel;
  explanation: string;
  feature_importance: Record<string, number>;
  created_at: string;
}

export interface SimulationResult {
  id: string;
  project_id: string;
  task_id: string;
  additional_delay_days: number;
  original_completion_date: string;
  simulated_completion_date: string;
  total_project_delay: number;
  affected_tasks: AffectedTask[];
  critical_path_changes: string[];
  created_at: string;
}

export interface AffectedTask {
  task_id: string;
  task_name: string;
  original_end_date: string;
  new_end_date: string;
  delay_days: number;
  is_critical: boolean;
}

export interface KPIData {
  total_projects: number;
  active_projects: number;
  completed_tasks: number;
  delayed_tasks: number;
  high_risk_tasks: number;
  on_time_completion_rate: number;
}

export interface Notification {
  id: string;
  type: 'risk_alert' | 'delay_predicted' | 'task_blocked' | 'dependency_suggestion' | 'info';
  title: string;
  message: string;
  task_id?: string;
  project_id?: string;
  read: boolean;
  created_at: string;
}

export interface DelayPropagation {
  root_task_id: string;
  affected_tasks: PropagatedTask[];
  total_delay_days: number;
  project_impact_days: number;
  critical_path_affected: boolean;
}

export interface PropagatedTask {
  task_id: string;
  task_name: string;
  delay_inherited: number;
  new_start_date: string;
  new_end_date: string;
  depth: number; // chain depth from root
}

export interface WorkloadData {
  employee_id: string;
  employee_name: string;
  department: string;
  active_tasks: number;
  estimated_hours_per_week: number;
  capacity_hours_per_week: number;
  utilization_percentage: number;
  overloaded: boolean;
  tasks: Task[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
