import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRouter from './routes/auth';
import expeditionsRouter from './routes/expeditions';
import assetsRouter from './routes/assets';
import personnelRouter from './routes/personnel';
import incidentsRouter from './routes/incidents';
import dashboardRouter from './routes/dashboard';
import { registerSocketHandlers } from './socket/handlers';

const app = express();
const httpServer = createServer(app);

// ── Socket.IO ────────────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

// Optionally attach Redis adapter (graceful fallback to in-memory)
async function setupRedisAdapter() {
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('📡 Socket.IO running in-memory adapter (Polar Edge mode)');
    return;
  }
  try {
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { default: Redis } = await import('ioredis');
    const pub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    pub.on('error', () => {});
    const sub = pub.duplicate();
    sub.on('error', () => {});
    await Promise.all([pub.connect(), sub.connect()]);
    io.adapter(createAdapter(pub, sub));
    console.log('✅ Socket.IO Redis adapter ready');
  } catch (e: any) {
    console.warn('⚠️  Redis adapter unavailable — using in-memory:', e.message);
  }
}
setupRedisAdapter();

registerSocketHandlers(io);

// ── Express Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/auth', authRouter);
app.use('/expeditions', expeditionsRouter);
app.use('/assets', assetsRouter);
app.use('/personnel', personnelRouter);
app.use('/incidents', incidentsRouter);
app.use('/dashboard', dashboardRouter);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 PolarOps API running on http://localhost:${PORT}`);
});
