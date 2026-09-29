import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'hq_admin' | 'logistics_officer' | 'station_commander' | 'field_crew';
  stationId?: string;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title: string;
  message?: string;
  duration?: number;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  isOffline: boolean;
  setOffline: (v: boolean) => void;

  queuedOps: number;
  incrementQueuedOps: () => void;
  resetQueuedOps: () => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      isOffline: false,
      setOffline: (v) => set({ isOffline: v }),

      queuedOps: 0,
      incrementQueuedOps: () => set((s) => ({ queuedOps: s.queuedOps + 1 })),
      resetQueuedOps: () => set({ queuedOps: 0 }),

      toasts: [],
      addToast: (toast) =>
        set((s) => ({ toasts: [...s.toasts, { ...toast, id: Math.random().toString(36).slice(2) }] })),
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
    }),
    {
      name: 'polarops-store',
      // Only persist user — everything else is ephemeral
      partialize: (state) => ({ user: state.user }),
    }
  )
);
