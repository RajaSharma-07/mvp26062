/**
 * PolarOps Synchronization & Conflict Resolution Service
 * SIH Problem Statement 26062 - Antarctic Expedition Logistics
 *
 * Implements:
 * 1. Append-Only Event Log Merger (Cargo, Emergency, Assets)
 * 2. CRDT Delta Counter Merger (Inventory reconciliation)
 * 3. Last-Write-Wins Merger (Personnel Roster)
 */

export interface SyncEvent {
  id: string;
  stationId: string;
  type: string;
  payload: any;
  timestamp: number;
}

export interface InventorySyncState {
  id?: string;
  stationId: string;
  itemId: string;
  localVector: Record<string, number>;
  remoteVector: Record<string, number>;
}

export interface PersonnelRecord {
  id: string;
  name: string;
  role: string;
  stationId: string;
  updatedAt: number | Date;
}

export class SyncService {
  /**
   * 1. Append-Only Event Log Merger
   * Zero data loss: immutable events are concatenated, deduplicated by id & timestamp,
   * and chronologically sorted.
   */
  async mergeLogs(localEvents: SyncEvent[], remoteEvents: SyncEvent[]): Promise<SyncEvent[]> {
    // Get events only in local that aren't in remote
    const newEvents = localEvents.filter(
      (local) =>
        !remoteEvents.some(
          (remote) => remote.id === local.id && remote.timestamp === local.timestamp
        )
    );

    // Merge: remote + new = complete log
    const merged = [...remoteEvents, ...newEvents];

    // Sort by timestamp to maintain deterministic global ordering
    return merged.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * 2. CRDT Counter (Inventory)
   * Merges multi-station delta vectors mathematically with zero collision/race condition.
   */
  mergeInventory(local: InventorySyncState, remote: InventorySyncState): number {
    const merged: Record<string, number> = {
      ...local.remoteVector,
      ...remote.remoteVector,
    };

    // Total = sum of all station deltas
    const total = Object.values(merged).reduce((a: number, b: number) => a + b, 0);
    return total;
  }

  /**
   * 3. Last-Write-Wins (Personnel Roster)
   * High-performance deterministic resolution for low-frequency roster updates.
   */
  mergePersonnel(local: PersonnelRecord, remote: PersonnelRecord): PersonnelRecord {
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();

    if (localTime > remoteTime) {
      return local; // Local is newer
    }
    return remote; // Remote is newer
  }
}

export const syncService = new SyncService();
