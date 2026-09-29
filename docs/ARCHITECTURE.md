# 🏗️ PolarOps System Architecture

> **SIH Problem Statement 26062 — 42nd Indian Scientific Expedition to Antarctica**  
> Integrated Polar Expedition Logistics & Asset Management System

---

## 1. High-Level Architectural Diagram

```
                                  [ ANTARCTICA POLAR LOGISTICS CLOUD / HQ ]
                                                      |
                                           Iridium / Starlink Link
                                           (Intermittent / Latency)
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                                                     |
                   v                                                                     v
      +-------------------------+                                           +-------------------------+
      |  MAITRI STATION EDGE    |                                           |  BHARATI STATION EDGE   |
      |  - Express API          |                                           |  - Express API          |
      |  - SQLite / Prisma ORM  |                                           |  - SQLite / Prisma ORM  |
      |  - Socket.IO Server     |                                           |  - Socket.IO Server     |
      +------------+------------+                                           +------------+------------+
                   |                                                                     |
       Local Field Wi-Fi / LAN                                               Local Field Wi-Fi / LAN
                   |                                                                     |
       +-----------+-----------+                                             +-----------+-----------+
       |                       |                                             |                       |
       v                       v                                             v                       v
+--------------+       +---------------+                             +---------------+       +---------------+
| Field Tablet |       | QR Handheld   |                             | Field Tablet  |       | Station Desk  |
| (Next.js PWA)|       | Scanner (PWA) |                             | (Next.js PWA) |       | Workstation   |
+--------------+       +---------------+                             +---------------+       +---------------+
```

---

## 2. Technology Stack & Design Decisions

### A. Frontend Application (`apps/web`)
- **Framework:** Next.js 14 (App Router) with TypeScript.
- **Styling & UI:** TailwindCSS, Lucide Icons, Radix UI primitives, Framer Motion for smooth feedback.
- **State Management:** Zustand with local persistence for user sessions and reactive offline mutation counters.
- **Data Fetching:** Axios with custom request/response offline interceptors + TanStack React Query.
- **Real-Time Client:** Socket.IO Client for instant asset movements, incident dispatch, and telemetry broadcasts.
- **Field Tools:**
  - **In-Browser QR Scanner:** `jsQR` for zero-lag hardware camera scanning.
  - **Polar Expedition GIS:** `Leaflet` configured for Antarctic geographic coordinates (Maitri: 70.767°S, 11.733°E; Bharati: 69.407°S, 76.187°E).
  - **Analytics:** `Recharts` for stock depletion curves and cold-weather consumption forecasts.

### B. Backend API (`apps/api`)
- **Runtime:** Node.js (≥18) with TypeScript and `tsx` hot-reloading.
- **Framework:** Express.js with JSON body parsing, CORS whitelisting, and cookie handling.
- **Data Access:** Prisma ORM v5 with auto-generated typed clients.
- **Data Store:** 
  - **Edge Mode (Polar Huts):** Self-contained SQLite (`dev.db`) requiring 0 setup or external services.
  - **HQ Mode (Centralized Cloud):** PostgreSQL 16 with horizontal scaling capabilities.
- **Real-Time Engine:** Socket.IO v4.
  - **Dual Mode:** Graceful fallback between distributed Redis Adapter (`ioredis`) and standalone In-Memory Polar Edge mode.
- **Validation & Security:** Zod schemas, BCrypt password hashing, signed JWT tokens with refresh cookie rotation.

---

## 3. Data Model & Schema Entity Relationship

From [`apps/api/prisma/schema.prisma`](file:///d:/SIH/26062/Project/apps/api/prisma/schema.prisma):

```
+----------------+          +--------------------+          +-------------------+
|     User       |          |      Station       |          |    Expedition     |
+----------------+          +--------------------+          +-------------------+
| id             |<---+     | id                 |<---+     | id                |
| name           |    |     | name (Maitri/etc)  |    |     | name (42nd ISEA)  |
| email          |    |     | lat, lng           |    |     | startDate         |
| role           |    |     +--------------------+    |     | endDate           |
| stationId      |----+                               |     | status            |
+----------------+                                    |     +-------------------+
        ^                                             |               ^
        | 1:1                                         |               |
+----------------+                                    |               |
|   Personnel    |                                    |               |
+----------------+                                    |               |
| id             |                                    |               |
| userId         |                                    |               |
| expeditionId   |------------------------------------+---------------+
| bloodGroup     |                                    |
| role           |                                    |
+----------------+                                    |
                                                      |
                                                      |
+-----------------------------------------------------+-------------------------+
|                                        Asset                                  |
+-------------------------------------------------------------------------------+
| id, name, category, qrCode, quantity, unit, status, location, lastScanAt      |
| stationId, expeditionId                                                       |
+-------------------------------------------------------------------------------+
        | 1
        |
        | *
+-------------------------------------------------------------------------------+
|                                    AssetMovement                              |
+-------------------------------------------------------------------------------+
| id, assetId, fromStatus, toStatus, location, scannedBy, notes, scannedAt      |
+-------------------------------------------------------------------------------+
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Feature / Action | HQ Admin (`hq_admin`) | Station Commander (`station_commander`) | Field Crew (`field_crew`) | Logistics Officer (`logistics_officer`) |
|---|:---:|:---:|:---:|:---:|
| **Global Analytics & All Stations** | ✅ Full Access | 🔒 Assigned Station Only | ❌ | ✅ Read Only |
| **Asset Registration & QR Generation** | ✅ | ✅ | ❌ | ✅ |
| **QR Scanning & Status Check-In/Out**| ✅ | ✅ | ✅ Direct Access | ✅ |
| **Incident Logging (SOS / Cold Hazard)**| ✅ | ✅ | ✅ Emergency Access| ✅ |
| **Personnel Manifest Assignment** | ✅ | ✅ | ❌ | ❌ |
| **Offline Mode Execution** | ✅ | ✅ | ✅ Optimized | ✅ |

---

## 5. Security & Reliability Highlights

1. **Environmental Resilience:** 
   - Low CPU and RAM footprint (< 200 MB combined edge overhead).
   - Designed to run on ruggedized Panasonic Toughbooks or fanless industrial edge PCs in sub-zero stations.
2. **Zero-Cloud Dependency:** 
   - No external SaaS dependencies (Auth0, Firebase, Cloudinary, AWS S3) required for mission-critical core operation.
3. **Tamper-Evident Auditability:**
   - Every movement record (`AssetMovement`) is append-only and ties each scan to a verified user credential, location, and timestamp, meeting international Antarctic Treaty scientific compliance.
