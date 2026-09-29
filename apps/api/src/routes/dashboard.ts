import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /dashboard/hq — HQ Admin full overview
router.get('/hq', async (_req, res) => {
  const [
    totalAssets,
    assetsByStatus,
    personnelOnStation,
    openIncidents,
    lowStockAssets,
    recentScans,
    recentIncidents,
    activeExpeditions,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['status'], _count: true }),
    prisma.personnel.count({ where: { status: 'on_station' } }),
    prisma.incident.count({ where: { status: { not: 'resolved' } } }),
    prisma.asset.findMany({
      where: { quantity: { lte: 5 }, status: { notIn: ['consumed', 'registered'] } },
      take: 5,
    }),
    prisma.assetMovement.findMany({
      orderBy: { scannedAt: 'desc' },
      take: 10,
      include: { asset: { select: { name: true, category: true } } },
    }),
    prisma.incident.findMany({
      where: { status: { not: 'resolved' } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { station: true },
    }),
    prisma.expedition.count({ where: { status: 'active' } }),
  ]);

  const statusMap = Object.fromEntries(
    assetsByStatus.map((s) => [s.status, s._count])
  );

  res.json({
    totalAssets,
    inTransit: statusMap.in_transit || 0,
    atStation: statusMap.at_station || 0,
    deployed: statusMap.deployed || 0,
    consumed: statusMap.consumed || 0,
    onShip: statusMap.on_ship || 0,
    packed: statusMap.packed || 0,
    warehouse: statusMap.warehouse || 0,
    personnelOnStation,
    openIncidents,
    activeExpeditions,
    lowStockAlerts: lowStockAssets,
    assetsByStatus: statusMap,
    recentScans,
    recentIncidents,
  });
});

// GET /dashboard/station/:stationId — Station Commander view
router.get('/station/:stationId', async (req, res) => {
  const { stationId } = req.params;
  const [assets, personnel, incidents, lowStock, personnelByStatus] = await Promise.all([
    prisma.asset.findMany({ where: { stationId }, take: 20 }),
    prisma.personnel.findMany({
      where: { expedition: { stationId } },
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.incident.findMany({
      where: { stationId, status: { not: 'resolved' } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.asset.findMany({
      where: { stationId, quantity: { lte: 5 }, status: { notIn: ['consumed'] } },
      take: 8,
    }),
    prisma.personnel.groupBy({
      by: ['status'],
      where: { expedition: { stationId } },
      _count: true,
    }),
  ]);

  const personnelStatusMap = Object.fromEntries(
    personnelByStatus.map((s) => [s.status, s._count])
  );

  res.json({
    assets,
    personnel,
    incidents,
    lowStock,
    personnelStatusMap,
    totalPersonnel: personnel.length,
    onStation: personnelStatusMap.on_station || 0,
    openIncidents: incidents.length,
    totalAssets: assets.length,
  });
});

// GET /dashboard/field — Field Crew personal dashboard
router.get('/field', async (req: any, res) => {
  const userId = req.user?.userId;
  const [myPersonnel, recentScans, openIncidents, myIncidents] = await Promise.all([
    prisma.personnel.findFirst({
      where: { userId },
      include: {
        expedition: { include: { station: true } },
        user: { select: { name: true, email: true, role: true } },
      },
    }),
    prisma.assetMovement.findMany({
      where: { scannedBy: userId },
      orderBy: { scannedAt: 'desc' },
      take: 10,
      include: { asset: { select: { name: true, category: true } } },
    }),
    prisma.incident.findMany({
      where: { status: { not: 'resolved' }, severity: { in: ['high', 'critical'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { station: true },
    }),
    prisma.incident.findMany({
      where: { reportedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  res.json({
    myPersonnel,
    recentScans,
    openIncidents,
    myIncidents,
    totalScans: recentScans.length,
  });
});

export default router;
