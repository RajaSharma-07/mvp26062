'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

const INCIDENT_TYPES = ['Medical Emergency', 'Equipment Failure', 'Weather Hazard', 'Terrain Hazard', 'Fire', 'Communications Loss', 'Other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export function SOSButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Medical Emergency', severity: 'high' as string, description: '' });
  const [loading, setLoading] = useState(false);
  const { addToast, user } = useAppStore();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/incidents', form);
      addToast({ type: 'success', title: '🆘 SOS Reported', message: 'HQ has been alerted', duration: 5000 });
      setOpen(false);
      setForm({ title: '', type: 'Medical Emergency', severity: 'high', description: '' });
    } catch {
      addToast({ type: 'error', title: 'SOS failed to send — check connection' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* SOS Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="sos-button"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-16 h-16 bg-polar-critical rounded-full flex items-center justify-center shadow-critical text-white font-heading font-bold text-xs tracking-widest"
        >
          {/* Pulse rings */}
          <span className="absolute inset-0 rounded-full bg-polar-critical animate-ping opacity-30" />
          <span className="absolute inset-[-4px] rounded-full border-2 border-polar-critical/40 animate-pulse-ring" />
          <div className="relative flex flex-col items-center">
            <AlertTriangle className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">SOS</span>
          </div>
        </motion.button>
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md"
            >
              {/* Glow */}
              <div className="absolute -inset-1 bg-polar-critical/20 rounded-2xl blur-xl" />
              <div className="relative bg-polar-card border border-polar-critical/40 rounded-2xl p-6 shadow-critical">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-polar-critical/10 border border-polar-critical/30 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-polar-critical" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-polar-text">🆘 Emergency Report</h2>
                      <p className="text-xs text-polar-text-dim">HQ will be alerted immediately</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="text-polar-text-dim hover:text-polar-text">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Incident Title *</label>
                    <input
                      className="polar-input w-full"
                      placeholder="Brief description of emergency"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Type</label>
                      <select
                        className="polar-input w-full"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                      >
                        {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Severity</label>
                      <select
                        className="polar-input w-full"
                        value={form.severity}
                        onChange={(e) => setForm({ ...form, severity: e.target.value })}
                      >
                        {SEVERITIES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Description</label>
                    <textarea
                      className="polar-input w-full h-24 resize-none"
                      placeholder="Describe the situation, location, and immediate needs..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading || !form.title}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 bg-polar-critical text-white font-semibold py-2 rounded-lg disabled:opacity-50 transition-all hover:bg-polar-critical/90 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                      ) : (
                        <>🆘 Send SOS</>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
