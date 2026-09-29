export interface OfflineOp {
  url: string;
  method: string;
  data?: unknown;
  timestamp: number;
}

const QUEUE_KEY = 'polarops_offline_queue';

export function getOfflineQueue(): OfflineOp[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToOfflineQueue(op: OfflineOp) {
  const queue = getOfflineQueue();
  queue.push(op);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function getQueueSize(): number {
  return getOfflineQueue().length;
}
