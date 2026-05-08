import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Area, AreaChart, Pie, PieChart, Cell, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBytes, tables } from "@/lib/mock-data";
import { Activity, Database, HardDrive, LayoutTemplate, TrendingDown, DollarSign, PieChart as PieChartIcon } from "lucide-react";

export const Route = createFileRoute("/metrics")({
  head: () => ({ meta: [{ title: "Metrics · Lakehouse Metastore" }] }),
  component: () => {
    // Bar Chart Data
    const data = tables.map((t) => ({ name: t.name, sizeGB: +(t.sizeBytes / 1e9).toFixed(2), files: t.snapshots.length * 12 + 30 }));
    
    // Area Chart Data (Trend over time)
    const trendData = Array.from({ length: 12 }, (_, i) => {
      const month = `M${i + 1}`;
      const totalSizeGB = tables.reduce((acc, t) => {
        const m = t.metrics?.find(x => x.date === month);
        return acc + (m ? m.sizeMB / 1024 : 0);
      }, 0);
      return { date: month, StorageGrowth: +(totalSizeGB * (1 + i * 0.05)).toFixed(2) }; // adding slight artificial growth curve
    });

    // Pie Chart Data
    const formatData = Array.from(
      tables.reduce((acc, t) => {
        acc.set(t.format, (acc.get(t.format) || 0) + t.sizeBytes);
        return acc;
      }, new Map<string, number>())
    ).map(([name, size]) => ({ name, value: +(size / 1e9).toFixed(2) }));
    const PIE_COLORS = ['#22d3ee', '#a855f7', '#ec4899', '#f59e0b'];

    return (
      <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
        {/* Background Ambience */}
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

        <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
            <Activity className="size-8 text-cyan-400" />
            Platform Metrics
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">Industry-standard metrics for storage optimization, query costs, and catalog scalability.</p>
        </div>

        {/* High-Level Industry KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 animate-in slide-in-from-bottom-6 delay-100 fill-mode-both">
          <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
              <HardDrive className="size-4 text-cyan-400" /> Total Storage Managed
            </div>
            <div className="text-2xl font-bold text-white">3.44 TB</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">+12.4% from last month</div>
          </div>
          <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
              <TrendingDown className="size-4 text-emerald-400" /> Orphaned File Savings
            </div>
            <div className="text-2xl font-bold text-white">142.8 GB</div>
            <div className="text-xs text-gray-400 mt-2">Identified via vacuum simulation</div>
          </div>
          <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
              <DollarSign className="size-4 text-purple-400" /> Est. Compute Savings
            </div>
            <div className="text-2xl font-bold text-white">$4,250 <span className="text-sm font-medium text-gray-500">/mo</span></div>
            <div className="text-xs text-gray-400 mt-2">Saved by avoiding live catalog polling</div>
          </div>
          <div className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-2">
              <LayoutTemplate className="size-4 text-pink-400" /> Active Partitions
            </div>
            <div className="text-2xl font-bold text-white">1,204</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">Highly optimized pruning</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 relative z-10 animate-in slide-in-from-bottom-8 delay-200 fill-mode-both">
          {/* Storage Trend Area Chart */}
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
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(10, 15, 25, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                    itemStyle={{ color: "#22d3ee", fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="StorageGrowth" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Format Distribution Pie Chart */}
          <div className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg flex flex-col">
            <div className="flex items-center gap-2 text-lg font-bold text-white mb-6">
              <PieChartIcon className="size-5 text-purple-400" />
              Format Distribution
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ background: "rgba(10, 15, 25, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: "20px" }} />
                  <Pie
                    data={formatData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {formatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Existing Bar Chart - Distribution by Table */}
        <div className="relative z-10 glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg animate-in slide-in-from-bottom-10 delay-300 fill-mode-both">
          <div className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Database className="size-5 text-pink-400" />
            Storage & Files Details by Table
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: "rgba(10, 15, 25, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: "20px" }} iconType="circle" />
                <Bar dataKey="sizeGB" name="Storage (GB)" fill="url(#colorSize)" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="files" name="File Count" fill="url(#colorFiles)" radius={[4, 4, 0, 0]} barSize={40} />
                
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                  </linearGradient>
                  <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    );
  },
});
