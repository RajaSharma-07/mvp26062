import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { io } from '../index';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(requireAuth);

const VALID_TRANSITIONS: Record<string, string[]> = {
  assigned: ['medical_cleared'],
  medical_cleared: ['departed_india', 'assigned'],
  departed_india: ['on_ship'],
  on_ship: ['on_station', 'returned'],
  on_station: ['returned', 'medical_evacuation'],
  returned: [],
  medical_evacuation: [],
};

// GET /personnel
router.get('/', async (req, res) => {
  const { expeditionId, status } = req.query;
  const personnel = await prisma.personnel.findMany({
    where: {
      ...(expeditionId && { expeditionId: expeditionId as string }),
      ...(status && { status: status as any }),
    },
    include: {
      user: { select: { name: true, email: true, role: true } },
      expedition: { select: { name: true } },
      logs: { orderBy: { loggedAt: 'desc' }, take: 3 },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(personnel);
});

// POST /personnel — assign user to expedition
router.post('/', async (req, res) => {
  const { userId, expeditionId, role } = req.body;
  const p = await prisma.personnel.create({
    data: { id: uuid(), userId, expeditionId, role },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  res.status(201).json(p);
});

// PATCH /personnel/:id/status
router.patch('/:id/status', async (req, res) => {
  const newStatus = req.body.newStatus || req.body.status;
  const location = req.body.location;
  const person = await prisma.personnel.findUnique({ where: { id: req.params.id } });
  if (!person) { res.status(404).json({ error: 'Not found' }); return; }

  const allowed = VALID_TRANSITIONS[person.status] || [];
  if (!allowed.includes(newStatus)) {
    res.status(400).json({ error: `Cannot transition from ${person.status} to ${newStatus}` });
    return;
  }

  const [updated] = await prisma.$transaction([
    prisma.personnel.update({
      where: { id: person.id },
      data: { status: newStatus, location },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.personnelLog.create({
      data: {
        id: uuid(),
        personnelId: person.id,
        fromStatus: person.status,
        toStatus: newStatus,
        location,
        updatedBy: req.user?.userId,
      },
    }),
  ]);

  // Auto-create critical incident on medical evacuation
  if (newStatus === 'medical_evacuation') {
    const incident = await prisma.incident.create({
      data: {
        id: uuid(),
        title: `MEDEVAC: ${updated.user.name}`,
        type: 'Medical Emergency',
        severity: 'critical',
        description: `Medical evacuation initiated for personnel at ${location || 'unknown location'}.`,
        expeditionId: person.expeditionId || undefined,
        reportedBy: req.user?.userId,
      },
    });
    io.emit('incident:new', incident);
  }

  io.emit('personnel:updated', {
    personnelId: person.id,
    name: updated.user.name,
    fromStatus: person.status,
    toStatus: newStatus,
    location,
    updatedAt: new Date(),
  });

  res.json(updated);
});

export default router;
