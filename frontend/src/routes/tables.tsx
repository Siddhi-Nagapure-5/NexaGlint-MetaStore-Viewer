import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormatBadge } from "@/components/metastore/FormatBadge";
import { CloudBadge } from "@/components/metastore/CloudBadge";
import { formatBytes, formatNumber, type TableFormat } from "@/lib/mock-data";
import { tablesApi } from "@/lib/api";
import { getConnections } from "@/lib/connections-store";

export const Route = createFileRoute("/tables")({
  head: () => ({ meta: [{ title: "Tables · Lakehouse Metastore" }] }),
  component: TablesLayout,
});

const FILTERS: ("All" | TableFormat)[] = ["All", "Iceberg", "Delta", "Hudi", "Parquet", "CSV"];



function TablesLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/tables") return <Outlet />;
  return <TablesList />;
}

function TablesList() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const connections = useMemo(() => getConnections(), []);

  useEffect(() => {
    tablesApi.list().then(res => {
      setTables(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const list = useMemo(
    () => tables.filter(
      (t) =>
        (filter === "All" || t.format === filter) &&
        (q === "" || t.name.toLowerCase().includes(q.toLowerCase()))
    ),
    [q, filter, tables]
  );


  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000">
      {/* Background Ambience */}
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Tables</h1>
        <p className="text-gray-400 text-sm mt-2">Browse discovered lakehouse tables across your connected object storage.</p>
      </div>

      <div className="relative z-10 glass-strong rounded-2xl p-3 flex flex-wrap items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-6 delay-150 fill-mode-both">
        <div className="flex items-center gap-2 px-3 flex-1 min-w-[200px]">
          <Search className="size-5 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tables…"
            className="bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-500 h-10 text-base" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${filter === f ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "text-gray-400 border border-transparent hover:text-white hover:bg-white/10"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {list.map((t, index) => (
          <Link key={t.id} to="/tables/$tableId" params={{ tableId: t.id }}
            className="glass-strong rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(34,211,238,0.1)] block group animate-in slide-in-from-bottom-8 fill-mode-both"
            style={{ animationDelay: `${200 + index * 50}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="font-semibold text-lg text-white group-hover:text-cyan-300 transition-colors truncate pr-2">{t.name}</div>
              <FormatBadge format={t.format} />
            </div>
            {/* Cloud source badge */}
            {(() => {
              const provider = t.location?.startsWith("s3://") ? "AWS S3" :
                               t.location?.startsWith("gs://") ? "GCS" :
                               t.location?.startsWith("abfs") ? "Azure Blob" : "MinIO";
              return (
                <div className="mb-3">
                  <CloudBadge provider={provider as any} size="sm" />
                  <span className="ml-2 text-[10px] text-gray-600 font-medium">{provider} Storage</span>
                </div>
              );
            })()}
            <div className="text-xs text-gray-500 font-mono truncate bg-black/20 px-2 py-1 rounded-md inline-block max-w-full">{t.location}</div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 transition-colors group-hover:bg-black/40"><div className="text-gray-500 font-medium mb-1">Rows</div><div className="font-semibold text-white">{formatNumber(t.rows)}</div></div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 transition-colors group-hover:bg-black/40"><div className="text-gray-500 font-medium mb-1">Size</div><div className="font-semibold text-white">{formatBytes(t.sizeBytes)}</div></div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 transition-colors group-hover:bg-black/40"><div className="text-gray-500 font-medium mb-1">Updated</div><div className="font-semibold text-white">{new Date(t.updatedAt).toLocaleDateString()}</div></div>
            </div>
          </Link>
        ))}
        {list.length === 0 && (
          <div className="glass-strong rounded-3xl p-12 text-center border border-white/10 bg-white/5 backdrop-blur-xl col-span-full animate-in fade-in fill-mode-both">
            <Search className="size-10 text-gray-600 mx-auto mb-4" />
            <div className="text-lg font-medium text-white mb-2">No tables found</div>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
