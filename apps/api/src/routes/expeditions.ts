import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(requireAuth);

// GET /expeditions
router.get('/', async (req, res) => {
  const { status } = req.query;
  const expeditions = await prisma.expedition.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      station: true,
      _count: { select: { personnel: true, assets: true, incidents: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(expeditions);
});

// POST /expeditions
router.post('/', requireRole('hq_admin', 'logistics_officer'), async (req, res) => {
  const { name, startDate, endDate, stationId } = req.body;
  const expedition = await prisma.expedition.create({
    data: { name, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : undefined, stationId },
    include: { station: true },
  });
  res.status(201).json(expedition);
});

// GET /expeditions/:id
router.get('/:id', async (req, res) => {
  const expedition = await prisma.expedition.findUnique({
    where: { id: req.params.id },
    include: {
      station: true,
      personnel: { include: { user: { select: { name: true, email: true, role: true } } } },
      assets: { orderBy: { createdAt: 'desc' } },
      incidents: { orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { personnel: true, assets: true, incidents: true } },
    },
  });
  if (!expedition) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(expedition);
});

// PATCH /expeditions/:id
router.patch('/:id', requireRole('hq_admin', 'station_commander'), async (req, res) => {
  const { status, name, endDate } = req.body;
  const expedition = await prisma.expedition.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(name && { name }),
      ...(endDate && { endDate: new Date(endDate) }),
    },
  });
  res.json(expedition);
});

export default router;
