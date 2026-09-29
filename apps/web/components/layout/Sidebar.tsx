'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Users, AlertTriangle,
  Map, LogOut, Menu, X, Wifi, WifiOff, ChevronRight,
  Snowflake
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { api, flushOfflineQueue } from '@/lib/api';
import { cn } from '@/lib/utils';
import { getQueueSize } from '@/lib/offline';
import { useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['hq_admin', 'logistics_officer', 'station_commander', 'field_crew'] },
  { href: '/expeditions', icon: Map, label: 'Expeditions', roles: ['hq_admin', 'logistics_officer', 'station_commander'] },
  { href: '/assets', icon: Package, label: 'Assets & Cargo', roles: ['hq_admin', 'logistics_officer', 'station_commander', 'field_crew'] },
  { href: '/personnel', icon: Users, label: 'Personnel', roles: ['hq_admin', 'logistics_officer', 'station_commander', 'field_crew'] },
  { href: '/incidents', icon: AlertTriangle, label: 'Incidents', roles: ['hq_admin', 'logistics_officer', 'station_commander', 'field_crew'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isOffline, setOffline, queuedOps, sidebarOpen, setSidebarOpen, addToast } = useAppStore();
  const [syncing, setSyncing] = useState(false);

  // Join HQ room on connect
  useEffect(() => {
    if (user?.role === 'hq_admin') {
      const socket = getSocket();
      socket.emit('join:room', 'hq-room');
    }
  }, [user]);

  const filteredNav = NAV.filter((n) => user && n.roles.includes(user.role));

  async function handleOfflineToggle() {
    const goingOnline = isOffline;
    setOffline(!isOffline);

    if (goingOnline && queuedOps > 0) {
      setSyncing(true);
      try {
        const synced = await flushOfflineQueue();
        addToast({ type: 'success', title: `✅ ${synced} ops synced to HQ`, duration: 4000 });
      } catch {
        addToast({ type: 'error', title: 'Sync failed — some ops could not be replayed' });
      } finally {
        setSyncing(false);
      }
    }
  }

  async function handleLogout() {
    // Always clear local state and redirect — regardless of API outcome.
    // The API call is best-effort (clears httpOnly cookies server-side).
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — token may already be expired or user is offline
    } finally {
      // Disconnect socket cleanly
      try { disconnectSocket(); } catch { /* ignore */ }
      useAppStore.getState().setUser(null);
      router.push('/login');
    }
  }

  const roleLabel: Record<string, string> = {
    hq_admin: 'HQ Admin',
    logistics_officer: 'Logistics Officer',
    station_commander: 'Station Commander',
    field_crew: 'Field Crew',
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-polar-surface border-r border-polar-border z-30 flex flex-col transition-transform duration-300 ease-in-out',
          // Desktop: always visible. Mobile: slide based on sidebarOpen
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-polar-border">
          <div className="w-9 h-9 rounded-lg bg-polar-accent/10 border border-polar-accent/20 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-polar-accent" />
          </div>
          <div>
            <div className="font-heading font-bold text-polar-text text-sm">PolarOps</div>
            <div className="text-[10px] text-polar-text-dim">42nd Expedition</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-polar-text-dim hover:text-polar-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-polar-card border border-polar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-polar-accent/20 border border-polar-accent/30 flex items-center justify-center text-polar-accent font-semibold text-sm">
                {user.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-polar-text truncate">{user.name}</div>
                <div className="text-[10px] text-polar-accent">{roleLabel[user.role]}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {filteredNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'text-polar-accent bg-polar-accent/10'
                    : 'text-polar-text-dim hover:text-polar-text hover:bg-polar-card'
                )}>
                  {active && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 top-0 h-full w-0.5 bg-polar-accent rounded-full"
                    />
                  )}
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom — Offline Toggle + Logout */}
        <div className="px-3 pb-4 space-y-2 border-t border-polar-border pt-3">
          {/* Offline Toggle */}
          <button
            onClick={handleOfflineToggle}
            disabled={syncing}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isOffline
                ? 'text-polar-critical bg-polar-critical/10 border border-polar-critical/30'
                : 'text-polar-text-dim hover:text-polar-text hover:bg-polar-card'
            )}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="flex-1 text-left">
              {syncing ? 'Syncing...' : isOffline ? 'Offline Mode' : 'Online'}
            </span>
            {isOffline && queuedOps > 0 && (
              <span className="text-[10px] bg-polar-critical text-white rounded-full px-1.5 py-0.5">
                {queuedOps}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-polar-text-dim hover:text-polar-critical hover:bg-polar-critical/5 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Mobile hamburger toggle ──────────────────────────────────────────────────
export function SidebarToggle() {
  const { setSidebarOpen } = useAppStore();
  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 rounded-lg border border-polar-border text-polar-text-dim hover:text-polar-text transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
