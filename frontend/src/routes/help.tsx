import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search, Shield, Zap, Database, Terminal, BarChart3, ChevronRight, CheckCircle2, Mail, ShieldCheck, Key, Cloud } from "lucide-react";

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

      {/* Why NexaGlint? */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-[#111520]/40 border border-white/5 relative overflow-hidden group hover:bg-[#111520]/60 transition-colors">
          <div className="absolute top-0 right-0 size-24 bg-cyan-500/5 rounded-bl-full blur-2xl" />
          <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-cyan-400 mb-4">
            <Zap className="size-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Instant Insights</h3>
          <p className="text-xs text-gray-400 leading-relaxed">No need to wait for a catalog to sync. Get the current state of your S3 data in seconds, exactly as it exists in storage.</p>
        </div>
        <div className="p-8 rounded-3xl bg-[#111520]/40 border border-white/5 relative overflow-hidden group hover:bg-[#111520]/60 transition-colors">
          <div className="absolute top-0 right-0 size-24 bg-purple-500/5 rounded-bl-full blur-2xl" />
          <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 grid place-items-center text-purple-400 mb-4">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Zero Infra Cost</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Runs entirely in your browser and a lightweight backend. No expensive Glue or EMR clusters needed to see your schemas.</p>
        </div>
        <div className="p-8 rounded-3xl bg-[#111520]/40 border border-white/5 relative overflow-hidden group hover:bg-[#111520]/60 transition-colors">
          <div className="absolute top-0 right-0 size-24 bg-emerald-500/5 rounded-bl-full blur-2xl" />
          <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center text-emerald-400 mb-4">
            <Search className="size-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Truth at Source</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Avoid catalog drift. What you see in NexaGlint is exactly what is stored in your S3 bucket, verified via manifest files.</p>
        </div>
      </div>

      {/* Signup Options */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight text-white">Identity & Signup Options</h2>
        <p className="text-gray-400 text-sm max-w-2xl">
          NexaGlint offers two primary ways to access the platform. Choose the one that best fits your role and how you intend to use the tool.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Option 1: Standard */}
          <div className="glass-strong rounded-[2rem] p-8 border border-white/10 bg-[#111520]/40 relative overflow-hidden flex flex-col group hover:bg-[#111520]/60 transition-all">
            <div className="absolute top-0 right-0 size-32 bg-cyan-500/5 rounded-bl-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
            <div className="size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-cyan-400 mb-6 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <Mail className="size-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Standard Email (OTP)</h3>
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 px-2 py-1 bg-cyan-500/5 border border-cyan-500/10 rounded-md inline-block w-fit">
              Best for: Data Analysts & Engineers
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-1">
              The recommended way for long-term use. By signing up with your email, NexaGlint creates a persistent profile for you. This allows you to <strong>watch tables</strong>, save your <strong>S3 connections</strong>, and keep a history of your <strong>SQL queries</strong>.
            </p>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="size-3 text-emerald-400" /> Passwordless OTP security
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="size-3 text-emerald-400" /> Persistent workspace settings
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="size-3 text-emerald-400" /> Multi-device synchronization
              </div>
            </div>
          </div>

          {/* Option 2: Cloud */}
          <div className="glass-strong rounded-[2rem] p-8 border border-white/10 bg-[#111520]/40 relative overflow-hidden flex flex-col group hover:bg-[#111520]/60 transition-all">
            <div className="absolute top-0 right-0 size-32 bg-purple-500/5 rounded-bl-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="size-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 grid place-items-center text-purple-400 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <Cloud className="size-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">IAM Cloud Login</h3>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 px-2 py-1 bg-purple-500/5 border border-purple-500/10 rounded-md inline-block w-fit">
              Best for: Cloud Admins & DevOps
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-1">
              Perfect for quick, identity-first exploration. Use your existing <strong>AWS IAM credentials</strong> to jump straight into the dashboard. No email signup required—your cloud identity <i>is</i> your login.
            </p>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="size-3 text-emerald-400" /> No separate account needed
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="size-3 text-emerald-400" /> Direct access to S3 resources
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="size-3 text-emerald-400" /> Instant session creation
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
          <ShieldCheck className="size-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">A Note on Security</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Regardless of the method you choose, NexaGlint never stores your AWS Root keys. We use industry-standard encryption for all session tokens and recommend using limited-scope IAM keys (AmazonS3ReadOnlyAccess) for maximum safety.
            </p>
          </div>
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
