export type TableFormat = "Iceberg" | "Delta" | "Hudi" | "Parquet" | "CSV";

export type MetaTable = {
  id: string;
  name: string;
  format: TableFormat;
  rows: number;
  sizeBytes: number;
  updatedAt: string;
  location: string;
  partitions: string[];
  schema: { name: string; type: string; nullable: boolean; partition?: boolean }[];
  properties: Record<string, unknown>;
  snapshots: { id: string; ts: string; op: "append" | "overwrite" | "delete"; rows: number; sizeBytes: number; summary: string }[];
  metrics: { date: string; rows: number; sizeMB: number; files: number }[];
  sample: Record<string, string | number>[];
};

// ─── STRICTLY NO DUMMY DATA ──────────────────────────────────────────────────
export const tables: MetaTable[] = [];

export const dashboardStats = {
  totalTables: 0,
  totalRows: 0,
  totalSize: 0,
  formats: [],
};

export function formatBytes(b: number) {
  if (!b) return "0 B";
  if (b > 1e12) return (b / 1e12).toFixed(2) + " TB";
  if (b > 1e9) return (b / 1e9).toFixed(2) + " GB";
  if (b > 1e6) return (b / 1e6).toFixed(2) + " MB";
  if (b > 1e3) return (b / 1e3).toFixed(1) + " KB";
  return b + " B";
}

export function formatNumber(n: number) {
  if (!n) return "0";
  if (n > 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n > 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n > 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}
