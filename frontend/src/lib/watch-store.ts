import { tablesApi, type AlertOut } from "./api";

/**
 * Backend-connected Watch Store
 * No longer a simulation!
 */

export type WatchAlert = AlertOut;

// We still keep the 'watched' state in memory for fast UI updates, 
// but it's primarily managed by the backend.
let watchedIds: string[] = [];

export function isWatching(tableId: string): boolean {
  return watchedIds.includes(tableId);
}

export async function toggleWatch(tableId: string): Promise<boolean> {
  if (isWatching(tableId)) {
    await tablesApi.unwatch(tableId);
    watchedIds = watchedIds.filter(id => id !== tableId);
    return false;
  } else {
    await tablesApi.watch(tableId);
    watchedIds.push(tableId);
    return true;
  }
}

// Alerts are now fetched from the backend
export async function getAlerts(): Promise<WatchAlert[]> {
  return await tablesApi.alerts();
}

export async function getUnreadCount(): Promise<number> {
  const alerts = await getAlerts();
  return alerts.filter(a => !a.read).length;
}

export async function markRead(alertId: string): Promise<void> {
  await tablesApi.markRead(alertId);
}

export async function markAllRead(): Promise<void> {
  const alerts = await getAlerts();
  for (const a of alerts) {
    if (!a.read) await markRead(a.id);
  }
}

// Helper to initialize watched state from backend (not implemented yet in backend but good for future)
export async function syncWatched(tables: {id: string}[]) {
  // For now we just use the in-memory state
}

// Dummy polling is removed! 
export function simulatePolling() {
  return () => {};
}

export function addAlert() {
    // Backend handles alert generation now
}
