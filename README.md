# 🧊 PolarOps MVP

**Integrated Polar Expedition Logistics & Asset Management**  
SIH 26062 — 42nd Indian Scientific Expedition to Antarctica

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js ≥ 18
- pnpm (`npm i -g pnpm`)
- Docker Desktop (running)

### 1. Start Database + Redis

```bash
docker compose up -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

```bash
cd apps/api
pnpm db:push      # Create tables from Prisma schema
pnpm seed         # Seed demo data
cd ../..
```

### 4. Start Both Apps

```bash
pnpm dev
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000/health

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| HQ Admin | `hq@polar.ops` | `demo1234` |
| Station Commander | `station@polar.ops` | `demo1234` |
| Field Crew | `crew@polar.ops` | `demo1234` |

---

## 🎤 60-Second Demo Flow

1. **[Tab 1 — HQ Admin]** Login → Dashboard shows 50+ assets, 19 personnel, 2 stations
2. **[Tab 2 — Station Commander]** Login → sees Maitri station view
3. **[Tab 1]** Go to Assets → Scan → demo QR `POLAR-EXP4-0001` → status updates live
4. **[Tab 1]** Toggle OFFLINE (sidebar) → scan another QR → badge shows "1 op queued"
5. **[Tab 1]** Toggle ONLINE → "1 ops synced to HQ" toast
6. **[Tab 3 — Field Crew]** Login → press red SOS button → fill form → Send
7. **[Tab 1]** Red critical toast fires instantly (WebSocket)

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| UI | shadcn/ui + Tailwind CSS + Framer Motion |
| State | Zustand + React Query |
| QR | jsQR + getUserMedia |
| Real-time | Socket.IO |
| Backend | Express.js + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT (httpOnly cookie) |
| Maps | Leaflet.js |
| Charts | Recharts |

---

## 🏗️ Architecture

```
Browser (Next.js 14 PWA)
  ├─ Auth (JWT cookie)
  ├─ Dashboard (HQ / Station views)
  ├─ QR Scanner (jsQR + webcam)
  └─ Socket.IO client (real-time)
        │ REST + WebSocket
Express.js API (:4000)
  ├─ /auth /expeditions /assets /personnel /incidents /dashboard
  └─ Socket.IO → emit on scan/SOS
        │ Prisma ORM
PostgreSQL + Redis (Docker)
```

---

## 🗂️ Folder Structure

```
polarops/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Express.js backend
├── docker-compose.yml
└── .env.example
```

---

## Demo QR Codes

For the live scan demo (print or display on screen):

- `POLAR-EXP4-0001` — Ice Core Drill Kit
- `POLAR-EXP4-0002` — GPS Survey Unit
- `POLAR-EXP4-0003` — Automatic Weather Station
- `POLAR-EXP4-0004` — Seismic Recorder

---

*Built for SIH 2026 — 36-hour hackathon MVP*
