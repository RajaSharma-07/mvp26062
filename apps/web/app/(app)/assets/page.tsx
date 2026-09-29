'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, X, Search, ScanLine } from 'lucide-react';
import { api } from '@/lib/api';
import { StatusPill, TableSkeleton, EmptyState, PageHeader } from '@/components/ui/primitives';
import { useAppStore } from '@/lib/store';

const CATEGORIES = ['Scientific Equipment', 'Navigation', 'Meteorology', 'Safety', 'Medical', 'Communications', 'Vehicles', 'Food & Nutrition', 'Fuel & Energy', 'Shelter', 'Field Tools', 'IT Equipment', 'Power', 'Other'];
const STATUSES = ['registered', 'warehouse', 'packed', 'in_transit', 'on_ship', 'at_station', 'deployed', 'consumed'];

export default function AssetsPage() {
  const qc = useQueryClient();
  const { user, addToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Scientific Equipment', quantity: '1', unit: 'unit', stationId: 'station-maitri', expeditionId: 'exp-42' });

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets', search, filterStatus],
    queryFn: () => api.get('/assets', {
      params: {
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
      }
    }).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/assets', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      setShowCreate(false);
      addToast({ type: 'success', title: 'Asset registered' });
    },
  });

  return (
    <div>
      <PageHeader
        title="Assets & Cargo"
        subtitle={`${assets.length} assets tracked`}
        actions={
          <div className="flex gap-2">
            <Link href="/assets/scan">
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <ScanLine className="w-4 h-4" /> Scan QR
              </button>
            </Link>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Register Asset
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-polar-text-dim" />
          <input
            className="polar-input pl-8 text-sm w-52"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="polar-input text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="polar-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : assets.length === 0 ? (
          <EmptyState icon="📦" title="No assets found" description="Register assets or adjust filters"
            action={<button onClick={() => setShowCreate(true)} className="btn-primary">Register Asset</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="polar-table min-w-full">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>QR Code</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a: any, i: number) => (
                  <motion.tr key={a.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  >
                    <td>
                      <div className="font-medium text-polar-text text-sm">{a.name}</div>
                    </td>
                    <td>
                      <span className="text-xs text-polar-text-dim">{a.category}</span>
                    </td>
                    <td>
                      <code className="text-xs text-polar-accent font-mono bg-polar-accent/5 px-1.5 py-0.5 rounded">
                        {a.qrCode}
                      </code>
                    </td>
                    <td className="text-sm text-polar-text-dim">{a.quantity} {a.unit}</td>
                    <td><StatusPill status={a.status} /></td>
                    <td className="text-xs text-polar-text-dim">{a.location || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-polar-card border border-polar-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-polar-text">Register Asset</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-polar-text-dim" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
                <div>
                  <label className="block text-xs text-polar-text-dim mb-1.5">Asset Name</label>
                  <input className="polar-input w-full" placeholder="Ice Core Drill Kit"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-polar-text-dim mb-1.5">Category</label>
                    <select className="polar-input w-full" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-polar-text-dim mb-1.5">Unit</label>
                    <input className="polar-input w-full" placeholder="unit, kg, set..."
                      value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-polar-text-dim mb-1.5">Quantity</label>
                  <input type="number" min="1" className="polar-input w-full"
                    value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={create.isPending} className="btn-primary flex-1">
                    {create.isPending ? 'Registering...' : 'Register'}
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
