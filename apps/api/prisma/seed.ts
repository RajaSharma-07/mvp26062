import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 Seeding PolarOps database...');

  // ── Stations ────────────────────────────────────────────────────────────────
  const maitri = await prisma.station.upsert({
    where: { id: 'station-maitri' },
    update: {},
    create: {
      id: 'station-maitri',
      name: 'Maitri Station',
      lat: -70.7669,
      lng: 11.7347,
    },
  });

  const bharati = await prisma.station.upsert({
    where: { id: 'station-bharati' },
    update: {},
    create: {
      id: 'station-bharati',
      name: 'Bharati Station',
      lat: -69.4071,
      lng: 76.1924,
    },
  });

  console.log('✅ Stations: Maitri + Bharati');

  // ── Users ────────────────────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const hqUser = await prisma.user.upsert({
    where: { email: 'hq@polar.ops' },
    update: {},
    create: {
      id: 'user-hq',
      name: 'Rear Admiral Priya Mehta',
      email: 'hq@polar.ops',
      password: hash('demo1234'),
      role: 'hq_admin',
    },
  });

  const commanderUser = await prisma.user.upsert({
    where: { email: 'station@polar.ops' },
    update: {},
    create: {
      id: 'user-commander',
      name: 'Dr. Vikram Singh',
      email: 'station@polar.ops',
      password: hash('demo1234'),
      role: 'station_commander',
      stationId: maitri.id,
    },
  });

  const crewUser = await prisma.user.upsert({
    where: { email: 'crew@polar.ops' },
    update: {},
    create: {
      id: 'user-crew',
      name: 'Lt. Arjun Patel',
      email: 'crew@polar.ops',
      password: hash('demo1234'),
      role: 'field_crew',
    },
  });

  // Extra personnel users
  const personnelData = [
    { name: 'Dr. Sunita Rao', email: 'sunita@polar.ops', role: 'hq_admin' },
    { name: 'Cmdr. Rahul Sharma', email: 'rahul@polar.ops', role: 'logistics_officer' },
    { name: 'Dr. Meena Iyer', email: 'meena@polar.ops', role: 'field_crew' },
    { name: 'Lt. Karan Gupta', email: 'karan@polar.ops', role: 'field_crew' },
    { name: 'Dr. Anjali Nair', email: 'anjali@polar.ops', role: 'field_crew' },
    { name: 'Prof. Ravi Kumar', email: 'ravi@polar.ops', role: 'field_crew' },
    { name: 'Lt. Sonia Patel', email: 'sonia@polar.ops', role: 'field_crew' },
    { name: 'Dr. Arun Joshi', email: 'arun@polar.ops', role: 'field_crew' },
    { name: 'Cmdr. Deepak Mishra', email: 'deepak@polar.ops', role: 'station_commander' },
    { name: 'Dr. Priya Reddy', email: 'priya.r@polar.ops', role: 'field_crew' },
    { name: 'Lt. Raj Verma', email: 'raj@polar.ops', role: 'field_crew' },
    { name: 'Dr. Kavya Pillai', email: 'kavya@polar.ops', role: 'field_crew' },
    { name: 'Lt. Nikhil Sinha', email: 'nikhil@polar.ops', role: 'field_crew' },
    { name: 'Dr. Ananya Das', email: 'ananya@polar.ops', role: 'field_crew' },
    { name: 'Cmdr. Vivek Tiwari', email: 'vivek@polar.ops', role: 'logistics_officer' },
    { name: 'Dr. Rekha Bose', email: 'rekha@polar.ops', role: 'field_crew' },
    { name: 'Lt. Suresh Nair', email: 'suresh@polar.ops', role: 'field_crew' },
  ];

  const extraUsers = [];
  for (const p of personnelData) {
    const u = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        id: uuid(),
        name: p.name,
        email: p.email,
        password: hash('demo1234'),
        role: p.role as any,
      },
    });
    extraUsers.push(u);
  }

  console.log('✅ Users: 20 seeded (3 demo + 17 personnel)');

  // ── Expedition ───────────────────────────────────────────────────────────────
  const expedition = await prisma.expedition.upsert({
    where: { id: 'exp-42' },
    update: {},
    create: {
      id: 'exp-42',
      name: '42nd Indian Scientific Expedition to Antarctica',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2027-03-31'),
      status: 'active',
      stationId: maitri.id,
    },
  });

  const expedition2 = await prisma.expedition.upsert({
    where: { id: 'exp-41' },
    update: {},
    create: {
      id: 'exp-41',
      name: '41st Indian Scientific Expedition to Antarctica',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-03-31'),
      status: 'completed',
      stationId: bharati.id,
    },
  });

  console.log('✅ Expeditions: 42nd (active) + 41st (completed)');

  // ── Personnel Assignments ────────────────────────────────────────────────────
  const allPersonnelUsers = [commanderUser, crewUser, ...extraUsers];
  const personnelRoles = [
    'Station Commander', 'Glaciologist', 'Meteorologist', 'Marine Biologist',
    'Logistics Officer', 'Medical Officer', 'Communications Engineer',
    'Mechanical Engineer', 'Geophysicist', 'Oceanographer',
    'Atmospheric Scientist', 'Survey Officer', 'Cook & Catering',
    'Environmental Scientist', 'IT Engineer', 'Field Guide',
    'Seismologist', 'Remote Sensing Specialist', 'Base Maintenance',
  ];
  const personnelStatuses: any[] = [
    'on_station', 'on_station', 'on_station', 'on_station',
    'on_ship', 'on_station', 'on_station', 'on_station',
    'on_station', 'departed_india', 'medical_cleared', 'on_station',
    'on_station', 'on_station', 'on_station', 'on_ship',
    'on_station', 'on_station', 'on_station',
  ];

  for (let i = 0; i < allPersonnelUsers.length && i < personnelRoles.length; i++) {
    await prisma.personnel.upsert({
      where: { userId: allPersonnelUsers[i].id },
      update: {},
      create: {
        id: uuid(),
        userId: allPersonnelUsers[i].id,
        expeditionId: expedition.id,
        role: personnelRoles[i],
        status: personnelStatuses[i],
        location: personnelStatuses[i] === 'on_station' ? 'Maitri Station' : undefined,
      },
    });
  }

  console.log('✅ Personnel: 19 assigned to 42nd expedition');

  // ── Assets ───────────────────────────────────────────────────────────────────
  const assetDefs = [
    // Instruments
    { name: 'Ice Core Drill Kit', category: 'Scientific Equipment', unit: 'set', status: 'at_station', qty: 1 },
    { name: 'GPS Survey Unit', category: 'Navigation', unit: 'unit', status: 'deployed', qty: 3 },
    { name: 'Automatic Weather Station', category: 'Meteorology', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Seismic Recorder', category: 'Scientific Equipment', unit: 'unit', status: 'deployed', qty: 2 },
    { name: 'CTD Profiler', category: 'Oceanography', unit: 'unit', status: 'packed', qty: 1 },
    { name: 'LIDAR System', category: 'Remote Sensing', unit: 'unit', status: 'in_transit', qty: 1 },
    { name: 'Underwater ROV', category: 'Marine Research', unit: 'unit', status: 'at_station', qty: 1 },
    { name: 'Radiosonde Set', category: 'Meteorology', unit: 'set', status: 'deployed', qty: 4 },
    { name: 'Magnetometer', category: 'Geophysics', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Snow Sampler Kit', category: 'Glaciology', unit: 'kit', status: 'deployed', qty: 5 },
    // Survival & Safety
    { name: 'Arctic Survival Tent', category: 'Shelter', unit: 'unit', status: 'at_station', qty: 8 },
    { name: 'Emergency Ration Pack (7-day)', category: 'Food & Nutrition', unit: 'pack', status: 'warehouse', qty: 50 },
    { name: 'Extreme Cold Weather Suit', category: 'Clothing', unit: 'unit', status: 'at_station', qty: 25 },
    { name: 'Avalanche Rescue Beacon', category: 'Safety', unit: 'unit', status: 'deployed', qty: 20 },
    { name: 'Medical Emergency Kit', category: 'Medical', unit: 'kit', status: 'at_station', qty: 4 },
    { name: 'Portable Defibrillator', category: 'Medical', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Satellite Phone (Iridium)', category: 'Communications', unit: 'unit', status: 'deployed', qty: 6 },
    { name: 'VHF Radio Set', category: 'Communications', unit: 'unit', status: 'at_station', qty: 10 },
    { name: 'Search & Rescue Sled', category: 'Safety', unit: 'unit', status: 'at_station', qty: 3 },
    { name: 'Flare Kit', category: 'Safety', unit: 'kit', status: 'deployed', qty: 15 },
    // Vehicles & Mobility
    { name: 'Snow Cat (PistenBully)', category: 'Vehicles', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Skidoo Snowmobile', category: 'Vehicles', unit: 'unit', status: 'deployed', qty: 4 },
    { name: 'Zodiac Inflatable Boat', category: 'Vehicles', unit: 'unit', status: 'packed', qty: 2 },
    { name: 'Helicopter Fuel (drums)', category: 'Fuel & Energy', unit: 'drum', status: 'at_station', qty: 40 },
    { name: 'Diesel Generator (30kW)', category: 'Power', unit: 'unit', status: 'at_station', qty: 3 },
    // Consumables (low stock items for demo)
    { name: 'Rocket Fuel Depot', category: 'Fuel & Energy', unit: 'L', status: 'warehouse', qty: 2 },
    { name: 'Laboratory Chemical Set A', category: 'Chemicals', unit: 'set', status: 'at_station', qty: 1 },
    { name: 'Specimen Container (cryogenic)', category: 'Scientific Equipment', unit: 'unit', status: 'deployed', qty: 30 },
    { name: 'Solar Panel Array', category: 'Power', unit: 'unit', status: 'at_station', qty: 5 },
    { name: 'Lithium Battery Bank', category: 'Power', unit: 'unit', status: 'at_station', qty: 8 },
    // Food & Water
    { name: 'Freeze-Dried Vegetarian Ration', category: 'Food & Nutrition', unit: 'kg', status: 'warehouse', qty: 450 },
    { name: 'Freeze-Dried Non-Veg Ration', category: 'Food & Nutrition', unit: 'kg', status: 'warehouse', qty: 380 },
    { name: 'Water Purification Unit', category: 'Water & Sanitation', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Snow Melting Tank (500L)', category: 'Water & Sanitation', unit: 'unit', status: 'at_station', qty: 3 },
    // IT & Communications
    { name: 'VSAT Dish System', category: 'Communications', unit: 'unit', status: 'at_station', qty: 1 },
    { name: 'Ruggedized Laptop', category: 'IT Equipment', unit: 'unit', status: 'deployed', qty: 12 },
    { name: 'Data Logger (multi-channel)', category: 'IT Equipment', unit: 'unit', status: 'deployed', qty: 6 },
    { name: 'Portable Solar Charger', category: 'Power', unit: 'unit', status: 'deployed', qty: 10 },
    // Tools
    { name: 'Ice Axe Set', category: 'Field Tools', unit: 'set', status: 'deployed', qty: 15 },
    { name: 'Rope & Harness Kit', category: 'Safety', unit: 'kit', status: 'deployed', qty: 8 },
    { name: 'Portable Weather Shelter', category: 'Shelter', unit: 'unit', status: 'at_station', qty: 5 },
    { name: 'Core Sample Storage Boxes', category: 'Scientific Equipment', unit: 'box', status: 'at_station', qty: 100 },
    { name: 'Biological Sample Freezer (-80°C)', category: 'Scientific Equipment', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Microscope (field grade)', category: 'Scientific Equipment', unit: 'unit', status: 'at_station', qty: 3 },
    { name: 'Portable Spectrometer', category: 'Scientific Equipment', unit: 'unit', status: 'deployed', qty: 2 },
    { name: 'Chain Saw (cold weather)', category: 'Field Tools', unit: 'unit', status: 'at_station', qty: 2 },
    { name: 'Portable Medical Lab', category: 'Medical', unit: 'unit', status: 'at_station', qty: 1 },
    { name: 'Night Vision Goggles', category: 'Safety', unit: 'unit', status: 'deployed', qty: 6 },
    { name: 'Whiteout Navigation Poles', category: 'Navigation', unit: 'set', status: 'deployed', qty: 30 },
    { name: 'High-altitude Food Pack', category: 'Food & Nutrition', unit: 'pack', status: 'warehouse', qty: 3 },
  ];

  for (let i = 0; i < assetDefs.length; i++) {
    const a = assetDefs[i];
    const qr = `POLAR-${expedition.id.slice(0,4).toUpperCase()}-${String(i + 1).padStart(4, '0')}`;
    await prisma.asset.upsert({
      where: { qrCode: qr },
      update: {},
      create: {
        id: uuid(),
        name: a.name,
        category: a.category,
        qrCode: qr,
        quantity: a.qty,
        unit: a.unit,
        status: a.status as any,
        expeditionId: expedition.id,
        stationId: ['at_station', 'warehouse'].includes(a.status) ? maitri.id : undefined,
        location: a.status === 'at_station' ? 'Maitri Station' : a.status === 'deployed' ? 'Field Site Alpha' : undefined,
      },
    });
  }

  console.log('✅ Assets: 50 seeded across categories');

  // ── Incidents ─────────────────────────────────────────────────────────────────
  const incidents = [
    {
      title: 'Blizzard Warning — Sector 4',
      type: 'Weather',
      severity: 'high' as const,
      description: 'Severe blizzard expected in 6 hours. All field teams return to base.',
      stationId: maitri.id,
      status: 'in_progress' as const,
    },
    {
      title: 'Generator Unit 2 — Fuel Low',
      type: 'Equipment',
      severity: 'medium' as const,
      description: 'Generator #2 fuel reserves at 15%. Resupply required within 48h.',
      stationId: maitri.id,
      status: 'open' as const,
    },
    {
      title: 'Crevasse near Ice Core Site B',
      type: 'Terrain Hazard',
      severity: 'high' as const,
      description: 'New crevasse detected 200m from drilling site. Area cordoned off.',
      stationId: maitri.id,
      status: 'open' as const,
    },
  ];

  for (const inc of incidents) {
    await prisma.incident.create({
      data: {
        id: uuid(),
        ...inc,
        expeditionId: expedition.id,
        reportedBy: commanderUser.id,
      },
    });
  }

  console.log('✅ Incidents: 3 demo incidents seeded');
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Demo accounts (password: demo1234):');
  console.log('  HQ Admin:          hq@polar.ops');
  console.log('  Station Commander: station@polar.ops');
  console.log('  Field Crew:        crew@polar.ops');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
