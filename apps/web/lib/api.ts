import axios from 'axios';
import { getOfflineQueue, addToOfflineQueue } from './offline';
import { useAppStore } from './store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 10_000, // 10s — prevents infinite spinners when API is unreachable
});

// ── Request interceptor — offline queue ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const isOffline = typeof window !== 'undefined' && useAppStore.getState().isOffline;
  const isMutation = ['post', 'patch', 'put', 'delete'].includes(config.method || '');

  if (isOffline && isMutation) {
    addToOfflineQueue({
      url: config.url || '',
      method: config.method || 'post',
      data: config.data,
      timestamp: Date.now(),
    });
    useAppStore.getState().incrementQueuedOps();
    // Return a cancelled request by throwing a specific error
    throw Object.assign(new Error('OFFLINE_QUEUED'), { isOfflineQueued: true });
  }

  return config;
});

// ── Response interceptor — 401 handling ─────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.isOfflineQueued) return Promise.resolve({ data: null, _offlineQueued: true });
    if (err.response?.status === 401) {
      try {
        await api.post('/auth/refresh');
        return api.request(err.config);
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export async function flushOfflineQueue(onProgress?: (synced: number, total: number) => void) {
  const queue = getOfflineQueue();
  let synced = 0;
  for (const op of queue) {
    try {
      await api.request({ url: op.url, method: op.method as any, data: op.data });
      synced++;
      onProgress?.(synced, queue.length);
    } catch (e) {
      console.warn('Failed to replay op:', op, e);
    }
  }
  localStorage.removeItem('polarops_offline_queue');
  useAppStore.getState().resetQueuedOps();
  return synced;
}
