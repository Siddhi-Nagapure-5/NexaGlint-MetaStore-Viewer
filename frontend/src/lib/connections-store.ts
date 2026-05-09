// connections-store.ts — manages multi-cloud storage connections

export type CloudProvider = "AWS S3" | "Azure Blob" | "MinIO" | "GCS";

export type ConnectionStatus = "connected" | "checking" | "error" | "idle";

export type CloudConnection = {
  id: string;
  name: string;
  provider: CloudProvider;
  path: string;
  // credentials (stored locally, never sent anywhere in demo mode)
  region?: string;
  accessKey?: string;
  secretKey?: string;
  accountName?: string;   // Azure
  sasToken?: string;      // Azure
  endpointUrl?: string;   // MinIO
  projectId?: string;     // GCS
  // runtime state
  status: ConnectionStatus;
  tableCount: number;
  lastChecked?: string;   // ISO timestamp
  errorMessage?: string;
};

const STORAGE_KEY = "nexaglint_connections";

// ─── Defaults (Empty for production) ──────────────────────────────────────────
const DEFAULT_CONNECTIONS: CloudConnection[] = [];

// ─── CRUD ────────────────────────────────────────────────────────────────────
export function getConnections(): CloudConnection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // seed with defaults on first load
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONNECTIONS));
      return DEFAULT_CONNECTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONNECTIONS;
  }
}

export function saveConnections(connections: CloudConnection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function addConnection(conn: Omit<CloudConnection, "id" | "status" | "tableCount">): CloudConnection {
  const connections = getConnections();
  const newConn: CloudConnection = {
    ...conn,
    id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: "idle",
    tableCount: 0,
  };
  saveConnections([...connections, newConn]);
  return newConn;
}

export function removeConnection(id: string): void {
  const connections = getConnections().filter((c) => c.id !== id);
  saveConnections(connections);
}

export function updateConnection(id: string, updates: Partial<CloudConnection>): void {
  const connections = getConnections().map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  saveConnections(connections);
}

import { tablesApi } from "./api";

// ─── Real "Test Connection" via Backend ───────────────────────────────────────
export async function testConnection(id: string): Promise<void> {
  const connections = getConnections();
  const conn = connections.find((c) => c.id === id);
  if (!conn) return;

  updateConnection(id, { status: "checking", errorMessage: undefined });
  window.dispatchEvent(new CustomEvent("nexaglint:connections_updated"));

  try {
    const res = await tablesApi.scan({
      path: conn.path,
      aws_access_key_id: conn.accessKey,
      aws_secret_access_key: conn.secretKey,
      aws_region: conn.region,
      endpoint_url: conn.endpointUrl,
    });

    updateConnection(id, {
      status: "connected",
      tableCount: res.discovered,
      lastChecked: new Date().toISOString(),
      errorMessage: undefined,
    });
  } catch (err: any) {
    updateConnection(id, {
      status: "error",
      tableCount: 0,
      lastChecked: new Date().toISOString(),
      errorMessage: err.message || "Connection failed. Check your path and credentials.",
    });
  } finally {
    window.dispatchEvent(new CustomEvent("nexaglint:connections_updated"));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const PROVIDER_COLORS: Record<CloudProvider, string> = {
  "AWS S3":     "text-[#FF9900] border-[#FF9900]/30 bg-[#FF9900]/10",
  "Azure Blob": "text-[#0078D4] border-[#0078D4]/30 bg-[#0078D4]/10",
  "MinIO":      "text-[#C72C48] border-[#C72C48]/30 bg-[#C72C48]/10",
  "GCS":        "text-[#4285F4] border-[#4285F4]/30 bg-[#4285F4]/10",
};

export const PROVIDER_LABELS: CloudProvider[] = ["AWS S3", "Azure Blob", "MinIO", "GCS"];

export const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: "bg-emerald-400",
  checking:  "bg-yellow-400 animate-pulse",
  error:     "bg-red-400",
  idle:      "bg-gray-500",
};

export const STATUS_TEXT: Record<ConnectionStatus, string> = {
  connected: "Connected",
  checking:  "Checking...",
  error:     "Error",
  idle:      "Not tested",
};
