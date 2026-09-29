'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

// ── Aurora Canvas Background ─────────────────────────────────────────────────
function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let t = 0;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = '#080E1A';
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Aurora layers
      const layers = [
        { x: 0.3 + Math.sin(t * 0.3) * 0.15, y: 0.4, r: canvas!.width * 0.6, color: 'rgba(0,212,255,0.06)' },
        { x: 0.7 + Math.sin(t * 0.2 + 1) * 0.1, y: 0.3, r: canvas!.width * 0.5, color: 'rgba(0,100,200,0.05)' },
        { x: 0.5 + Math.cos(t * 0.25) * 0.2, y: 0.6, r: canvas!.width * 0.4, color: 'rgba(0,212,255,0.04)' },
        { x: 0.2 + Math.cos(t * 0.15 + 2) * 0.1, y: 0.2, r: canvas!.width * 0.35, color: 'rgba(16,185,129,0.03)' },
      ];

      layers.forEach(({ x, y, r, color }) => {
        const grd = ctx.createRadialGradient(
          x * canvas!.width, y * canvas!.height, 0,
          x * canvas!.width, y * canvas!.height, r
        );
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      });

      // Grid overlay
      ctx.strokeStyle = 'rgba(30,48,80,0.4)';
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas!.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas!.height); ctx.stroke();
      }
      for (let y = 0; y < canvas!.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas!.width, y); ctx.stroke();
      }

      t += 0.005;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
}

// ── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const DEMO_ACCOUNTS = [
    { label: 'HQ Admin', email: 'hq@polar.ops', icon: '🛡️' },
    { label: 'Station Commander', email: 'station@polar.ops', icon: '⚓' },
    { label: 'Field Crew', email: 'crew@polar.ops', icon: '🧭' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      router.push('/dashboard');
    } catch {
      setError('Invalid credentials. Try demo1234 as password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AuroraBackground />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-polar-accent/40"
          style={{
            left: `${10 + i * 11}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-polar-accent/20 to-cyan-500/10 rounded-2xl blur-xl" />

        <div className="relative bg-polar-card/90 backdrop-blur-xl border border-polar-border rounded-2xl p-8 shadow-polar">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-5xl mb-3 inline-block"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🧊
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-polar-text">PolarOps</h1>
            <p className="text-polar-text-dim text-sm mt-1">
              Indian Antarctic Expedition Logistics
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-polar-accent bg-polar-accent/10 border border-polar-accent/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-polar-success animate-pulse" />
              42nd Expedition — Active
            </div>
          </div>

          {/* Demo Quick Login */}
          <div className="mb-5">
            <p className="text-xs text-polar-text-dim mb-2 font-medium uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('demo1234'); }}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-polar-border hover:border-polar-accent/50 hover:bg-polar-surface/60 transition-all duration-150 text-center"
                >
                  <span className="text-lg">{acc.icon}</span>
                  <span className="text-[10px] text-polar-text-dim leading-tight">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-polar-border" />
            <span className="text-xs text-polar-text-dim">or enter manually</span>
            <div className="flex-1 h-px bg-polar-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hq@polar.ops"
                className="polar-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="polar-input w-full"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-polar-critical text-sm flex items-center gap-2"
              >
                <span>⚠️</span> {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 h-11"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-polar-bg/30 border-t-polar-bg rounded-full"
                  />
                  Authenticating...
                </>
              ) : (
                'Access Mission Control'
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-polar-text-dim mt-4">
            All demo accounts use password: <code className="text-polar-accent font-mono">demo1234</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
