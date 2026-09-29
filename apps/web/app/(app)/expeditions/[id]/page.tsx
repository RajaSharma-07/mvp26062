'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { StatusPill, AnimatedNumber, PageHeader } from '@/components/ui/primitives';
import { formatDate, formatStatus } from '@/lib/utils';

const EXP_STATUSES = ['planning', 'active', 'completed', 'cancelled'];

export default function ExpeditionDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: exp, isLoading } = useQuery({
    queryKey: ['expedition', id],
    queryFn: () => api.get(`/expeditions/${id}`).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/expeditions/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expedition', id] }),
  });

  if (isLoading) return <div className="animate-pulse h-64 rounded-xl bg-polar-card" />;
  if (!exp) return <p className="text-polar-text-dim">Expedition not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <PageHeader title={exp.name} subtitle={`${exp.station?.name || ''} · Started ${formatDate(exp.startDate)}`} />
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={exp.status} />
          <select
            className="polar-input text-xs py-1"
            value={exp.status}
            onChange={(e) => updateStatus.mutate(e.target.value)}
          >
            {EXP_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Personnel', value: exp._count?.personnel ?? 0, icon: '👥' },
          { label: 'Assets', value: exp._count?.assets ?? 0, icon: '📦' },
          { label: 'Incidents', value: exp._count?.incidents ?? 0, icon: '⚠️' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="polar-card p-4 text-center"
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-heading text-2xl font-bold text-polar-text"><AnimatedNumber value={s.value} /></div>
            <div className="text-xs text-polar-text-dim mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Personnel List */}
      <div className="polar-card overflow-hidden">
        <div className="px-4 py-3 border-b border-polar-border">
          <h3 className="font-heading font-semibold text-sm">Personnel ({exp.personnel?.length || 0})</h3>
        </div>
        <div className="divide-y divide-polar-border/50">
          {exp.personnel?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-polar-accent/20 border border-polar-accent/30 flex items-center justify-center text-polar-accent text-sm font-semibold">
                  {p.user?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-polar-text">{p.user?.name}</p>
                  <p className="text-xs text-polar-text-dim">{p.role}</p>
                </div>
              </div>
              <StatusPill status={p.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      {exp.incidents?.length > 0 && (
        <div className="polar-card overflow-hidden">
          <div className="px-4 py-3 border-b border-polar-border">
            <h3 className="font-heading font-semibold text-sm">Recent Incidents</h3>
          </div>
          <div className="divide-y divide-polar-border/50">
            {exp.incidents.map((inc: any) => (
              <div key={inc.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-polar-text">{inc.title}</p>
                  <p className="text-xs text-polar-text-dim">{inc.type}</p>
                </div>
                <StatusPill status={inc.severity} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
