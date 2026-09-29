import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export const STATUS_COLORS: Record<string, string> = {
  // Asset statuses
  registered: 'text-polar-text-dim border-polar-border bg-polar-border/20',
  warehouse: 'text-blue-300 border-blue-500/40 bg-blue-500/10',
  packed: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
  in_transit: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  on_ship: 'text-purple-300 border-purple-500/40 bg-purple-500/10',
  at_station: 'text-polar-accent border-polar-accent/40 bg-polar-accent/10',
  deployed: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
  consumed: 'text-polar-text-dim border-polar-border/40 bg-polar-border/10',
  // Personnel statuses
  assigned: 'text-polar-text-dim border-polar-border bg-polar-border/20',
  medical_cleared: 'text-green-300 border-green-500/40 bg-green-500/10',
  departed_india: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
  on_station: 'text-polar-accent border-polar-accent/40 bg-polar-accent/10',
  returned: 'text-polar-text-dim border-polar-border/40 bg-polar-border/10',
  medical_evacuation: 'text-polar-critical border-polar-critical/40 bg-polar-critical/10',
  // Incident severities
  low: 'text-blue-300 border-blue-500/40 bg-blue-500/10',
  medium: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  high: 'text-orange-300 border-orange-500/40 bg-orange-500/10',
  critical: 'text-polar-critical border-polar-critical/40 bg-polar-critical/10',
  // Incident status
  open: 'text-polar-critical border-polar-critical/40 bg-polar-critical/10',
  in_progress: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  resolved: 'text-polar-success border-polar-success/40 bg-polar-success/10',
  // Expedition status
  planning: 'text-blue-300 border-blue-500/40 bg-blue-500/10',
  active: 'text-polar-success border-polar-success/40 bg-polar-success/10',
  completed: 'text-polar-text-dim border-polar-border/40 bg-polar-border/10',
  cancelled: 'text-polar-critical border-polar-critical/40 bg-polar-critical/10',
};

export function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
