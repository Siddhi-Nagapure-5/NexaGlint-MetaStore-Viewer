import { createFileRoute, Link } from "@tanstack/react-router";
import { FormatBadge } from "@/components/metastore/FormatBadge";
import { Clock, Database, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { tablesApi, type TableSummary, type Snapshot } from "@/lib/api";
import { formatBytes, formatNumber } from "@/lib/mock-data";

export const Route = createFileRoute("/snapshots")({
  head: () => ({ meta: [{ title: "Snapshots · Lakehouse Metastore" }] }),
  component: SnapshotsPage,
});

type SnapshotWithTable = Snapshot & { table: TableSummary };

function SnapshotsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [allSnapshots, setAllSnapshots] = useState<SnapshotWithTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const tables = await tablesApi.list();
        const results: SnapshotWithTable[] = [];
        
        for (const t of tables) {
          try {
            const tableDetail = await tablesApi.get(t.id);
            if (tableDetail.snapshots) {
              results.push(...tableDetail.snapshots.map(s => ({ ...s, table: t })));
            }
          } catch (e) {
            console.error(`Failed to fetch snapshots for ${t.id}`, e);
          }
        }
        
        setAllSnapshots(results.sort((a, b) => +new Date(b.ts) - +new Date(a.ts)));
      } catch (e) {
        console.error("Failed to fetch snapshots", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalItems = allSnapshots.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleSnapshots = allSnapshots.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-4">
        <Loader2 className="size-10 animate-spin text-cyan-400" />
        <p className="font-medium animate-pulse">Aggregating real-time snapshot timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Snapshots</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">Schema evolution and version timeline across all your connected lakehouse tables.</p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 glass-strong rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Items per page:</span>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none appearance-none cursor-pointer"
          >
            {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span className="font-medium">
            {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} <span className="text-gray-500">of</span> {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalItems === 0} className="p-1.5 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent" />
        <div className="space-y-6">
          {visibleSnapshots.map((s, index) => (
            <div key={s.table.id + s.id} className="relative flex items-start gap-6 group animate-in slide-in-from-bottom-6 fill-mode-both" style={{ animationDelay: `${(index % 10) * 50}ms` }}>
              <div className="relative z-10 shrink-0 mt-5 size-[54px] rounded-full bg-[#05050a] border border-white/10 grid place-items-center group-hover:border-cyan-500/50 transition-all">
                <div className="size-[42px] rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/5 grid place-items-center">
                  <Clock className="size-4 text-cyan-400" />
                </div>
              </div>
              <div className="flex-1 glass-strong rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:bg-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to="/tables/$tableId" params={{ tableId: s.table.id }} className="flex items-center gap-2 font-semibold text-lg text-white hover:text-cyan-400">
                      <Database className="size-4 text-gray-500" />
                      {s.table.name}
                    </Link>
                    <FormatBadge format={s.table.format} />
                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-gray-400">{s.id}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-400 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                    {new Date(s.ts).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {s.op}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                        <div className="text-xs text-gray-500 mb-0.5">Rows Added</div>
                        <div className="font-semibold text-gray-200">{formatNumber(s.rows)}</div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                        <div className="text-xs text-gray-500 mb-0.5">Size delta</div>
                        <div className="font-semibold text-gray-200">{formatBytes(s.sizeBytes)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                      <FileText className="size-3" /> Commit Message
                    </div>
                    <div className="text-gray-300 leading-relaxed font-medium">{s.summary}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {visibleSnapshots.length === 0 && (
             <div className="pl-[78px] pt-4 pb-10 text-gray-500 text-sm font-medium">No snapshots available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
