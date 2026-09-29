'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { StatusPill, TableSkeleton, EmptyState, PageHeader } from '@/components/ui/primitives';
import { useAppStore } from '@/lib/store';
import { formatStatus } from '@/lib/utils';


const VALID_TRANSITIONS: Record<string, string[]> = {
  assigned: ['medical_cleared'],
  medical_cleared: ['departed_india', 'assigned'],
  departed_india: ['on_ship'],
  on_ship: ['on_station', 'returned'],
  on_station: ['returned', 'medical_evacuation'],
  returned: [],
  medical_evacuation: [],
};

export default function PersonnelPage() {
  const qc = useQueryClient();
  const { addToast } = useAppStore();
  const [filterStatus, setFilterStatus] = useState('');

  const { user } = useAppStore();

  // HQ admins/logistics see all personnel; field_crew see their expedition only
  const expeditionId =
    user?.role === 'hq_admin' || user?.role === 'logistics_officer'
      ? undefined
      : 'exp-42'; // default expedition for field crew / commanders

  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ['personnel', filterStatus, expeditionId],
    queryFn: () => api.get('/personnel', {
      params: {
        ...(expeditionId && { expeditionId }),
        ...(filterStatus && { status: filterStatus }),
      }
    }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, newStatus, location }: { id: string; newStatus: string; location?: string }) =>
      api.patch(`/personnel/${id}/status`, { newStatus, location }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['personnel'] });
      if (vars.newStatus === 'medical_evacuation') {
        addToast({ type: 'critical', title: '🚨 MEDEVAC initiated', message: 'HQ has been alerted immediately', duration: 10000 });
      } else {
        addToast({ type: 'success', title: 'Status updated' });
      }
    },
    onError: (e: any) => {
      addToast({ type: 'error', title: e.response?.data?.error || 'Status update failed' });
    },
  });

  const STATUSES = ['assigned', 'medical_cleared', 'departed_india', 'on_ship', 'on_station', 'returned', 'medical_evacuation'];

  return (
    <div>
      <PageHeader
        title="Personnel"
        subtitle={`${personnel.length} expedition members`}
      />

      {/* Status Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterStatus === s
                ? 'bg-polar-accent text-polar-bg'
                : 'bg-polar-card border border-polar-border text-polar-text-dim hover:text-polar-text'
            }`}
          >
            {s === '' ? 'All' : formatStatus(s)}
          </button>
        ))}
      </div>

      {/* Personnel Grid */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : personnel.length === 0 ? (
        <EmptyState icon="👥" title="No personnel found" description="Adjust the filter to see more members" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {personnel.map((p: any, i: number) => {
            const allowed = VALID_TRANSITIONS[p.status] || [];
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`polar-card p-4 ${p.status === 'medical_evacuation' ? 'border-polar-critical/40 shadow-critical' : ''}`}
              >
                {/* Avatar + Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-polar-accent/20 border border-polar-accent/30 flex items-center justify-center text-polar-accent font-semibold">
                    {p.user?.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-polar-text truncate">{p.user?.name}</p>
                    <p className="text-xs text-polar-text-dim truncate">{p.role}</p>
                  </div>
                  {p.status === 'medical_evacuation' && (
                    <span className="text-polar-critical animate-pulse text-xs">⚕️ MEDEVAC</span>
                  )}
                </div>

                <div className="mb-3">
                  <StatusPill status={p.status} />
                  {p.location && (
                    <p className="text-xs text-polar-text-dim mt-1 truncate">📍 {p.location}</p>
                  )}
                </div>

                {/* Status Update */}
                {allowed.length > 0 && (
                  <select
                    className="polar-input w-full text-xs py-1.5"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateStatus.mutate({ id: p.id, newStatus: e.target.value });
                      }
                    }}
                  >
                    <option value="">Update status...</option>
                    {allowed.map((s) => (
                      <option key={s} value={s}
                        className={s === 'medical_evacuation' ? 'text-red-500' : ''}
                      >
                        → {formatStatus(s)}
                      </option>
                    ))}
                  </select>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
