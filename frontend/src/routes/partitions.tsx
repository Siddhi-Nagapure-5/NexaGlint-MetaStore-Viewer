import { createFileRoute, Link } from "@tanstack/react-router";
import { tables } from "@/lib/mock-data";
import { FormatBadge } from "@/components/metastore/FormatBadge";
import { Network, Database, Hash, ArchiveX, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/partitions")({
  head: () => ({ meta: [{ title: "Partitions · Lakehouse Metastore" }] }),
  component: PartitionsPage,
});

function PartitionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const totalItems = tables.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Guard against out of bounds if pageSize changes
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleTables = tables.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
      {/* Background Ambience */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
          <Network className="size-8 text-cyan-400" />
          Partition Strategies
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">
          Analyze partition keys and pruning statistics to optimize query performance across your data lake.
        </p>
      </div>

      {/* Pagination Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 glass-strong rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-xl animate-in fade-in delay-150 fill-mode-both">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Tables per page:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
          >
            <option value={2} className="bg-[#090b14]">2</option>
            <option value={4} className="bg-[#090b14]">4</option>
            <option value={10} className="bg-[#090b14]">10</option>
            <option value={20} className="bg-[#090b14]">20</option>
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

      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        {visibleTables.map((t, index) => (
          <div 
            key={t.id} 
            className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom-8 fill-mode-both group"
            style={{ animationDelay: `${(index % pageSize) * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <Link to="/tables/$tableId" params={{ tableId: t.id }} className="flex items-center gap-2 font-bold text-lg text-white hover:text-cyan-400 transition-colors">
                <Database className="size-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                {t.name}
              </Link>
              <FormatBadge format={t.format} />
            </div>
            
            <div className="space-y-3">
              {t.partitions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-black/20 rounded-2xl border border-white/5">
                  <ArchiveX className="size-8 text-gray-600 mb-2" />
                  <div className="text-sm font-semibold text-gray-400">Unpartitioned Table</div>
                  <div className="text-xs text-gray-500 mt-1">Queries may result in full table scans.</div>
                </div>
              ) : (
                t.partitions.map((p, idx) => (
                  <div 
                    key={p} 
                    className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-cyan-500/10 grid place-items-center border border-cyan-500/20">
                        <Hash className="size-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-gray-200">{p}</div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Partition Key</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">
                        ~{20 + Math.round((t.id.length * 10) + idx * 50)} parts
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">ESTIMATED</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
        {visibleTables.length === 0 && (
          <div className="md:col-span-2 py-10 text-center text-gray-500 text-sm font-medium">
            No tables available.
          </div>
        )}
      </div>
    </div>
  );
}
