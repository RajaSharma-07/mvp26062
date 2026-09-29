'use client';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  sub?: string;
  color?: 'accent' | 'success' | 'warning' | 'critical' | 'muted';
  delay?: number;
}

const colorMap: Record<string, string> = {
  accent: 'border-polar-accent/30 shadow-accent',
  success: 'border-polar-success/30',
  warning: 'border-amber-500/30',
  critical: 'border-polar-critical/30',
  muted: 'border-polar-border',
};

const iconBgMap: Record<string, string> = {
  accent: 'bg-polar-accent/10 text-polar-accent',
  success: 'bg-polar-success/10 text-polar-success',
  warning: 'bg-amber-500/10 text-amber-400',
  critical: 'bg-polar-critical/10 text-polar-critical',
  muted: 'bg-polar-border/30 text-polar-text-dim',
};

export function StatCard({ icon, label, value, sub, color = 'muted', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay }}
      whileHover={{ y: -2 }}
      className={cn('polar-card p-5 border', colorMap[color])}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl', iconBgMap[color])}>
          {icon}
        </div>
        {color === 'critical' && value > 0 && (
          <span className="flex w-2 h-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-polar-critical opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-polar-critical" />
          </span>
        )}
      </div>
      <div className="font-heading text-3xl font-bold text-polar-text">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-sm text-polar-text-dim mt-0.5 font-medium">{label}</div>
      {sub && <div className="text-xs text-polar-text-dim/60 mt-1">{sub}</div>}
    </motion.div>
  );
}

// ── Stats Grid ───────────────────────────────────────────────────────────────
export function StatsGrid({ data }: {
  data: {
    totalAssets: number; atStation: number; deployed: number; inTransit: number;
    personnelOnStation: number; openIncidents: number; activeExpeditions: number;
  }
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon="📦" label="Total Assets" value={data.totalAssets} delay={0} color="accent" />
      <StatCard icon="🏔️" label="At Station" value={data.atStation} delay={0.05} color="success" />
      <StatCard icon="🚀" label="Deployed" value={data.deployed} delay={0.1} />
      <StatCard icon="🚢" label="In Transit" value={data.inTransit} delay={0.15} color="warning" />
      <StatCard icon="👥" label="On Station" value={data.personnelOnStation} sub="Personnel" delay={0.2} color="accent" />
      <StatCard icon="🚨" label="Open Incidents" value={data.openIncidents} delay={0.25} color={data.openIncidents > 0 ? 'critical' : 'muted'} />
      <StatCard icon="🗓️" label="Active Expeditions" value={data.activeExpeditions} delay={0.3} color="success" />
      <StatCard icon="📡" label="Stations" value={2} delay={0.35} />
    </div>
  );
}
