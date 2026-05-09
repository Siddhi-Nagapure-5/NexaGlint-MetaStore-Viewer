import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Play, GitCompare, Download, Eye, EyeOff, ChevronDown, Bell, X, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FormatBadge } from "@/components/metastore/FormatBadge";
import { JsonViewer } from "@/components/metastore/JsonViewer";
import { Button } from "@/components/ui/button";
import { formatBytes, formatNumber, tables, type MetaTable } from "@/lib/mock-data";
import { exportToSQL, exportToJSONSchema, exportToAvro, exportToDbt, downloadFile } from "@/lib/export";
import { isWatching, toggleWatch, addAlert } from "@/lib/watch-store";
import { tablesApi, type QueryResponse, type TableDetail } from "@/lib/api";

export const Route = createFileRoute("/tables/$tableId")({
  head: ({ params }) => ({ meta: [{ title: `${params.tableId} · Table Details` }] }),
  loader: async ({ params }): Promise<TableDetail> => {
    try {
      return await tablesApi.get(params.tableId);
    } catch (err) {
      throw notFound();
    }
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

const EXPORT_OPTIONS = [
  { label: "SQL DDL", ext: "sql", mime: "text/sql" },
  { label: "JSON Schema", ext: "json", mime: "application/json" },
  { label: "Avro Schema", ext: "avsc", mime: "application/json" },
  { label: "dbt Model", ext: "sql", mime: "text/sql" },
] as const;

function TableDetail() {
  const t = Route.useLoaderData() as TableDetail;
  const [tab, setTab] = useState<(typeof TABS)[number]>("Schema");
  const [compareA, setCompareA] = useState(t.snapshots[0]?.id);
  const [compareB, setCompareB] = useState(t.snapshots.at(-1)?.id);

  // ── Query state ───────────────────────────────────────────────────────────
  const [showQuery, setShowQuery] = useState(false);
  const [queryText, setQueryText] = useState(`SELECT * FROM '${t.location}' LIMIT 50`);
  const [queryState, setQueryState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // ── Export state ──────────────────────────────────────────────────────────
  const [exportOpen, setExportOpen] = useState(false);
  const [exportedLabel, setExportedLabel] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = (label: (typeof EXPORT_OPTIONS)[number]["label"]) => {
    let content = "";
    let filename = "";
    let mime = "text/plain";

    if (label === "SQL DDL") {
      content = exportToSQL(t);
      filename = `${t.name}.sql`;
      mime = "text/sql";
    } else if (label === "JSON Schema") {
      content = exportToJSONSchema(t);
      filename = `${t.name}.schema.json`;
      mime = "application/json";
    } else if (label === "Avro Schema") {
      content = exportToAvro(t);
      filename = `${t.name}.avsc`;
      mime = "application/json";
    } else if (label === "dbt Model") {
      content = exportToDbt(t);
      filename = `${t.name}_dbt.sql`;
      mime = "text/sql";
    }

    downloadFile(content, filename, mime);
    setExportedLabel(label);
    setExportOpen(false);
    setTimeout(() => setExportedLabel(null), 3000);
  };

  // ── Watch state ───────────────────────────────────────────────────────────
  const [watching, setWatching] = useState(() => isWatching(t.id));
  const [watchToast, setWatchToast] = useState<string | null>(null);

  const handleWatch = async () => {
    try {
      const nowWatching = await toggleWatch(t.id);
      setWatching(nowWatching);
      if (nowWatching) {
        setWatchToast(`👁️ Now watching ${t.name}`);
      } else {
        setWatchToast(`Unwatched ${t.name}`);
      }
      setTimeout(() => setWatchToast(null), 3000);
    } catch (err) {
      console.error("Failed to toggle watch", err);
    }
  };

  const handleRunQuery = async () => {
    setQueryState("running");
    setQueryError(null);
    try {
      // Get cloud credentials from localStorage if they exist (from AWS login)
      const user = JSON.parse(localStorage.getItem("nexaglint_user") || "{}");
      
      const res = await tablesApi.query({
        sql: queryText,
        aws_access_key_id: user.aws_access_key,
        aws_secret_access_key: user.aws_secret_key,
        aws_region: user.aws_region || "us-east-1"
      });
      
      setQueryResult(res);
      setQueryState("done");
    } catch (err: any) {
      setQueryError(err.message || "Failed to execute query");
      setQueryState("error");
    }
  };

  return (
    <div className="space-y-5 relative">

      {/* Toast notifications */}
      {(exportedLabel || watchToast) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 animate-in slide-in-from-bottom-4">
          {exportedLabel && (
            <div className="flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur-xl shadow-xl">
              <Download className="size-4 shrink-0" />
              {exportedLabel} exported successfully!
            </div>
          )}
          {watchToast && (
            <div className="flex items-center gap-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur-xl shadow-xl">
              <Bell className="size-4 shrink-0" />
              {watchToast}
            </div>
          )}
        </div>
      )}

      <Link to="/tables" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Tables
      </Link>

      {/* Header card */}
      <div className="glass-strong rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{t.name}</h1>
            <FormatBadge format={t.format} />
            {watching && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Watching
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">{t.location}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="glass rounded-lg px-2.5 py-1">Rows: <b>{formatNumber(t.rows)}</b></span>
            <span className="glass rounded-lg px-2.5 py-1">Size: <b>{formatBytes(t.sizeBytes)}</b></span>
            <span className="glass rounded-lg px-2.5 py-1">Partitions: <b>{t.partitions.join(", ") || "none"}</b></span>
            <span className="glass rounded-lg px-2.5 py-1">Updated: <b>{new Date(t.updatedAt).toLocaleString()}</b></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Watch Toggle */}
          <button
            onClick={handleWatch}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 hover:scale-105 active:scale-95 ${
              watching
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {watching ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {watching ? "Unwatch" : "Watch Table"}
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Download className="size-4" />
              Export Schema
              <ChevronDown className={`size-3.5 transition-transform duration-200 ${exportOpen ? "rotate-180" : ""}`} />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-strong border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5">
                  Choose Format
                </div>
                {EXPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleExport(opt.label)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-cyan-300 transition-colors flex items-center gap-3 group"
                  >
                    <Download className="size-3.5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    {opt.label}
                    <span className="ml-auto text-[10px] text-gray-600 font-mono">.{opt.ext}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run Query */}
          <Button 
            onClick={() => setShowQuery(true)}
            className="rounded-xl border-0 group relative overflow-hidden" 
            style={{ background: "var(--gradient-brand)" }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Play className="size-4 mr-1.5 fill-black" /> Run Query
          </Button>
        </div>
      </div>

      {/* Query Modal */}
      {showQuery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-[#0a0f1a]/95 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
                  <Play className="size-5 text-cyan-400 fill-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">NexaGlint Query Workbench</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Preview Mode · Engine: Local Metadata</p>
                </div>
              </div>
              <button onClick={() => { setShowQuery(false); setQueryState("idle"); }} className="p-2.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                   <textarea
                     value={queryText}
                     onChange={(e) => setQueryText(e.target.value)}
                     className="w-full h-[180px] bg-transparent p-6 font-mono text-sm leading-relaxed text-cyan-50 focus:outline-none resize-none"
                     spellCheck={false}
                   />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-500" /> S3 Connection: Active</div>
                  <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-cyan-500" /> Engine: DuckDB 0.10.1</div>
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" onClick={() => { setShowQuery(false); setQueryState("idle"); }} className="rounded-xl border-white/10 px-6 h-11 font-bold text-gray-400 hover:text-white">Cancel</Button>
                   <Button 
                     onClick={handleRunQuery}
                     className="rounded-xl border-0 px-8 h-11 font-bold text-black"
                     style={{ background: "var(--gradient-brand)" }}
                     disabled={queryState === "running"}
                   >
                     {queryState === "running" ? (
                       <><Loader2 className="size-4 mr-2 animate-spin" /> Executing Live...</>
                     ) : (
                       <><Play className="size-4 mr-2 fill-black" /> Run SQL Query</>
                     )}
                   </Button>
                </div>
              </div>

              {queryState === "error" && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="size-4" />
                  {queryError}
                </div>
              )}

              {queryState === "done" && queryResult && (
                <div className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 font-bold px-1">
                    <span>Results: {queryResult.rows.length} rows</span>
                    <span className="text-cyan-500/80">Execution time: {queryResult.durationMs.toFixed(2)}ms</span>
                  </div>
                  <div className="glass rounded-2xl overflow-hidden border border-white/5 max-h-[300px] overflow-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="sticky top-0 bg-[#0a0f1a] border-b border-white/10 z-10">
                        <tr>
                          {queryResult.columns.map(col => (
                            <th key={col} className="px-4 py-3 text-gray-400 font-bold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {queryResult.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            {queryResult.columns.map(col => (
                              <td key={col} className="px-4 py-3 font-mono text-gray-300 whitespace-nowrap">{String(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="glass rounded-2xl p-1.5 inline-flex flex-wrap">
        {TABS.map((x) => (
          <button key={x} onClick={() => setTab(x)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${tab === x ? "bg-white/15 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
            {x}
          </button>
        ))}
      </div>

      {/* ── Schema Tab ─────────────────────────────────────────────────────── */}
      {tab === "Schema" && (
        <div className="space-y-3">
          {/* Schema info bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>{t.schema.length} columns · {t.schema.filter(c => c.partition).length} partition keys</span>
            <span className="text-gray-600">Use Export Schema to download</span>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Column</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Nullable</th>
                  <th className="text-left px-4 py-3">Partition Key</th>
                </tr>
              </thead>
              <tbody>
                {t.schema.map((c, i) => (
                  <tr key={c.name} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-mono font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-cyan-300 font-mono text-xs">{c.type}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-md text-xs ${c.nullable ? "bg-yellow-500/10 text-yellow-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                        {c.nullable ? "nullable" : "required"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.partition && (
                        <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-200 border border-violet-500/30">
                          partition
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
