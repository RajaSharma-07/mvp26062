'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { StatusPill, EmptyState, PageHeader } from '@/components/ui/primitives';
import { useAppStore } from '@/lib/store';
import { formatDateTime, formatStatus } from '@/lib/utils';
import { getSocket } from '@/lib/socket';
import { ChevronUp } from 'lucide-react';

export default function IncidentsPage() {
  const qc = useQueryClient();
  const { addToast } = useAppStore();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.get('/incidents').then((r) => r.data),
  });

  // Real-time incident updates
  useEffect(() => {
    const socket = getSocket();
    const handler = (incident: any) => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      addToast({
        type: incident.severity === 'critical' ? 'critical' : 'warning',
        title: `🚨 New Incident: ${incident.title}`,
        message: `${incident.severity?.toUpperCase()} — ${incident.type}`,
        duration: 8000,
      });
    };
    socket.on('incident:new', handler);
    socket.on('incident:updated', () => qc.invalidateQueries({ queryKey: ['incidents'] }));
    return () => { socket.off('incident:new', handler); socket.off('incident:updated'); };
  }, [qc, addToast]);

  const escalate = useMutation({
    mutationFn: (id: string) => api.post(`/incidents/${id}/escalate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      addToast({ type: 'warning', title: 'Incident escalated' });
    },
  });

  const resolve = useMutation({
    mutationFn: (id: string) => api.patch(`/incidents/${id}`, { status: 'resolved' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      addToast({ type: 'success', title: 'Incident resolved' });
    },
  });

  const critical = incidents.filter((i: any) => i.severity === 'critical' && i.status !== 'resolved');

  return (
    <div className="space-y-5">
      <PageHeader title="Incidents" subtitle={`${incidents.filter((i: any) => i.status !== 'resolved').length} open incidents`} />

      {/* Critical Banner */}
      <AnimatePresence>
        {critical.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="border border-polar-critical/60 bg-polar-critical/10 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="relative flex-shrink-0">
              <span className="absolute -inset-1 rounded-full bg-polar-critical/30 animate-ping" />
              <span className="relative text-xl">🚨</span>
            </div>
            <div>
              <p className="font-heading font-bold text-polar-critical text-sm">
                {critical.length} CRITICAL incident{critical.length > 1 ? 's' : ''} active
              </p>
              <p className="text-xs text-polar-text-dim">Immediate action required</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incidents List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState icon="✅" title="No incidents" description="All clear — press the SOS button to report an emergency" />
        ) : (
          <AnimatePresence mode="popLayout">
            {incidents.map((inc: any, i: number) => (
              <motion.div key={inc.id}
                layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`polar-card p-4 ${
                  inc.severity === 'critical' ? 'border-polar-critical/40' :
                  inc.severity === 'high' ? 'border-amber-500/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusPill status={inc.severity} />
                      <StatusPill status={inc.status} />
                      <span className="text-xs text-polar-text-dim">{inc.type}</span>
                    </div>
                    <h3 className="font-medium text-polar-text text-sm">{inc.title}</h3>
                    {inc.description && (
                      <p className="text-xs text-polar-text-dim mt-1 line-clamp-2">{inc.description}</p>
                    )}
                    <p className="text-xs text-polar-text-dim mt-1.5">{formatDateTime(inc.createdAt)}</p>
                  </div>
                  {inc.status !== 'resolved' && (
                    <div className="flex gap-2 flex-shrink-0">
                      {inc.severity !== 'critical' && (
                        <button
                          onClick={() => escalate.mutate(inc.id)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <ChevronUp className="w-3 h-3" /> Escalate
                        </button>
                      )}
                      <button
                        onClick={() => resolve.mutate(inc.id)}
                        className="text-xs px-2 py-1 rounded border border-polar-success/40 text-polar-success hover:bg-polar-success/10 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
