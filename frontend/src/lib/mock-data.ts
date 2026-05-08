export type TableFormat = "Iceberg" | "Delta" | "Hudi" | "Parquet";

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

const fmts: TableFormat[] = ["Iceberg", "Delta", "Hudi", "Parquet"];

const mkMetrics = (n = 12) =>
  Array.from({ length: n }, (_, i) => ({
    date: `M${i + 1}`,
    rows: Math.round(50000 + Math.random() * 200000 + i * 8000),
    sizeMB: Math.round(120 + Math.random() * 400 + i * 30),
    files: Math.round(20 + Math.random() * 80 + i * 4),
  }));

export const tables: MetaTable[] = [
  {
    id: "orders",
    name: "fact_orders",
    format: "Iceberg",
    rows: 18_420_113,
    sizeBytes: 184_223_344_120,
    updatedAt: "2026-05-07T14:22:00Z",
    location: "s3://lakehouse/warehouse/sales/fact_orders",
    partitions: ["order_date", "region"],
    schema: [
      { name: "order_id", type: "string", nullable: false },
      { name: "customer_id", type: "string", nullable: false },
      { name: "order_date", type: "date", nullable: false, partition: true },
      { name: "region", type: "string", nullable: false, partition: true },
      { name: "amount", type: "decimal(18,2)", nullable: false },
      { name: "currency", type: "string", nullable: true },
      { name: "status", type: "string", nullable: true },
    ],
    properties: {
      "format-version": 2,
      "write.format.default": "parquet",
      "write.parquet.compression-codec": "zstd",
      "commit.retry.num-retries": 5,
      owner: "data-platform",
    },
    snapshots: Array.from({ length: 8 }, (_, i) => ({
      id: `snap-${1000 + i}`,
      ts: new Date(Date.now() - (8 - i) * 86_400_000).toISOString(),
      op: i % 4 === 0 ? "overwrite" : "append",
      rows: 1_500_000 + i * 220_000,
      sizeBytes: 14_000_000_000 + i * 1_800_000_000,
      summary: i % 3 === 0 ? "added column: discount_pct" : "appended new partition",
    })),
    metrics: mkMetrics(),
    sample: Array.from({ length: 8 }, (_, i) => ({
      order_id: `ORD-${100023 + i}`,
      customer_id: `C-${4882 + i}`,
      order_date: `2026-05-0${(i % 8) + 1}`,
      region: ["US", "EU", "APAC", "LATAM"][i % 4],
      amount: (89 + i * 12.4).toFixed(2),
      currency: "USD",
      status: ["paid", "pending", "refunded"][i % 3],
    })),
  },
  {
    id: "events",
    name: "events_clickstream",
    format: "Delta",
    rows: 942_113_882,
    sizeBytes: 2_842_223_344_120,
    updatedAt: "2026-05-08T09:14:00Z",
    location: "s3://lakehouse/warehouse/web/events_clickstream",
    partitions: ["event_date"],
    schema: [
      { name: "event_id", type: "string", nullable: false },
      { name: "user_id", type: "string", nullable: true },
      { name: "event_type", type: "string", nullable: false },
      { name: "event_date", type: "date", nullable: false, partition: true },
      { name: "url", type: "string", nullable: true },
      { name: "props", type: "map<string,string>", nullable: true },
    ],
    properties: {
      "delta.minReaderVersion": 2,
      "delta.minWriterVersion": 5,
      "delta.checkpointInterval": 10,
      "delta.enableChangeDataFeed": true,
    },
    snapshots: Array.from({ length: 12 }, (_, i) => ({
      id: `v${20 + i}`,
      ts: new Date(Date.now() - (12 - i) * 43_200_000).toISOString(),
      op: i % 5 === 0 ? "overwrite" : "append",
      rows: 8_500_000 + i * 420_000,
      sizeBytes: 24_000_000_000 + i * 1_200_000_000,
      summary: "MERGE INTO operation",
    })),
    metrics: mkMetrics(),
    sample: Array.from({ length: 8 }, (_, i) => ({
      event_id: `evt_${i}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: `u_${1000 + i}`,
      event_type: ["page_view", "click", "purchase", "signup"][i % 4],
      event_date: "2026-05-08",
      url: "/products/" + (i + 1),
    })),
  },
  {
    id: "txn",
    name: "hudi_transactions",
    format: "Hudi",
    rows: 320_882_001,
    sizeBytes: 412_223_344_120,
    updatedAt: "2026-05-06T22:01:00Z",
    location: "s3://lakehouse/warehouse/fin/hudi_transactions",
    partitions: ["txn_date"],
    schema: [
      { name: "txn_id", type: "string", nullable: false },
      { name: "account_id", type: "string", nullable: false },
      { name: "amount", type: "decimal(20,4)", nullable: false },
      { name: "txn_date", type: "date", nullable: false, partition: true },
    ],
    properties: { "hoodie.table.type": "MERGE_ON_READ", "hoodie.compact.inline": true },
    snapshots: Array.from({ length: 6 }, (_, i) => ({
      id: `commit-${20260500 + i}`,
      ts: new Date(Date.now() - (6 - i) * 86_400_000).toISOString(),
      op: "append",
      rows: 4_200_000 + i * 180_000,
      sizeBytes: 6_000_000_000 + i * 800_000_000,
      summary: "upsert commit",
    })),
    metrics: mkMetrics(),
    sample: [],
  },
  {
    id: "products",
    name: "dim_products",
    format: "Parquet",
    rows: 184_220,
    sizeBytes: 412_344_120,
    updatedAt: "2026-04-30T10:11:00Z",
    location: "s3://lakehouse/warehouse/catalog/dim_products",
    partitions: [],
    schema: [
      { name: "product_id", type: "string", nullable: false },
      { name: "name", type: "string", nullable: false },
      { name: "category", type: "string", nullable: true },
      { name: "price", type: "decimal(10,2)", nullable: true },
    ],
    properties: { compression: "snappy" },
    snapshots: [],
    metrics: mkMetrics(8),
    sample: [],
  },
];

export const dashboardStats = {
  totalTables: tables.length,
  totalRows: tables.reduce((a, t) => a + t.rows, 0),
  totalSize: tables.reduce((a, t) => a + t.sizeBytes, 0),
  formats: Array.from(new Set(tables.map((t) => t.format))),
};

export function formatBytes(b: number) {
  if (b > 1e12) return (b / 1e12).toFixed(2) + " TB";
  if (b > 1e9) return (b / 1e9).toFixed(2) + " GB";
  if (b > 1e6) return (b / 1e6).toFixed(2) + " MB";
  if (b > 1e3) return (b / 1e3).toFixed(1) + " KB";
  return b + " B";
}

export function formatNumber(n: number) {
  if (n > 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n > 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n > 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}
