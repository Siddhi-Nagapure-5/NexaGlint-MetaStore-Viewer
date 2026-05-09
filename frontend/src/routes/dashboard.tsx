import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, HardDrive, Rows3, Layers, Zap, ArrowRight, TrendingUp, X, Loader2, CheckCircle2, History, Shield, Key, Globe, Search, Plus, AlertTriangle } from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { tablesApi, type DashboardStats } from "@/lib/api";
import { addConnection } from "@/lib/connections-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · NexaGlint · Lakehouse Metastore" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [s3Path, setS3Path] = useState("s3://lakehouse-prod/warehouse/");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("nexaglint_user") || "null");

  const fetchStats = async () => {
    try {
      const res = await tablesApi.stats();
      setStats(res);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleConnect = async () => {
    setConnectionState("connecting");
    setError(null);
    try {
      const res = await tablesApi.scan({
        path: s3Path,
        aws_access_key_id: user?.aws_access_key,
        aws_secret_access_key: user?.aws_secret_key,
        aws_region: user?.aws_region || "us-east-1"
      });
      
      setDiscoveredCount(res.discovered);
      setConnectionState("success");
      await fetchStats();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setConnectionState("idle");
      }, 2500);
    } catch (err: any) {
      setConnectionState("error");
      setError(err.message || "Failed to scan S3 path. Verify your IAM permissions.");
      setTimeout(() => {
        setConnectionState("idle");
        setError(null);
      }, 6000);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-cyan-400">
        <Loader2 className="size-12 animate-spin mb-4" />
        <span className="text-xl font-bold tracking-widest uppercase">Initializing Metastore...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000 pb-20">
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Zap className="size-3" /> Reality-first Metastore Explorer
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white mb-4">Data Estate Overview</h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Real-time metadata discovery for Iceberg, Delta, and Parquet. Every stat below is aggregated live from your cloud storage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <StatCard icon={<Database className="size-6 text-cyan-400" />} label="Total Tables" value={stats?.totalTables || 0} subtext="Live Count" bg="from-cyan-500/20" />
        <StatCard icon={<Rows3 className="size-6 text-purple-400" />} label="Total Rows" value={formatNumber(stats?.totalRows || 0)} subtext="Aggregated" bg="from-purple-500/20" />
        <StatCard icon={<HardDrive className="size-6 text-pink-400" />} label="Storage Volume" value={formatBytes(stats?.totalSize || 0)} subtext="Physical size" bg="from-pink-500/20" />
        <StatCard icon={<Layers className="size-6 text-emerald-400" />} label="Formats Seen" value={stats?.formats.length || 0} subtext="Diverse formats" bg="from-emerald-500/20" />
      </div>

      {/* IAM SMART DISCOVERY - Exclusive Feature for IAM Users */}
      {user?.aws_access_key && (
        <IAMDiscoveryPanel user={user} onScan={(p) => { setS3Path(p); setIsModalOpen(true); }} />
      )}

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="size-5 text-cyan-400" /> Essential Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/tables" className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-300 group">
              <div className="size-12 rounded-2xl bg-cyan-400/20 text-cyan-400 grid place-items-center mb-4 border border-cyan-500/20">
                <Database className="size-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Explore Tables</h3>
              <p className="text-gray-400 text-sm mb-4">Browse real schemas and query metadata directly from S3.</p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">Launch Explorer <ArrowRight className="size-4" /></div>
            </Link>
            <Link to="/metrics" className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-300 group">
              <div className="size-12 rounded-2xl bg-purple-400/20 text-purple-400 grid place-items-center mb-4 border border-purple-500/20">
                <TrendingUp className="size-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Analyze Growth</h3>
              <p className="text-gray-400 text-sm mb-4">Track storage evolution and row counts across all tables.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">View Metrics <ArrowRight className="size-4" /></div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="size-5 text-pink-400" /> Recent Activity
          </h2>
          <div className="glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="size-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-cyan-400 shrink-0">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <Link to="/tables/$tableId" params={{ tableId: act.id }} className="text-sm font-bold text-white hover:text-cyan-400">{act.name}</Link>
                    <div className="text-[10px] text-gray-500 uppercase mt-0.5">{act.type} · {new Date(act.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-600 text-sm italic">No recent activity detected. Perform a scan to begin.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Storage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-strong bg-[#0a0f16]/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="size-5 text-cyan-400" />
                Connect S3 Storage
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" disabled={connectionState === "connecting"}>
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">S3 Bucket Path</label>
                <input 
                  type="text" 
                  value={s3Path}
                  onChange={(e) => setS3Path(e.target.value)}
                  disabled={connectionState !== "idle"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="s3://your-bucket/warehouse/"
                />
              </div>

              {connectionState === "connecting" && (
                <div className="flex flex-col items-center justify-center py-4 text-cyan-400">
                  <Loader2 className="size-8 animate-spin mb-3" />
                  <span className="font-medium">Discovering live tables...</span>
                </div>
              )}

              {connectionState === "success" && (
                <div className="flex flex-col items-center justify-center py-4 text-emerald-400">
                  <CheckCircle2 className="size-8 mb-3" />
                  <span className="font-medium text-lg">Scan Complete!</span>
                  <span className="text-xs mt-1">{discoveredCount} real tables discovered</span>
                </div>
              )}

              {connectionState === "error" && (
                <div className="flex flex-col items-center justify-center py-4 text-red-400 text-center">
                  <AlertTriangle className="size-8 mb-3" />
                  <span className="font-bold text-lg">Scan Failed</span>
                  <span className="text-xs mt-2 leading-relaxed opacity-80">{error}</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} disabled={connectionState !== "idle"} className="px-5 py-2.5 rounded-xl font-medium text-gray-300">Cancel</button>
              <button 
                onClick={handleConnect}
                disabled={connectionState !== "idle" || !s3Path}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05050a] font-bold"
              >
                Start Scanning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext, bg }: { icon: any, label: string, value: string | number, subtext: string, bg: string }) {
  return (
    <div className="group relative overflow-hidden glass-strong rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${bg} to-transparent opacity-30 rounded-bl-full`} />
      <div className="relative z-10">
        <div className="size-10 rounded-xl bg-black/40 grid place-items-center border border-white/5 mb-4">{icon}</div>
        <div className="text-sm font-medium text-gray-400 mb-1">{label}</div>
        <div className="text-3xl font-black text-white mb-2">{value}</div>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-black/20 px-2 py-0.5 rounded-md border border-white/5">{subtext}</div>
      </div>
    </div>
  );
}

function IAMDiscoveryPanel({ user, onScan }: { user: any, onScan: (p: string) => void }) {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const fetchIAMResources = async () => {
      setLoading(true);
      try {
        const { aws_access_key, aws_secret_key, aws_region } = user;
        const [bList, hStatus] = await Promise.all([
          tablesApi.awsBuckets(aws_access_key, aws_secret_key, aws_region),
          tablesApi.awsIamHealth(aws_access_key, aws_secret_key, aws_region)
        ]);
        setBuckets(bList);
        setHealth(hStatus);
      } catch (e) {
        console.error("IAM Discovery failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchIAMResources();
  }, []);

  const handleQuickAdd = (bucket: string) => {
    const path = `s3://${bucket}/`;
    addConnection({
      name: `Auto: ${bucket}`,
      provider: "AWS S3",
      path: path,
      accessKey: user.aws_access_key,
      secretKey: user.aws_secret_key,
      region: user.aws_region,
    });
    window.dispatchEvent(new CustomEvent("nexaglint:connections_updated"));
    onScan(path); // Trigger a scan with the correct path
  };

  return (
    <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-cyan-500/30 bg-[#0a111a]/80 shadow-[0_20px_50px_rgba(34,211,238,0.1)] relative z-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      
      <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-white/10 shrink-0">
            <Shield className="size-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              IAM Smart Discovery
              <div className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-tighter border border-cyan-400/30">Premium Feature</div>
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mt-1">
              {health?.userName ? `Welcome, ${health.userName}. ` : ""}
              We've automatically scanned your IAM profile. Select a bucket below to instantly sync your metastore.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Access Region</span>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="size-3 text-cyan-400" /> {user.aws_region}
              </span>
           </div>
           <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Credential Status</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Key className="size-3" /> Valid
              </span>
           </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {loading ? (
          <div className="flex items-center gap-3 text-cyan-400/70 font-medium py-6 animate-pulse">
            <Loader2 className="size-5 animate-spin" />
            Analyzing S3 resources...
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {buckets.length > 0 ? (
              buckets.map(bucket => (
                <button 
                  key={bucket}
                  onClick={() => handleQuickAdd(bucket)}
                  className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
                >
                  <div className="size-8 rounded-xl bg-black/40 grid place-items-center group-hover:bg-cyan-500/20 transition-colors">
                    <Database className="size-4 text-gray-400 group-hover:text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">{bucket}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">S3 Bucket</div>
                  </div>
                  <Plus className="size-4 text-gray-600 group-hover:text-cyan-400 ml-2" />
                </button>
              ))
            ) : (
              <div className="text-gray-500 text-sm italic py-4">No buckets found for this IAM user.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
