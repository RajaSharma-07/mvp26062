'use client';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { STATUS_COLORS, formatStatus, cn } from '@/lib/utils';

// ── Animated Counter ─────────────────────────────────────────────────────────
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}

// ── Status Pill ──────────────────────────────────────────────────────────────
export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn('status-pill', STATUS_COLORS[status] || 'text-polar-text-dim border-polar-border')}>
      {formatStatus(status)}
    </span>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-9 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="text-5xl mb-4 opacity-60 animate-float">{icon}</div>
      <h3 className="font-heading font-semibold text-polar-text mb-1">{title}</h3>
      {description && <p className="text-sm text-polar-text-dim max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-polar-text">{title}</h1>
        {subtitle && <p className="text-sm text-polar-text-dim mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
