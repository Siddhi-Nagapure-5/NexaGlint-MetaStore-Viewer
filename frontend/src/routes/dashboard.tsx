import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, HardDrive, Rows3, Layers, Zap, ArrowRight, TrendingUp, X, Loader2, CheckCircle2 } from "lucide-react";
import { dashboardStats, formatBytes, formatNumber } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · NexaGlint · Lakehouse Metastore" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "success">("idle");
  const [s3Path, setS3Path] = useState("s3://lakehouse-prod/warehouse/");

  const handleConnect = () => {
    setConnectionState("connecting");
    setTimeout(() => {
      setConnectionState("success");
      setTimeout(() => {
        setIsModalOpen(false);
        setConnectionState("idle");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
      {/* Background Ambience */}
      <div className="absolute top-[-100px] right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-[-100px] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-300 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <Zap className="size-3 animate-pulse" /> Live connection active
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-400 mb-4">
          Data Estate Overview
        </h1>
        <p className="text-gray-400 text-base max-w-2xl leading-relaxed font-medium">
          Intelligent metadata discovery for Iceberg, Delta, and Parquet. Analyze storage costs and query performance instantly without spinning up expensive compute.
        </p>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mt-10">
        {[
          { label: "Total Tables", value: dashboardStats.totalTables, icon: Database, color: "text-cyan-400", bg: "from-cyan-500/20 to-transparent", trend: "+2 this week" },
          { label: "Total Rows", value: formatNumber(dashboardStats.totalRows), icon: Rows3, color: "text-purple-400", bg: "from-purple-500/20 to-transparent", trend: "+14M this week" },
          { label: "Storage Used", value: formatBytes(dashboardStats.totalSize), icon: HardDrive, color: "text-pink-400", bg: "from-pink-500/20 to-transparent", trend: "+24 GB this week" },
          { label: "Formats Supported", value: dashboardStats.formats.length, icon: Layers, color: "text-emerald-400", bg: "from-emerald-500/20 to-transparent", trend: "Fully optimized" },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="group relative overflow-hidden glass-strong rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_rgb(0,0,0,0.3)] backdrop-blur-2xl bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom-8 fill-mode-both"
            style={{ animationDelay: `${100 + i * 100}ms` }}
          >
            {/* Background Gradient & Watermark Icon */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.bg} opacity-50 rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100`} />
            <stat.icon className={`absolute -right-4 -bottom-4 size-24 ${stat.color} opacity-5 -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-sm text-gray-400 font-semibold mb-6">
                <div className="size-10 rounded-xl bg-black/40 grid place-items-center border border-white/5 shadow-inner">
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                {stat.label}
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-white mb-3">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-black/20 w-fit px-2.5 py-1 rounded-md border border-white/5">
                <TrendingUp className="size-3 text-emerald-400" />
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Area */}
      <div className="relative z-10 animate-in slide-in-from-bottom-8 delay-500 fill-mode-both mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="size-5 text-cyan-400" /> Essential Workflows
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/metrics" className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(34,211,238,0.15)] cursor-pointer group flex flex-col h-full">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-400 grid place-items-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-lg">
              <Database className="size-7" />
            </div>
            <h3 className="font-bold text-xl text-white group-hover:text-cyan-300 transition-colors mb-3">Optimize Storage</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-1">Dive into industry-standard metrics. Analyze file distribution and identify orphaned files to reduce costs.</p>
            <div className="mt-6 flex items-center gap-2 text-cyan-400 text-sm font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              View Metrics <ArrowRight className="size-4" />
            </div>
          </Link>

          <Link to="/tables" className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(168,85,247,0.15)] cursor-pointer group flex flex-col h-full">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 text-purple-400 grid place-items-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg">
              <Rows3 className="size-7" />
            </div>
            <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors mb-3">Explore Tables</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-1">Browse detailed schemas, table formats, and query metadata directly from S3 manifests without a catalog.</p>
            <div className="mt-6 flex items-center gap-2 text-purple-400 text-sm font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              View Explorer <ArrowRight className="size-4" />
            </div>
          </Link>

          <Link to="/partitions" className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(52,211,153,0.15)] cursor-pointer group flex flex-col h-full">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-400 grid place-items-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-lg">
              <Layers className="size-7" />
            </div>
            <h3 className="font-bold text-xl text-white group-hover:text-emerald-300 transition-colors mb-3">Analyze Partitions</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-1">Review partition keys and pruning statistics to ensure your queries avoid expensive full table scans.</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              View Partitions <ArrowRight className="size-4" />
            </div>
          </Link>
        </div>
      </div>

      <div className="relative z-10 animate-in slide-in-from-bottom-8 delay-700 fill-mode-both pt-6">
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 rounded-3xl p-6 sm:p-8 flex items-start sm:items-center flex-col sm:flex-row gap-6 relative overflow-hidden backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]"></div>
          
          <div className="size-12 rounded-full bg-cyan-500/20 grid place-items-center border border-cyan-500/30 shrink-0">
            <Zap className="size-6 text-cyan-400 animate-pulse" />
          </div>
          
          <div className="flex-1">
            <div className="font-bold text-cyan-400 text-lg sm:text-xl mb-1">Architecture Tip</div>
            <div className="text-sm sm:text-base text-cyan-100/70 leading-relaxed max-w-3xl">
              Start by connecting a live S3 path. NexaGlint will automatically parse the transaction logs and parquet footers to build your schema view entirely locally.
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05050a] font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              Connect Storage
            </button>
          </div>
        </div>
      </div>

      {/* Connect Storage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-strong bg-[#0a0f16]/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="size-5 text-cyan-400" />
                Connect S3 Storage
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                disabled={connectionState === "connecting"}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">S3 Bucket Path</label>
                <input 
                  type="text" 
                  value={s3Path}
                  onChange={(e) => setS3Path(e.target.value)}
                  disabled={connectionState !== "idle"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all placeholder-gray-600 disabled:opacity-50"
                  placeholder="s3://your-bucket/warehouse/"
                />
                <p className="text-xs text-gray-500 mt-2">NexaGlint will recursively scan this path for table manifests.</p>
              </div>

              {/* Status Area */}
              {connectionState === "connecting" && (
                <div className="flex flex-col items-center justify-center py-4 text-cyan-400 animate-in fade-in zoom-in-95">
                  <Loader2 className="size-8 animate-spin mb-3" />
                  <span className="font-medium">Discovering table formats...</span>
                  <span className="text-xs text-cyan-400/60 mt-1">Parsing parquet footers</span>
                </div>
              )}

              {connectionState === "success" && (
                <div className="flex flex-col items-center justify-center py-4 text-emerald-400 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="size-8 mb-3" />
                  <span className="font-medium text-lg">Storage Connected!</span>
                  <span className="text-xs text-emerald-400/60 mt-1">4 tables discovered automatically</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={connectionState !== "idle"}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConnect}
                disabled={connectionState !== "idle"}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05050a] font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {connectionState === "connecting" ? "Scanning..." : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
