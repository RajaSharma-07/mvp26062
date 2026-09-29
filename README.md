# 🧊 PolarOps MVP

> **Working implementation of offline-first polar expedition logistics.**  
> Built for SIH 2026 (Hackathon MVP) — 42nd Indian Scientific Expedition to Antarctica (ISEA)  
> **Status: ✅ Production-Ready Architecture**

🔗 **GitHub:** https://github.com/RajaSharma-07/mvp26062  
📹 **Demo Video:** [Watch 5-Minute Live Demo (YouTube)](https://www.youtube.com/watch?v=X2b3SjE2lsQ)  
📊 **Test Results:** See [`docs/TEST_RESULTS.md`](docs/TEST_RESULTS.md)  
🛡️ **Conflict Resolution:** See [`docs/CONFLICT_RESOLUTION.md`](docs/CONFLICT_RESOLUTION.md)  
📡 **Offline-First Sync:** See [`docs/OFFLINE_SYNC.md`](docs/OFFLINE_SYNC.md)  
🏗️ **System Architecture:** See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
🎤 **Live Demo Guide:** See [`docs/DEMO_INSTRUCTIONS.md`](docs/DEMO_INSTRUCTIONS.md)  

---

## ⚡ What's Actually Built

✅ **Field App** — QR scan + offline capture (Next.js 14 PWA)  
✅ **Sync Engine** — Conflict-free merging (TypeScript CRDT + Event Logs)  
✅ **Central Dashboard** — Real-time HQ view (WebSocket)  
✅ **Database** — SQLite (Edge) / PostgreSQL (HQ) with sync tracking  
✅ **Emergency Dispatch** — < 60 sec SOS → HQ alert (< 10s measured)  

**NOT included (future):**  
- Real GPS/IoT hardware (using simulated telemetry for hackathon)  
- Satellite uplink (using LAN in demo)  
- Real NCPOR data (seeded realistic test data provided)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js ≥ 18
- pnpm (`npm i -g pnpm`)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database & Seed Data

```bash
# Push Prisma schema and seed demo data
pnpm db:push
pnpm seed
```

### 3. Start Both Apps

```bash
pnpm dev
```

- **Frontend:** http://localhost:3000
- **API Health:** http://localhost:4000/health

### 4. Run Sync & Conflict Resolution Tests

```bash
pnpm test:sync
```

---

## 🔑 Demo Accounts

All accounts use password: `demo1234`

| Role | Email | Password | Access Scope |
|------|-------|----------|--------------|
| **HQ Admin** | `hq@polar.ops` | `demo1234` | Full Antarctic Fleet & Global Stations |
| **Station Commander** | `station@polar.ops` | `demo1234` | Station (Maitri / Bharati) Level |
| **Field Crew** | `crew@polar.ops` | `demo1234` | QR Scanner & Emergency SOS Access |

---

## 🎤 5-Minute Live Demo Flow

1. **[Tab 1 — HQ Admin]** Login → Dashboard shows 50+ assets, 19 personnel, 2 stations.
2. **[Tab 1]** Toggle **OFFLINE MODE** in sidebar → scan/update QR `POLAR-EXP4-0001` → badge shows **"📱 1 op queued"**.
3. **[Tab 1]** Toggle **ONLINE MODE** → Watch instant toast: **"⬆️ Syncing..."** → **"✅ Synced to HQ (0 conflicts)"**.
4. **[Tab 3 — Field Crew]** Login → Press red **SOS Emergency** button → Submit incident form.
5. **[Tab 1]** Critical red alert fires **INSTANTLY** (< 10 seconds end-to-end via WebSocket).
6. **[Code Proof]** Show [`apps/api/src/services/sync.service.ts`](apps/api/src/services/sync.service.ts) and run `pnpm test:sync`.

---

## 📦 Tech Stack

| Layer | Tech | Description |
|-------|------|-------------|
| **Frontend** | Next.js 14 (App Router) | React PWA with offline caching |
| **UI & Styling** | TailwindCSS + Framer Motion | Modern polar dark theme & micro-animations |
| **State** | Zustand + React Query | Reactive offline queue & optimistic UI |
| **QR Engine** | jsQR | Camera & barcode decode stream |
| **Real-time** | Socket.IO v4 | In-memory edge mode & Redis adapter fallback |
| **Backend** | Express.js + TypeScript | REST controllers + Zod validation |
| **Sync Engine** | TypeScript CRDT | Vector clocks, append-only logs, LWW |
| **ORM & DB** | Prisma ORM + SQLite / PostgreSQL | Zero-config edge deployment |
| **GIS / Maps** | Leaflet.js | High-latitude Antarctic projections |

---

## 🏷️ Demo QR Codes

For testing the live camera scanner:

- `POLAR-EXP4-0001` — Ice Core Drill Kit
- `POLAR-EXP4-0002` — GPS Survey Unit
- `POLAR-EXP4-0003` — Automatic Weather Station
- `POLAR-EXP4-0004` — Seismic Recorder

---

## 📚 Technical Documentation

- 🛡️ [`docs/CONFLICT_RESOLUTION.md`](docs/CONFLICT_RESOLUTION.md) — Mathematical and code proof for 0-conflict merging.
- 📊 [`docs/TEST_RESULTS.md`](docs/TEST_RESULTS.md) — 5-station benchmarks, QR scan speeds, and SOS latency.
- 📡 [`docs/OFFLINE_SYNC.md`](docs/OFFLINE_SYNC.md) — Offline queue lifecycle and intermittent connectivity handling.
- 🏗️ [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Polar edge topologies, ER diagram, and RBAC matrix.
- 🎤 [`docs/DEMO_INSTRUCTIONS.md`](docs/DEMO_INSTRUCTIONS.md) — Step-by-step judge presentation script.

---

*Built for SIH 2026 — Problem Statement 26062*
