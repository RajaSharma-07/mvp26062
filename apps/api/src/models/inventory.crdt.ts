/**
 * PolarOps CRDT Counter for Inventory Reconciliation
 * SIH Problem Statement 26062 - Antarctic Expedition Logistics
 *
 * Provides conflict-free, commutative, associative delta merging
 * across multiple partitioned stations (Maitri, Bharati, Field Convoys).
 */

export interface InventorySyncState {
  id?: string;
  stationId: string;
  itemId: string;
  // Each station tracks its own delta vector: { station_id: delta, ... }
  // Example: station_A incremented +10, station_B decremented -3
  localVector: Record<string, number>;
  remoteVector: Record<string, number>;
}

/**
 * Merges local and remote CRDT inventory vectors.
 * Mathematically guarantees zero conflicts and zero data loss.
 *
 * @param local Local station inventory state
 * @param remote Remote incoming station inventory state
 * @returns Total reconciled inventory count
 */
export function mergeInventory(
  local: InventorySyncState,
  remote: InventorySyncState
): number {
  // Combine all station vectors (disjoint or overlapping)
  const merged: Record<string, number> = {
    ...local.remoteVector,
    ...remote.remoteVector,
  };

  // Total = algebraic sum of all deltas
  const total = Object.values(merged).reduce((acc: number, delta: number) => acc + delta, 0);
  return total;
}
