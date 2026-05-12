/**
 * NexaGlint API Client
 * Handles all communication with the FastAPI backend.
 * JWT token stored in localStorage.
 */

// In development, this uses the Vite proxy to localhost:8000
// In production, set VITE_API_URL in your deployment platform (e.g., Vercel)
const BASE = import.meta.env.VITE_API_URL || "/api";

// ─── Token helpers ─────────────────────────────────────────────────────────
export const TOKEN_KEY = "nexaglint_token";
export const USER_KEY  = "nexaglint_user";

export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────
async function api<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (!token) throw new ApiError(401, "Not authenticated");
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Clean up the URL: remove trailing slash from BASE and leading slash from path
  const cleanBase = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${cleanBase}${cleanPath}`;

  console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    if (!res.ok) {
      console.error(`[API Error] ${res.status} ${fullUrl}`);
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        detail = err.detail || JSON.stringify(err);
      } catch {}
      throw new ApiError(res.status, detail);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`[Network Error] ${fullUrl}`, error);
    throw new ApiError(500, "Network connection failed. Please check your VITE_API_URL setting.");
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Types (mirrors backend schemas) ──────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TableSummary {
  id: string;
  name: string;
  format: "Iceberg" | "Delta" | "Hudi" | "Parquet" | "CSV";
  rows: number;
  sizeBytes: number;
  updatedAt: string;
  location: string;
  partitions: string[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  partition?: boolean;
}

export interface Snapshot {
  id: string;
  ts: string;
  op: "append" | "overwrite" | "delete";
  rows: number;
  sizeBytes: number;
  summary: string;
}

export interface MetricPoint {
  date: string;
  rows: number;
  sizeMB: number;
  files: number;
}

export interface AlertOut {
  id: string;
  tableId: string;
  tableName: string;
  type: "schema_change" | "new_snapshot" | "row_drop" | "new_table";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface TableDetail extends TableSummary {
  schema: ColumnSchema[];
  properties: Record<string, unknown>;
  snapshots: Snapshot[];
  metrics: MetricPoint[];
  sample: Record<string, string | number>[];
}

export interface DashboardStats {
  totalTables: number;
  totalRows: number;
  totalSize: number;
  formats: string[];
  recentActivity: { id: string; name: string; type: string; timestamp: string }[];
}

export interface ScanRequest {
  path: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_region?: string;
  endpoint_url?: string;
}

export interface ScanResponse {
  tables: TableSummary[];
  discovered: number;
  durationMs: number;
  path: string;
}

export interface QueryRequest {
  sql: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_region?: string;
  endpoint_url?: string;
}

export interface QueryResponse {
  columns: string[];
  rows: Record<string, any>[];
  durationMs: number;
}

// ─── Auth endpoints ────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  sendOtp: (email: string) =>
    api<{ status: string; preview_url?: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false),

  register: (email: string, password: string, name?: string, otp?: string) =>
    api<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, otp }),
    }, false),

  me: () => api<User>("/auth/me"),
  awsLogin: (aws_access_key_id: string, aws_secret_access_key: string, aws_region = "us-east-1") =>
    api<AuthResponse>("/auth/aws-login", {
      method: "POST",
      body: JSON.stringify({ aws_access_key_id, aws_secret_access_key, aws_region }),
    }, false),
};

// ─── Tables endpoints ──────────────────────────────────────────────────────
export const tablesApi = {
  list:       ()         => api<TableSummary[]>("/tables"),
  get:        (id: string) => api<TableDetail>(`/tables/${id}`),
  schema:     (id: string) => api<ColumnSchema[]>(`/tables/${id}/schema`),
  snapshots:  (id: string) => api<Snapshot[]>(`/tables/${id}/snapshots`),
  partitions: (id: string) => api<{ partitions: string[] }>(`/tables/${id}/partitions`),
  metrics:    (id: string) => api<MetricPoint[]>(`/tables/${id}/metrics`),
  sample:     (id: string, rows = 10) => api<Record<string, unknown>[]>(`/tables/${id}/sample?rows=${rows}`),
  stats:      ()         => api<DashboardStats>("/stats"),
  scan:       (body: ScanRequest) => api<ScanResponse>("/scan", { method: "POST", body: JSON.stringify(body) }),
  query:      (body: QueryRequest) => api<QueryResponse>("/query", { method: "POST", body: JSON.stringify(body) }),
  watch:      (id: string) => api<{ status: string }>(`/tables/${id}/watch`, { method: "POST" }),
  unwatch:    (id: string) => api<{ status: string }>(`/tables/${id}/watch`, { method: "DELETE" }),
  alerts:     () => api<AlertOut[]>("/alerts"),
  markRead:   (id: string) => api<{ status: string }>(`/alerts/${id}/read`, { method: "POST" }),

  // ── AWS Resource Discovery ───────────────────────────────────────────────
  awsBuckets: (key: string, secret: string, region: string) => 
    api<string[]>(`/aws/buckets?key=${key}&secret=${encodeURIComponent(secret)}&region=${region}`),
  awsIamHealth: (key: string, secret: string, region: string) =>
    api<any>(`/aws/iam-health?key=${key}&secret=${encodeURIComponent(secret)}&region=${region}`),
};

// ─── Health check ──────────────────────────────────────────────────────────
export const healthApi = {
  check: () => api<{ status: string }>("/health", {}, false),
};
