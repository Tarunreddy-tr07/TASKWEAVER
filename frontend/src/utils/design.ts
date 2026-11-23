// Design system types and utilities
export const colors = {
  bg: '#0B1020',
  sidebar: '#10172A',
  card: '#151F35',
  cardHover: '#1a2540',
  primary: '#7667F5',
  primaryDark: '#5a4ed4',
  secondary: '#28B8D5',
  success: '#20C997',
  warning: '#FFB84D',
  danger: '#FF5C75',
  text: '#F5F7FF',
  textSecondary: '#929DB5',
  border: '#1E2D4A',
} as const;

export const riskColors = {
  low: '#20C997',
  moderate: '#FFB84D',
  high: '#FF8C42',
  critical: '#FF5C75',
} as const;

export const statusColors: Record<string, string> = {
  'not_started': '#929DB5',
  'in_progress': '#28B8D5',
  'completed': '#20C997',
  'blocked': '#FF5C75',
  'delayed': '#FFB84D',
};

export const priorityColors: Record<string, string> = {
  'low': '#20C997',
  'medium': '#28B8D5',
  'high': '#FFB84D',
  'critical': '#FF5C75',
};

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getRiskLevel(probability: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (probability <= 0.25) return 'low';
  if (probability <= 0.50) return 'moderate';
  if (probability <= 0.75) return 'high';
  return 'critical';
}

export function getRiskColor(probability: number): string {
  return riskColors[getRiskLevel(probability)];
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  if (rem === 0) return `${weeks}w`;
  return `${weeks}w ${rem}d`;
}

export function getDaysDiff(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
