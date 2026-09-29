import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { io } from '../index';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(requireAuth);

const LOW_STOCK_THRESHOLD: Record<string, number> = {
  'Food & Nutrition': 10,
  'Fuel & Energy': 5,
  Medical: 2,
  default: 3,
};

// GET /assets
router.get('/', async (req, res) => {
  const { status, category, expeditionId, search } = req.query;
  const assets = await prisma.asset.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(category && { category: category as string }),
      ...(expeditionId && { expeditionId: expeditionId as string }),
      ...(search && { name: { contains: search as string } }),
    },
    include: { station: true, expedition: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(assets);
});

// GET /assets/alerts — low stock
router.get('/alerts', async (_req, res) => {
  const assets = await prisma.asset.findMany({
    where: { status: { notIn: ['consumed', 'registered'] } },
  });
  const alerts = assets.filter((a) => {
    const threshold = LOW_STOCK_THRESHOLD[a.category] ?? LOW_STOCK_THRESHOLD.default;
    return a.quantity <= threshold;
  });
  res.json(alerts);
});

// POST /assets — register new asset
router.post('/', async (req, res) => {
  const { name, category, quantity, unit, stationId, expeditionId } = req.body;
  const qrCode = `POLAR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const asset = await prisma.asset.create({
    data: {
      id: uuid(),
      name,
      category,
      qrCode,
      quantity: Number(quantity) || 1,
      unit: unit || 'units',
      stationId,
      expeditionId,
    },
  });
  res.status(201).json(asset);
});

// POST /assets/scan — QR scan → update status + log movement
router.post('/scan', async (req, res) => {
  const { qrCode, newStatus, location, notes } = req.body;
  if (!qrCode || !newStatus) {
    res.status(400).json({ error: 'qrCode and newStatus required' });
    return;
  }

  const asset = await prisma.asset.findUnique({ where: { qrCode } });
  if (!asset) { res.status(404).json({ error: 'Asset not found' }); return; }

  const [updated] = await prisma.$transaction([
    prisma.asset.update({
      where: { id: asset.id },
      data: { status: newStatus, location, lastScanAt: new Date() },
    }),
    prisma.assetMovement.create({
      data: {
        id: uuid(),
        assetId: asset.id,
        fromStatus: asset.status,
        toStatus: newStatus,
        location,
        scannedBy: req.user?.userId,
        notes,
      },
    }),
  ]);

  // Real-time broadcast
  io.emit('asset:scanned', {
    assetId: asset.id,
    assetName: asset.name,
    qrCode,
    fromStatus: asset.status,
    toStatus: newStatus,
    location,
    scannedBy: req.user?.email,
    scannedAt: new Date(),
  });

  res.json(updated);
});

// GET /assets/:id/movements
router.get('/:id/movements', async (req, res) => {
  const movements = await prisma.assetMovement.findMany({
    where: { assetId: req.params.id },
    orderBy: { scannedAt: 'desc' },
  });
  res.json(movements);
});

// GET /assets/:id
router.get('/:id', async (req, res) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: { movements: { orderBy: { scannedAt: 'desc' } }, station: true, expedition: true },
  });
  if (!asset) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(asset);
});

export default router;
