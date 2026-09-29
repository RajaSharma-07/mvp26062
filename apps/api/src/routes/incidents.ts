import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { io } from '../index';
import { v4 as uuid } from 'uuid';
import nodemailer from 'nodemailer';

const router = Router();
router.use(requireAuth);

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

function sendAlertEmail(incident: { title: string; severity: string; description?: string | null }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  transporter.sendMail({
    from: process.env.SMTP_FROM || 'PolarOps <hq@polarops.in>',
    to: process.env.SMTP_USER,
    subject: `🚨 [${incident.severity.toUpperCase()}] PolarOps Alert: ${incident.title}`,
    text: incident.description || incident.title,
  }).catch((e) => console.warn('Email failed:', e.message));
}

// GET /incidents
router.get('/', async (req, res) => {
  const { severity, status, expeditionId } = req.query;
  const incidents = await prisma.incident.findMany({
    where: {
      ...(severity && { severity: severity as any }),
      ...(status && { status: status as any }),
      ...(expeditionId && { expeditionId: expeditionId as string }),
    },
    include: { station: true, expedition: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(incidents);
});

// POST /incidents — create SOS
router.post('/', async (req, res) => {
  const { title, type, severity, description, stationId, expeditionId } = req.body;
  const incident = await prisma.incident.create({
    data: {
      id: uuid(),
      title,
      type,
      severity,
      description,
      stationId,
      expeditionId,
      reportedBy: req.user?.userId,
    },
    include: { station: true },
  });

  // Socket.IO broadcast to HQ room
  io.to('hq-room').emit('incident:new', incident);
  io.emit('incident:new', incident); // also broadcast globally for demo

  // Email on high/critical
  if (['high', 'critical'].includes(severity)) {
    sendAlertEmail(incident);
  }

  res.status(201).json(incident);
});

// PATCH /incidents/:id
router.patch('/:id', async (req, res) => {
  const { status, severity, resolvedAt } = req.body;
  const incident = await prisma.incident.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(severity && { severity }),
      ...(status === 'resolved' && { resolvedAt: resolvedAt ? new Date(resolvedAt) : new Date() }),
    },
  });
  io.emit('incident:updated', incident);
  res.json(incident);
});

// POST /incidents/:id/escalate
router.post('/:id/escalate', async (req, res) => {
  const incident = await prisma.incident.findUnique({ where: { id: req.params.id } });
  if (!incident) { res.status(404).json({ error: 'Not found' }); return; }

  const idx = SEVERITY_ORDER.indexOf(incident.severity);
  if (idx === SEVERITY_ORDER.length - 1) {
    res.status(400).json({ error: 'Already at critical' });
    return;
  }

  const newSeverity = SEVERITY_ORDER[idx + 1] as any;
  const updated = await prisma.incident.update({
    where: { id: incident.id },
    data: { severity: newSeverity },
  });

  io.emit('incident:updated', updated);
  if (['high', 'critical'].includes(newSeverity)) sendAlertEmail(updated);
  res.json(updated);
});

export default router;
