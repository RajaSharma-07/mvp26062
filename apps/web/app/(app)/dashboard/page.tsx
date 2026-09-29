'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatsGrid, StatCard } from '@/components/dashboard/StatsCards';
import { LiveFeed } from '@/components/dashboard/LiveFeed';
import { StationMap } from '@/components/map/StationMap';
import { useAppStore } from '@/lib/store';
import { formatStatus, timeAgo } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Users, MapPin, Activity, CheckCircle2, Clock } from 'lucide-react';

const STATUS_CHART_COLORS: Record<string, string> = {
  warehouse: '#3B82F6', packed: '#06B6D4', in_transit: '#F59E0B',
  on_ship: '#8B5CF6', at_station: '#00D4FF', deployed: '#10B981', consumed: '#475569',
};

const PERSONNEL_STATUS_COLORS: Record<string, string> = {
  assigned: '#3B82F6', medical_cleared: '#06B6D4', departed_india: '#F59E0B',
  on_ship: '#8B5CF6', on_station: '#10B981', returned: '#475569', medical_evacuation: '#EF4444',
};

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="polar-card p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-polar-border pb-3">
        <span className="text-polar-accent">{icon}</span>
        <h3 className="font-heading font-semibold text-sm text-polar-text">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── HQ Admin Dashboard ───────────────────────────────────────────────────────
function HQDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'hq'],
    queryFn: () => api.get('/dashboard/hq').then((r) => r.data),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-polar-text">Mission Control</h1>
          <p className="text-sm text-polar-text-dim mt-0.5">42nd Indian Scientific Expedition — Full Fleet Overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-polar-success bg-polar-success/10 border border-polar-success/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-polar-success animate-pulse" />
          Systems Nominal
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : data && <StatsGrid data={data} />}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {data && (
            <SectionCard title="Fleet Asset Status Distribution" icon={<Package className="w-4 h-4" />}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.assetsByStatus || {}).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v, key: k }))}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value"
                    >
                      {Object.entries(data.assetsByStatus || {}).map(([k], i) => (
                        <Cell key={i} fill={STATUS_CHART_COLORS[k] || '#475569'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0F1A2E', border: '1px solid #1E3050', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#E2E8F0' }} />
                    <Legend formatter={(v) => <span className="text-xs text-polar-text-dim capitalize">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}
          <StationMap />
        </div>
        <div className="h-[600px]">
          <LiveFeed initial={data?.recentIncidents} />
        </div>
      </div>

      {data?.lowStockAlerts?.length > 0 && (
        <div className="polar-card border border-amber-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-heading font-semibold text-sm text-amber-400">Low Stock Alerts — Action Required</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.lowStockAlerts.map((a: any) => (
              <div key={a.id} className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-polar-text truncate">{a.name}</p>
                <p className="text-xs text-amber-400">{a.quantity} {a.unit} remaining</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Station Commander Dashboard ──────────────────────────────────────────────
function CommanderDashboard({ user }: { user: any }) {
  const stationId = user?.stationId;
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'station', stationId],
    queryFn: () => api.get(`/dashboard/station/${stationId}`).then((r) => r.data),
    enabled: !!stationId,
    refetchInterval: 30_000,
  });

  const personnelChartData = data
    ? Object.entries(data.personnelStatusMap || {}).map(([k, v]) => ({
        name: formatStatus(k), value: v as number, key: k,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-polar-text">Station Command</h1>
          <p className="text-sm text-polar-text-dim mt-0.5">Local operations — personnel, assets & incidents</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-polar-accent bg-polar-accent/10 border border-polar-accent/20 px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3" />
          {stationId ? stationId.toUpperCase() : 'My Station'}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Personnel" value={data.totalPersonnel} color="accent" delay={0} />
          <StatCard icon="🏔️" label="On Station" value={data.onStation} color="success" delay={0.05} />
          <StatCard icon="📦" label="Station Assets" value={data.totalAssets} color="accent" delay={0.1} />
          <StatCard icon="🚨" label="Open Incidents" value={data.openIncidents} color={data.openIncidents > 0 ? 'critical' : 'muted'} delay={0.15} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {data && personnelChartData.length > 0 && (
            <SectionCard title="Personnel Status Breakdown" icon={<Users className="w-4 h-4" />}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={personnelChartData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0F1A2E', border: '1px solid #1E3050', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {personnelChartData.map((entry, i) => (
                        <Cell key={i} fill={PERSONNEL_STATUS_COLORS[entry.key] || '#475569'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}
          <StationMap />
        </div>

        <div className="space-y-4">
          <SectionCard title="Open Incidents" icon={<AlertTriangle className="w-4 h-4" />}>
            {!data?.incidents?.length ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-polar-success mx-auto mb-2 opacity-50" />
                <p className="text-xs text-polar-text-dim">All clear — no open incidents</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.incidents.map((inc: any) => (
                  <div key={inc.id} className={`px-3 py-2 rounded-lg border text-xs ${inc.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                    <p className="font-medium text-polar-text truncate">{inc.title}</p>
                    <p className="text-polar-text-dim mt-0.5">{inc.severity?.toUpperCase()} · {inc.type}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {data?.lowStock?.length > 0 && (
            <SectionCard title="Low Stock — Resupply Needed" icon={<Package className="w-4 h-4" />}>
              <div className="space-y-2">
                {data.lowStock.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs text-polar-text truncate flex-1">{a.name}</p>
                    <span className="text-xs text-amber-400 ml-2 flex-shrink-0">{a.quantity} left</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Field Crew Dashboard ─────────────────────────────────────────────────────
function FieldCrewDashboard({ user }: { user: any }) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'field'],
    queryFn: () => api.get('/dashboard/field').then((r) => r.data),
    refetchInterval: 60_000,
  });

  const me = data?.myPersonnel;
  const statusColor: Record<string, string> = {
    on_station: 'text-polar-success border-polar-success/30 bg-polar-success/10',
    departed_india: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    on_ship: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    assigned: 'text-polar-accent border-polar-accent/30 bg-polar-accent/10',
    medical_evacuation: 'text-red-400 border-red-500/30 bg-red-500/10',
    returned: 'text-polar-text-dim border-polar-border bg-polar-card',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-polar-text">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-polar-text-dim mt-0.5">Field Operations — Personal Dashboard</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : (
        <>
          {me && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="polar-card p-5 border border-polar-accent/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-polar-accent/20 border-2 border-polar-accent/40 flex items-center justify-center text-polar-accent font-bold text-xl">
                  {user?.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-heading font-bold text-polar-text text-lg">{user?.name}</p>
                  <p className="text-sm text-polar-text-dim">{me.role} · {me.expedition?.station?.name || 'Unassigned'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[me.status] || 'text-polar-text-dim border-polar-border'}`}>
                      {formatStatus(me.status)}
                    </span>
                    {me.location && (
                      <span className="text-xs text-polar-text-dim flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {me.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-polar-text-dim">Expedition</p>
                  <p className="text-sm font-semibold text-polar-accent">{me.expedition?.name || '42nd'}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon="📦" label="Assets Scanned" value={data?.totalScans || 0} color="accent" delay={0} />
            <StatCard icon="🚨" label="Active Alerts" value={data?.openIncidents?.length || 0} color={data?.openIncidents?.length > 0 ? 'critical' : 'muted'} delay={0.05} />
            <StatCard icon="📋" label="My Reports" value={data?.myIncidents?.length || 0} color="warning" delay={0.1} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="My Recent Scans" icon={<Activity className="w-4 h-4" />}>
              {!data?.recentScans?.length ? (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 text-polar-text-dim/30 mx-auto mb-2" />
                  <p className="text-xs text-polar-text-dim">No scans yet — use Assets → Scan QR</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.recentScans.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-polar-border/50 last:border-0">
                      <span className="text-base">📦</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-polar-text font-medium truncate">{s.asset?.name}</p>
                        <p className="text-xs text-polar-text-dim">{formatStatus(s.toStatus)}</p>
                      </div>
                      <span className="text-[10px] text-polar-text-dim flex-shrink-0">{timeAgo(new Date(s.scannedAt))}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Active Alerts" icon={<AlertTriangle className="w-4 h-4" />}>
              {!data?.openIncidents?.length ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-polar-success mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-polar-text-dim">No active alerts — all clear</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.openIncidents.map((inc: any) => (
                    <div key={inc.id} className={`px-3 py-2.5 rounded-lg border text-xs ${inc.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                      <div className="flex items-center gap-2">
                        <span>{inc.severity === 'critical' ? '🚨' : '⚠️'}</span>
                        <p className="font-medium text-polar-text truncate">{inc.title}</p>
                      </div>
                      <p className="text-polar-text-dim mt-0.5 pl-5">{inc.station?.name} · {timeAgo(new Date(inc.createdAt))}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {data?.myIncidents?.length > 0 && (
            <SectionCard title="My Incident Reports" icon={<Clock className="w-4 h-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.myIncidents.map((inc: any) => (
                  <div key={inc.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-polar-border bg-polar-card/50">
                    <span className="text-base mt-0.5">{inc.status === 'resolved' ? '✅' : '⏳'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-polar-text font-medium truncate">{inc.title}</p>
                      <p className="text-xs text-polar-text-dim">{formatStatus(inc.status)} · {timeAgo(new Date(inc.createdAt))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}

// ─── Root: Route by role ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAppStore();
  if (!user) return null;
  if (user.role === 'hq_admin' || user.role === 'logistics_officer') return <HQDashboard />;
  if (user.role === 'station_commander') return <CommanderDashboard user={user} />;
  return <FieldCrewDashboard user={user} />;
}

