'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { StatusPill } from '@/components/ui/primitives';

const ASSET_STATUSES = ['packed', 'in_transit', 'on_ship', 'at_station', 'deployed', 'consumed'];

type ScanState = 'scanning' | 'found' | 'confirming' | 'success' | 'error';

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<ScanState>('scanning');
  const [scannedCode, setScannedCode] = useState('');
  const [asset, setAsset] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const { addToast } = useAppStore();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        rafRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (e: any) {
      setCameraError('Camera access denied. Please allow camera permissions and refresh.');
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function scanFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });

    if (code?.data) {
      handleQRFound(code.data);
      return;
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }

  async function handleQRFound(qrCode: string) {
    stopCamera();
    setState('found');
    setScannedCode(qrCode);
    try {
      const { data } = await api.get(`/assets?search=${qrCode}`).catch(() => api.get('/assets'));
      // Try to find by qrCode match
      const found = Array.isArray(data) ? data.find((a: any) => a.qrCode === qrCode) : null;
      if (!found) {
        setState('error');
        setError(`No asset found with QR code: ${qrCode}`);
        return;
      }
      setAsset(found);
      setNewStatus(found.status);
      setState('confirming');
    } catch {
      setState('error');
      setError('Failed to look up asset');
    }
  }

  async function confirmScan() {
    setState('scanning'); // show loading briefly
    try {
      await api.post('/assets/scan', { qrCode: scannedCode, newStatus, location });
      setState('success');
      addToast({ type: 'success', title: `✅ ${asset.name} → ${newStatus.replace(/_/g, ' ')}`, duration: 4000 });
    } catch (e: any) {
      setState('error');
      setError(e.response?.data?.error || 'Scan failed');
    }
  }

  function reset() {
    setState('scanning');
    setAsset(null);
    setScannedCode('');
    setError('');
    startCamera();
  }

  return (
    <div className="polar-card overflow-hidden max-w-lg mx-auto">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-polar-border">
        <Camera className="w-4 h-4 text-polar-accent" />
        <h2 className="font-heading font-semibold text-sm">QR Asset Scanner</h2>
        {state === 'scanning' && (
          <span className="ml-auto text-xs text-polar-accent flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-polar-accent animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Camera View */}
      <AnimatePresence mode="wait">
        {state === 'scanning' && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative bg-black"
          >
            {cameraError ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <XCircle className="w-10 h-10 text-polar-critical mb-3" />
                <p className="text-sm text-polar-text-dim">{cameraError}</p>
                {/* Demo mode fallback */}
                <button
                  onClick={() => handleQRFound('POLAR-EXP4-0001')}
                  className="mt-4 btn-primary text-xs px-3 py-1.5"
                >
                  Demo: Scan Ice Core Drill Kit
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scan frame overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-polar-accent rounded-tl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-polar-accent rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-polar-accent rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-polar-accent rounded-br" />
                    {/* Scanning line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-polar-accent/60"
                      animate={{ y: [0, 192, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">
                  Point camera at QR code
                </p>
              </>
            )}
          </motion.div>
        )}

        {state === 'confirming' && asset && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 space-y-4"
          >
            <div className="bg-polar-success/10 border border-polar-success/30 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-polar-success flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-polar-text">{asset.name}</p>
                <p className="text-xs text-polar-text-dim">{asset.category} · {asset.qrCode}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-polar-text-dim">Current:</span>
              <StatusPill status={asset.status} />
            </div>

            <div>
              <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Update Status To</label>
              <select
                className="polar-input w-full"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-polar-text-dim mb-1.5 font-medium">Location (optional)</label>
              <input
                className="polar-input w-full"
                placeholder="e.g. Maitri Station, Field Site Alpha"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1">Rescan</button>
              <button
                onClick={confirmScan}
                disabled={newStatus === asset.status}
                className="btn-primary flex-1"
              >
                Confirm Scan
              </button>
            </div>
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-8 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <CheckCircle className="w-16 h-16 text-polar-success mb-4" />
            </motion.div>
            <h3 className="font-heading font-bold text-polar-text mb-1">Scan Recorded</h3>
            <p className="text-sm text-polar-text-dim mb-5">{asset?.name} → {newStatus.replace(/_/g, ' ')}</p>
            <button onClick={reset} className="btn-primary">Scan Another</button>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-8 flex flex-col items-center text-center"
          >
            <XCircle className="w-12 h-12 text-polar-critical mb-3" />
            <p className="text-sm text-polar-text-dim mb-4">{error}</p>
            <button onClick={reset} className="btn-secondary">Try Again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
