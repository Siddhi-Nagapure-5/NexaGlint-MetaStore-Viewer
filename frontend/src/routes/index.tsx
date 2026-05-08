import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Database, Layers, GitBranch, BarChart3, Sparkles, Boxes, Play, Cloud, ShieldCheck, Search, Rows3, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "NexaGlint · Metastore Viewer" }],
  }),
  component: Landing,
});

function Landing() {
  const router = useRouter();

  return (
    <div className="bg-[#090b14] min-h-screen text-white pb-24 font-sans selection:bg-cyan-500/30">
      
      {/* Background Grid & Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 blur-[120px] bg-gradient-to-b from-cyan-500/20 to-purple-500/20"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 sm:pt-32 px-4 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-white/10 bg-white/5 text-gray-300 mb-8 backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-400"></span>
          Built for the lakehouse era
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Inspect lakehouse <br />
          tables <span className="text-cyan-400">straight</span> <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">from S3.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          NexaGlint is a metastore viewer for Parquet, Iceberg, Delta and Hudi tables. Point it at an object store path — get schemas, partitions, snapshots and stats. No Hive metastore. No Glue. No surprises.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/auth">
            <Button size="lg" className="rounded-xl border-0 h-12 px-8 font-semibold text-base transition-transform hover:scale-105 bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              Launch Explorer
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="rounded-xl border border-white/10 hover:bg-white/5 h-12 px-8 font-semibold text-base text-white transition-transform hover:scale-105 backdrop-blur-md">
              How it works
            </Button>
          </a>
        </div>
      </section>

      {/* TERMINAL SECTION */}
      <section className="relative z-10 mt-20 px-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-[#111520]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
            <div className="size-3 rounded-full bg-rose-500"></div>
            <div className="size-3 rounded-full bg-amber-500"></div>
            <div className="size-3 rounded-full bg-emerald-500"></div>
            <div className="ml-2 text-xs font-mono text-gray-500">nexaglint ~ scan s3://e6data-lakehouse/warehouse</div>
          </div>
          <div className="p-6 font-mono text-xs sm:text-sm text-gray-300 overflow-x-auto leading-relaxed">
            <div><span className="text-purple-400">$</span> nexaglint scan s3://e6data-lakehouse/warehouse</div>
            <br />
            <div className="grid grid-cols-[1fr_2fr_3fr] gap-4 whitespace-nowrap">
              <div><span className="text-cyan-400 font-bold">ICEBERG</span>   sales/fact_orders</div>
              <div>184M rows · 248 GB · 1,284 files</div>
              <div><span className="text-cyan-400 font-bold">DELTA</span>   web/events_clickstream     9.8B rows · 4.2 TB · 28k files</div>
            </div>
            <br />
            <div className="grid grid-cols-[1fr_2fr_3fr] gap-4 whitespace-nowrap">
              <div><span className="text-cyan-400 font-bold">HUDI</span>      mobility/ride_trips</div>
              <div>612M rows · 1.1 TB · 8.9k files</div>
              <div><span className="text-cyan-400 font-bold">PARQUET</span> observability/raw_app_logs 22B rows · 18.4 TB · 142k files</div>
            </div>
            <br />
            <div className="text-emerald-400">✓ 4 tables discovered in 1.8s</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 mt-32 px-4 max-w-6xl mx-auto" id="features">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Everything your metastore should tell you.</h2>
        <p className="text-gray-400 mb-12 max-w-2xl text-lg">NexaGlint parses table metadata directly from manifests, transaction logs and parquet footers — so you don't need a running catalog service to understand your data.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 hover:bg-[#111520] transition-colors">
            <Layers className="size-6 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Zero metastore required</h3>
            <p className="text-gray-400">Read table metadata straight from object storage. No Hive, no Glue, no AWS console digging.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 hover:bg-[#111520] transition-colors">
            <Boxes className="size-6 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Schema & partition aware</h3>
            <p className="text-gray-400">Column types, nullability, partition keys and pruning stats — surfaced for every supported format.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 hover:bg-[#111520] transition-colors">
            <GitBranch className="size-6 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Snapshot timeline</h3>
            <p className="text-gray-400">Walk through Iceberg snapshots and Delta versions. See what changed, when, and why.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 hover:bg-[#111520] transition-colors">
            <Rows3 className="size-6 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sample data preview</h3>
            <p className="text-gray-400">Peek at the first rows without spinning up a query engine. Verify your assumptions in seconds.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 hover:bg-[#111520] transition-colors">
            <BarChart3 className="size-6 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">File & storage stats</h3>
            <p className="text-gray-400">File counts, sizes, row group layout and compaction opportunities — visible at a glance.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 hover:bg-[#111520] transition-colors">
            <ArrowRight className="size-6 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compare across snapshots</h3>
            <p className="text-gray-400">Track schema evolution and storage growth over time. Spot drift before it breaks downstream.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative z-10 mt-32 px-4 max-w-6xl mx-auto" id="how-it-works">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">How it works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 relative overflow-hidden">
            <div className="text-cyan-400 font-mono text-sm mb-4">01</div>
            <h3 className="text-xl font-semibold mb-2">Point at a bucket</h3>
            <p className="text-gray-400 text-sm">Paste an S3 path. NexaGlint scans for table roots — Iceberg metadata.json, Delta _delta_log, Hudi .hoodie, or raw parquet directories.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 relative overflow-hidden">
            <div className="text-cyan-400 font-mono text-sm mb-4">02</div>
            <h3 className="text-xl font-semibold mb-2">Parse metadata</h3>
            <p className="text-gray-400 text-sm">Manifests, transaction logs and parquet footers are read directly from object storage — no compute cluster needed.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#111520]/50 border border-white/5 relative overflow-hidden">
            <div className="text-cyan-400 font-mono text-sm mb-4">03</div>
            <h3 className="text-xl font-semibold mb-2">Explore visually</h3>
            <p className="text-gray-400 text-sm">Browse schemas, partitions, snapshots and sample rows. Compare versions and spot schema drift.</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/auth">
            <Button size="lg" className="rounded-xl border-0 h-12 px-8 font-semibold text-base transition-transform hover:scale-105 bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              Try the Explorer <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
