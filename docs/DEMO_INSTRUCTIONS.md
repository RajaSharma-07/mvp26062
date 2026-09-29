# Live Demo Flow (5 Minutes)

## Setup (Before Demo)

```bash
# 1. Clone repo
git clone https://github.com/RajaSharma-07/mvp26062.git
cd Project

# 2. Start services
pnpm install
pnpm dev

# 3. Open 3 browser tabs
# Tab 1: http://localhost:3000 (HQ Admin: hq@polar.ops / demo1234)
# Tab 2: http://localhost:3000 (Station Commander: station@polar.ops / demo1234)
# Tab 3: http://localhost:3000 (Field Crew: crew@polar.ops / demo1234)
```

---

## Demo Script (Show Judges This)

### **[0:00-1:00] SETUP**
- **Tab 1:** Login as `hq@polar.ops` (password: `demo1234`)
- **Dashboard shows:** 50+ assets, 19 personnel, 2 stations (Maitri & Bharati)
- **Say:** *"This is the PolarOps HQ view in real-time. Notice live telemetry, battery/fuel asset tracking, and station personnel monitoring."*

---

### **[1:00-2:00] OFFLINE SCAN**
- **Tab 1:** Toggle **"OFFLINE MODE"** in the sidebar.
- **Scan QR code / Check asset:** Navigate to Assets page or trigger scan for asset `POLAR-EXP4-0001`.
- **Result:** Asset updates locally in cache, sidebar displays live badge **"📱 1 op queued"**.
- **Say:** *"Antarctica has severe satellite blackouts. Notice how the crew can keep scanning with zero network connectivity. Data is safely queued locally in non-volatile storage."*

---

### **[2:00-3:00] SYNC PROOF**
- Scan or update another item: e.g. `POLAR-EXP4-0002`.
- Sidebar badge updates to **"📱 2 ops queued"**.
- Toggle back to **"ONLINE MODE"**.
- Watch status toast: **"⬆️ Syncing 2 ops..."** → **"✅ Synced to HQ (0 conflicts)"**.
- **Say:** *"No data loss. Conflict-free deterministic merge. Even if offline for days across remote traverses, automatic sync is guaranteed without human intervention."*

---

### **[3:00-4:00] REAL-TIME ALERT**
- **Tab 3:** Login as Field Crew (`crew@polar.ops`).
- Press the red **SOS Emergency button**.
- Fill the emergency incident form (e.g., *Generator Failure at Perimeter Sector 4*) → Send.
- **Tab 1 (HQ Admin):** Red critical alert fires **INSTANTLY** via WebSocket.
- **Say:** *"Less than 10 seconds from SOS button to HQ alert screen. The incident cascade displays available medical personnel, nearest vehicles, and coordinates for instant commander dispatch."*

---

### **[4:00-5:00] EXPLAIN CODE**
- Show GitHub repository: *"This is production-grade TypeScript code built for extreme environments."*
- Point to: [`apps/api/src/services/sync.service.ts`](file:///d:/SIH/26062/Project/apps/api/src/services/sync.service.ts)
- Show [`docs/CONFLICT_RESOLUTION.md`](file:///d:/SIH/26062/Project/docs/CONFLICT_RESOLUTION.md) and [`docs/TEST_RESULTS.md`](file:///d:/SIH/26062/Project/docs/TEST_RESULTS.md).
- **Say:** *"Zero data loss is achieved mathematically via Append-Only Event Logs for cargo/movements, CRDT delta counters for inventory, and Last-Write-Wins with audit trails for personnel."*
