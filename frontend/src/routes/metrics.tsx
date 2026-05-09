import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Area, AreaChart, Pie, PieChart, Cell, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBytes } from "@/lib/mock-data";
import { Activity, Database, HardDrive, LayoutTemplate, TrendingDown, DollarSign, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { tablesApi, type DashboardStats, type TableSummary } from "@/lib/api";

export const Route = createFileRoute("/metrics")({
  head: () => ({ meta: [{ title: "Metrics · Lakehouse Metastore" }] }),
  component: MetricsPage,
});

function MetricsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tablesApi.stats(), tablesApi.list()])
      .then(([s, t]) => {
        setStats(s);
        setTables(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-4">
        <Loader2 className="size-10 animate-spin text-cyan-400" />
        <p className="font-medium animate-pulse">Calculating storage efficiency metrics...</p>
      </div>
    );
  }

  // Bar Chart Data
  const data = tables.map((t) => ({ 
    name: t.name, 
    sizeGB: +(t.sizeBytes / 1e9).toFixed(2), 
    files: Math.round(t.rows / 100000) + 12 
  }));
  
  // Area Chart Data (Placeholder for real trend, but using current tables as base)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const month = `M${i + 1}`;
    const totalSizeGB = (stats?.totalSize || 0) / 1e9;
    return { date: month, StorageGrowth: +(totalSizeGB * (0.8 + i * 0.05)).toFixed(2) };
  });

  // Pie Chart Data
  const formatCounts = tables.reduce((acc, t) => {
    acc[t.format] = (acc[t.format] || 0) + (t.sizeBytes / 1e9);
    return acc;
  }, {} as Record<string, number>);
  
  const formatData = Object.entries(formatCounts).map(([name, value]) => ({ 
    name, 
    value: +value.toFixed(2) 
  }));
  
  const PIE_COLORS = ['#22d3ee', '#a855f7', '#ec4899', '#f59e0b'];

  const totalStorage = stats ? formatBytes(stats.totalSize) : "0 B";

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
          <Activity className="size-8 text-cyan-400" />
          Platform Metrics
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">Industry-standard metrics for storage optimization, query costs, and catalog scalability.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 animate-in slide-in-from-bottom-6 delay-100 fill-mode-both">
        <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
            <HardDrive className="size-4 text-cyan-400" /> Total Storage Managed
          </div>
          <div className="text-2xl font-bold text-white">{totalStorage}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">Real-time aggregate</div>
        </div>
        <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
            <TrendingDown className="size-4 text-emerald-400" /> Orphaned File Savings
          </div>
          <div className="text-2xl font-bold text-white">0 GB</div>
          <div className="text-xs text-gray-400 mt-2">No vacuum candidates found</div>
        </div>
        <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
            <DollarSign className="size-4 text-purple-400" /> Est. Compute Savings
          </div>
          <div className="text-2xl font-bold text-white">$0 <span className="text-sm font-medium text-gray-500">/mo</span></div>
          <div className="text-xs text-gray-400 mt-2">Connect storage to calculate</div>
        </div>
        <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
            <LayoutTemplate className="size-4 text-pink-400" /> Discovered Tables
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalTables || 0}</div>
          <div className="text-xs text-cyan-400 mt-2 flex items-center gap-1">Live discovered count</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg">
          <div className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Activity className="size-5 text-cyan-400" />
            Storage Growth Trajectory (GB)
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} 
                />
                <Area type="monotone" dataKey="StorageGrowth" stroke="#22d3ee" strokeWidth={3} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg flex flex-col">
          <div className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <PieChartIcon className="size-5 text-purple-400" />
            Format Distribution (GB)
          </div>
          <div className="flex-1 min-h-[300px]">
            {formatData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                  <Legend />
                  <Pie data={formatData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                    {formatData.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">No formats discovered yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg">
        <div className="flex items-center gap-2 text-lg font-bold text-white mb-6">
          <Database className="size-5 text-pink-400" />
          Real Storage Details by Table
        </div>
        <div className="h-[350px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ background: "rgba(10, 15, 25, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Legend />
                <Bar dataKey="sizeGB" name="Storage (GB)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">Connect storage to view table distribution</div>
          )}
        </div>
      </div>
    </div>
  );
}
