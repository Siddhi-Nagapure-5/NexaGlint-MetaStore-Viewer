import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Play, GitCompare } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FormatBadge } from "@/components/metastore/FormatBadge";
import { JsonViewer } from "@/components/metastore/JsonViewer";
import { Button } from "@/components/ui/button";
import { formatBytes, formatNumber, tables, type MetaTable } from "@/lib/mock-data";

export const Route = createFileRoute("/tables/$tableId")({
  head: ({ params }) => ({ meta: [{ title: `${params.tableId} · Table Details` }] }),
  loader: ({ params }): MetaTable => {
    const t = tables.find((x) => x.id === params.tableId);
    if (!t) throw notFound();
    return t;
  },
  notFoundComponent: () => (
    <div className="glass rounded-2xl p-10 text-center">
      <div className="text-lg font-semibold">Table not found</div>
      <Link to="/tables" className="text-sm text-accent">← Back to tables</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="glass rounded-2xl p-10 text-center text-sm text-destructive">{error.message}</div>
  ),
  component: TableDetail,
});

const TABS = ["Schema", "Properties", "Partitions", "Snapshots", "Metrics", "Sample"] as const;

function TableDetail() {
  const t = Route.useLoaderData() as MetaTable;
  const [tab, setTab] = useState<(typeof TABS)[number]>("Schema");
  const [compareA, setCompareA] = useState(t.snapshots[0]?.id);
  const [compareB, setCompareB] = useState(t.snapshots.at(-1)?.id);

  return (
    <div className="space-y-5">
      <Link to="/tables" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Tables
      </Link>

      <div className="glass-strong rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{t.name}</h1>
            <FormatBadge format={t.format} />
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">{t.location}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="glass rounded-lg px-2.5 py-1">Rows: <b>{formatNumber(t.rows)}</b></span>
            <span className="glass rounded-lg px-2.5 py-1">Size: <b>{formatBytes(t.sizeBytes)}</b></span>
            <span className="glass rounded-lg px-2.5 py-1">Partitions: <b>{t.partitions.join(", ") || "none"}</b></span>
            <span className="glass rounded-lg px-2.5 py-1">Updated: <b>{new Date(t.updatedAt).toLocaleString()}</b></span>
          </div>
        </div>
        <Button className="rounded-xl border-0" style={{ background: "var(--gradient-brand)" }}>
          <Play className="size-4 mr-1" /> Run Query
        </Button>
      </div>

      <div className="glass rounded-2xl p-1.5 inline-flex flex-wrap">
        {TABS.map((x) => (
          <button key={x} onClick={() => setTab(x)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${tab === x ? "bg-white/15 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
            {x}
          </button>
        ))}
      </div>

      {tab === "Schema" && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-white/5">
              <tr>
                <th className="text-left px-4 py-3">Column</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Nullable</th>
                <th className="text-left px-4 py-3">Partition Key</th>
              </tr>
            </thead>
            <tbody>
              {t.schema.map((c) => (
                <tr key={c.name} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3 font-mono">{c.name}</td>
                  <td className="px-4 py-3 text-cyan-300 font-mono text-xs">{c.type}</td>
                  <td className="px-4 py-3 text-xs">{c.nullable ? "yes" : "no"}</td>
                  <td className="px-4 py-3">{c.partition && <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-200">partition</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Properties" && <JsonViewer data={t.properties} />}

      {tab === "Partitions" && (
        <div className="glass rounded-2xl p-5">
          {t.partitions.length === 0 ? (
            <div className="text-sm text-muted-foreground">This table is unpartitioned.</div>
          ) : (
            <div className="space-y-2">
              {t.partitions.map((p) => (
                <div key={p} className="glass rounded-xl p-3 flex items-center justify-between">
                  <div className="font-mono text-sm">{p}</div>
                  <div className="text-xs text-muted-foreground">~{Math.round(Math.random() * 200) + 20} partitions · pruned 84%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Snapshots" && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4 flex items-center gap-3 flex-wrap">
            <GitCompare className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Compare snapshots:</span>
            <select value={compareA} onChange={(e) => setCompareA(e.target.value)}
              className="glass rounded-lg px-2 py-1 text-xs bg-transparent">
              {t.snapshots.map((s) => <option key={s.id} value={s.id} className="bg-popover">{s.id}</option>)}
            </select>
            <span className="text-muted-foreground">→</span>
            <select value={compareB} onChange={(e) => setCompareB(e.target.value)}
              className="glass rounded-lg px-2 py-1 text-xs bg-transparent">
              {t.snapshots.map((s) => <option key={s.id} value={s.id} className="bg-popover">{s.id}</option>)}
            </select>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-violet-400/60 via-cyan-400/40 to-transparent" />
              {t.snapshots.map((s) => (
                <div key={s.id} className="relative pl-5 pb-4">
                  <span className="absolute -left-0.5 top-1 size-3 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 shadow-[0_0_10px_2px_oklch(0.7_0.22_295_/_0.5)]" />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-mono text-sm">{s.id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.ts).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-violet-300">{s.op}</span> · {formatNumber(s.rows)} rows · {formatBytes(s.sizeBytes)} — {s.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Metrics" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-medium mb-3">File Sizes (MB)</div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={t.metrics}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis dataKey="date" stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.03 270 / 0.9)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                  <Bar dataKey="sizeMB" fill="oklch(0.7 0.22 295)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-medium mb-3">Row Counts</div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={t.metrics}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis dataKey="date" stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.03 270 / 0.9)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                  <Line dataKey="rows" stroke="oklch(0.82 0.16 200)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "Sample" && (
        <div className="glass rounded-2xl overflow-hidden">
          {t.sample.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No sample available.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-white/5">
                  <tr>{Object.keys(t.sample[0]).map((k) => <th key={k} className="text-left px-4 py-3">{k}</th>)}</tr>
                </thead>
                <tbody>
                  {t.sample.map((row, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition">
                      {Object.values(row).map((v, j) => <td key={j} className="px-4 py-3 font-mono text-xs">{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
