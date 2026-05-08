import { createFileRoute, Link } from "@tanstack/react-router";
import { formatBytes, formatNumber, tables } from "@/lib/mock-data";
import { FormatBadge } from "@/components/metastore/FormatBadge";
import { Clock, Database, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/snapshots")({
  head: () => ({ meta: [{ title: "Snapshots · Lakehouse Metastore" }] }),
  component: SnapshotsPage,
});

function SnapshotsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const all = useMemo(() => {
    return tables.flatMap((t) => t.snapshots.map((s) => ({ ...s, table: t })))
      .sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
  }, []);

  const totalItems = all.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Guard against out of bounds if pageSize changes
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleSnapshots = all.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
      {/* Background Ambience */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Snapshots</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">Schema evolution and version timeline across all your connected lakehouse tables.</p>
      </div>

      {/* Pagination Controls - Top */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 glass-strong rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-xl animate-in fade-in delay-150 fill-mode-both">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Items per page:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
          >
            <option value={5} className="bg-[#090b14]">5</option>
            <option value={10} className="bg-[#090b14]">10</option>
            <option value={20} className="bg-[#090b14]">20</option>
            <option value={50} className="bg-[#090b14]">50</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span className="font-medium">
            {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} <span className="text-gray-500">of</span> {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Main vertical line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
        
        <div className="space-y-6">
          {visibleSnapshots.map((s, index) => (
            <div key={s.table.id + s.id} className="relative flex items-start gap-6 group animate-in slide-in-from-bottom-6 fill-mode-both" style={{ animationDelay: `${(index % 10) * 50}ms` }}>
              
              {/* Timeline Dot */}
              <div className="relative z-10 shrink-0 mt-5 size-[54px] rounded-full bg-[#05050a] border border-white/10 grid place-items-center shadow-lg group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-300">
                <div className="size-[42px] rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/5 grid place-items-center">
                  <Clock className="size-4 text-cyan-400" />
                </div>
              </div>

              {/* Event Card */}
              <div className="flex-1 glass-strong rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
                
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to="/tables/$tableId" params={{ tableId: s.table.id }} className="flex items-center gap-2 font-semibold text-lg text-white hover:text-cyan-400 transition-colors">
                      <Database className="size-4 text-gray-500" />
                      {s.table.name}
                    </Link>
                    <FormatBadge format={s.table.format} />
                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                      {s.id}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-400 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                    {new Date(s.ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                {/* Body Row */}
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Left: Stats */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
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

                  {/* Right: Message */}
                  <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                      <FileText className="size-3" /> Commit Message
                    </div>
                    <div className="text-gray-300 leading-relaxed font-medium">
                      {s.summary}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {visibleSnapshots.length === 0 && (
             <div className="pl-[78px] pt-4 pb-10 text-gray-500 text-sm font-medium">
               No snapshots available.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
