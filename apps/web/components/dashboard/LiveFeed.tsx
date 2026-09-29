'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { useAppStore } from '@/lib/store';
import { formatStatus, timeAgo } from '@/lib/utils';
import { Activity, Package, Users, AlertTriangle } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'scan' | 'personnel' | 'incident';
  icon: string;
  title: string;
  detail: string;
  time: Date;
}

function eventToFeedItem(type: string, payload: any): FeedItem {
  const id = Math.random().toString(36).slice(2);
  if (type === 'asset:scanned') {
    return {
      id, type: 'scan',
      icon: '📦',
      title: `${payload.assetName} — ${formatStatus(payload.toStatus)}`,
      detail: `Scanned by ${payload.scannedBy || 'Unknown'} ${payload.location ? `at ${payload.location}` : ''}`,
      time: new Date(payload.scannedAt),
    };
  }
  if (type === 'personnel:updated') {
    return {
      id, type: 'personnel',
      icon: '👤',
      title: `${payload.name}: ${formatStatus(payload.fromStatus)} → ${formatStatus(payload.toStatus)}`,
      detail: payload.location || '',
      time: new Date(payload.updatedAt),
    };
  }
  // incident:new
  return {
    id, type: 'incident',
    icon: payload.severity === 'critical' ? '🚨' : payload.severity === 'high' ? '⚠️' : 'ℹ️',
    title: payload.title,
    detail: `${payload.severity?.toUpperCase()} — ${payload.type}`,
    time: new Date(payload.createdAt),
  };
}

export function LiveFeed({ initial }: { initial?: any[] }) {
  const { addToast } = useAppStore();
  const [items, setItems] = useState<FeedItem[]>(
    (initial || []).map((e: any) => ({
      id: e.id,
      type: e.severity ? 'incident' : 'scan',
      icon: e.severity === 'critical' ? '🚨' : '📦',
      title: e.title || `${e.asset?.name} scanned`,
      detail: e.type || e.toStatus || '',
      time: new Date(e.createdAt || e.scannedAt),
    }))
  );

  useEffect(() => {
    const socket = getSocket();

    const handle = (type: string) => (payload: any) => {
      const item = eventToFeedItem(type, payload);
      setItems((prev) => [item, ...prev].slice(0, 50));

      if (type === 'incident:new') {
        addToast({
          type: payload.severity === 'critical' ? 'critical' : 'warning',
          title: `🚨 ${payload.title}`,
          message: `${payload.severity?.toUpperCase()} — ${payload.type}`,
          duration: 8000,
        });
      }
    };

    socket.on('asset:scanned', handle('asset:scanned'));
    socket.on('personnel:updated', handle('personnel:updated'));
    socket.on('incident:new', handle('incident:new'));

    return () => {
      socket.off('asset:scanned');
      socket.off('personnel:updated');
      socket.off('incident:new');
    };
  }, [addToast]);

  return (
    <div className="polar-card h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-polar-border">
        <Activity className="w-4 h-4 text-polar-accent" />
        <h3 className="font-heading font-semibold text-sm text-polar-text">Live Activity</h3>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-polar-success">
          <span className="w-1.5 h-1.5 rounded-full bg-polar-success animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Activity className="w-8 h-8 text-polar-text-dim/30 mb-2" />
            <p className="text-sm text-polar-text-dim">No activity yet</p>
          </div>
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-start gap-3 px-4 py-3 border-b border-polar-border/50 hover:bg-polar-surface/30 transition-colors"
            >
              <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-polar-text font-medium truncate">{item.title}</p>
                <p className="text-xs text-polar-text-dim truncate">{item.detail}</p>
              </div>
              <span className="text-[10px] text-polar-text-dim flex-shrink-0">
                {timeAgo(item.time)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
