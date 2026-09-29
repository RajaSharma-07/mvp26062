'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Sidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { SOSButton } from '@/components/incidents/SOSButton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [hydrated, setHydrated] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setFetching(true);
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data);
        })
        .catch((err) => {
          // Only redirect to login on actual 401 Unauthorized
          if (err?.response?.status === 401) {
            router.push('/login');
          }
          // On network error / timeout — don't kick the user out,
          // they might be briefly offline. Just stop the spinner.
        })
        .finally(() => setFetching(false));
    }
  }, [hydrated, user, setUser, router]);

  // Show spinner only while hydrating or actively fetching /auth/me
  if (!hydrated || (!user && fetching)) {
    return (
      <div className="min-h-screen bg-polar-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-polar-accent/30 border-t-polar-accent rounded-full animate-spin" />
      </div>
    );
  }

  // If hydrated and no user (fetch done, not 401 error like network issue)
  // redirect to login as a fallback
  if (hydrated && !user && !fetching) {
    if (typeof window !== 'undefined') router.push('/login');
    return (
      <div className="min-h-screen bg-polar-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-polar-accent/30 border-t-polar-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-polar-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar — mobile only */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-polar-border bg-polar-surface">
          <SidebarToggle />
          <span className="font-heading font-bold text-polar-text">PolarOps</span>
        </div>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
      <SOSButton />
    </div>
  );
}
