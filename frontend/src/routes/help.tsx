import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search, Shield, Zap, Database, Terminal, BarChart3, ChevronRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help Desk · NexaGlint" }] }),
  component: HelpDeskPage,
});

function HelpDeskPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="relative">
        <div className="absolute -top-20 -left-20 size-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
          <BookOpen className="size-3" /> User Guide
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-4">NexaGlint Help Desk</h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Welcome to the NexaGlint lakehouse metastore viewer. This guide will walk you through the primary purpose of the platform and exactly how to use it.
        </p>
      </div>

      {/* Main Purpose */}
      <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-[#111520]/80 backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-bl-full blur-[50px] pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <Zap className="size-6 text-cyan-400" />
          The Purpose of NexaGlint
        </h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            NexaGlint is designed to be a <strong>reality-first metastore viewer</strong>. Unlike traditional data catalogs that require heavy infrastructure (like Hive Metastore or AWS Glue) to constantly sync and update, NexaGlint goes straight to the source.
          </p>
          <p>
            By directly scanning the raw storage files (like <span className="text-white font-semibold">Iceberg metadata.json</span>, <span className="text-white font-semibold">Delta _delta_log</span>, or raw Parquet footers) resting in your S3 buckets, NexaGlint can instantly map out your entire data estate without spinning up compute clusters.
          </p>
        </div>
      </section>

      {/* Step by step guide */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight text-white">Step-by-Step Guide</h2>
        
        <div className="grid gap-6">
          
          {/* Step 1 */}
          <div className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-md flex gap-6">
            <div className="shrink-0 size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-cyan-400 font-black text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="size-5 text-gray-400" /> Connecting your AWS Identity
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Before NexaGlint can explore your data, it needs read-only access to your cloud storage.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Navigate to the <span className="font-bold text-white">Settings</span> page via the sidebar.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Select the <span className="font-bold text-white">Cloud Identity</span> tab.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Enter your AWS Access Key ID, Secret Access Key, and select your Region. Hit Save.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-md flex gap-6">
            <div className="shrink-0 size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 grid place-items-center text-purple-400 font-black text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Database className="size-5 text-gray-400" /> Discovering Tables (Smart Discovery)
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Once connected, NexaGlint can automatically locate your tables.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Go to the <span className="font-bold text-white">Dashboard</span>. If your IAM keys are valid, the IAM Smart Discovery panel will appear.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Click on any bucket to instantly start scanning it. NexaGlint will find Iceberg, Delta, Hudi, and Parquet tables.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Alternatively, manually add S3 paths via the <span className="font-bold text-white">Connections</span> tab.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-md flex gap-6">
            <div className="shrink-0 size-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 grid place-items-center text-pink-400 font-black text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Search className="size-5 text-gray-400" /> Exploring Table Metadata
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Dive deep into the physical and logical layout of any discovered table.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Navigate to the <span className="font-bold text-white">Tables Explorer</span> to see a master list of all discovered assets.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Click on any table to view its live <span className="font-bold text-white">Schema</span>, including column types and partition keys.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  View historical changes under the <span className="font-bold text-white">Snapshots</span> tab, or preview the actual raw data instantly.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-md flex gap-6">
            <div className="shrink-0 size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center text-emerald-400 font-black text-xl">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Terminal className="size-5 text-gray-400" /> Querying Live Data
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                NexaGlint includes a built-in SQL engine powered by DuckDB to let you query S3 directly.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Open the <span className="font-bold text-white">Query Workspace</span> from the sidebar.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Click any table in the left sidebar to automatically generate a valid SELECT query.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
                  Hit <span className="font-bold text-white">Execute</span> to run analytical queries over the network without downloading the full dataset.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Pro-tips */}
      <section className="mt-12 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
        <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
          <BarChart3 className="size-4" /> Pro Tip: Table Watching
        </h3>
        <p className="text-sm text-cyan-100/70 leading-relaxed">
          If there's a critical table you want to monitor, click the "Watch Table" button in the Tables Explorer. NexaGlint will track it in the background and notify you of any schema drifts, row drops, or new snapshot commits via the bell icon in the top right.
        </p>
      </section>

    </div>
  );
}
