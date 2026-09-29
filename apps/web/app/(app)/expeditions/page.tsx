'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StatusPill, TableSkeleton, EmptyState, PageHeader } from '@/components/ui/primitives';
import { formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const EXP_STATUSES = ['planning', 'active', 'completed', 'cancelled'];

export default function ExpeditionsPage() {
  const qc = useQueryClient();
  const { user, addToast } = useAppStore();
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', stationId: 'station-maitri' });

  const { data: expeditions = [], isLoading } = useQuery({
    queryKey: ['expeditions', filter],
    queryFn: () => api.get('/expeditions', { params: filter ? { status: filter } : {} }).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/expeditions', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expeditions'] });
      setShowCreate(false);
      addToast({ type: 'success', title: 'Expedition created' });
    },
  });

  const canCreate = ['hq_admin', 'logistics_officer'].includes(user?.role || '');

  return (
    <div>
      <PageHeader
        title="Expeditions"
        subtitle="Manage and monitor scientific expeditions"
        actions={
          canCreate && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Expedition
            </button>
          )
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['', ...EXP_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === s
                ? 'bg-polar-accent text-polar-bg'
                : 'bg-polar-card border border-polar-border text-polar-text-dim hover:text-polar-text'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="polar-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : expeditions.length === 0 ? (
          <EmptyState
            icon="🗺️"
            title="No expeditions found"
            description="Create your first expedition to get started"
            action={canCreate ? <button onClick={() => setShowCreate(true)} className="btn-primary">Create Expedition</button> : undefined}
          />
        ) : (
          <table className="polar-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Station</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Personnel</th>
                <th>Assets</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expeditions.map((exp: any, i: number) => (
                <motion.tr
                  key={exp.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td>
                    <div className="font-medium text-polar-text">{exp.name}</div>
                  </td>
                  <td className="text-polar-text-dim text-xs">{exp.station?.name || '—'}</td>
                  <td><StatusPill status={exp.status} /></td>
                  <td className="text-polar-text-dim text-xs">{formatDate(exp.startDate)}</td>
                  <td className="text-polar-text-dim">{exp._count?.personnel ?? 0}</td>
                  <td className="text-polar-text-dim">{exp._count?.assets ?? 0}</td>
                  <td>
                    <Link href={`/expeditions/${exp.id}`}>
                      <ChevronRight className="w-4 h-4 text-polar-text-dim hover:text-polar-accent transition-colors" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-polar-card border border-polar-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-polar-text">New Expedition</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-polar-text-dim" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
                <div>
                  <label className="block text-xs text-polar-text-dim mb-1.5">Expedition Name</label>
                  <input className="polar-input w-full" placeholder="42nd Indian Scientific Expedition to Antarctica"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs text-polar-text-dim mb-1.5">Start Date</label>
                  <input type="date" className="polar-input w-full"
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs text-polar-text-dim mb-1.5">Station</label>
                  <select className="polar-input w-full" value={form.stationId}
                    onChange={(e) => setForm({ ...form, stationId: e.target.value })}>
                    <option value="station-maitri">Maitri Station</option>
                    <option value="station-bharati">Bharati Station</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="btn-primary flex-1">
                    {create.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
