import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  getConnections,
  addConnection,
  removeConnection,
  testConnection,
  updateConnection,
  PROVIDER_COLORS,
  PROVIDER_LABELS,
  STATUS_COLORS,
  STATUS_TEXT,
  type CloudConnection,
  type CloudProvider,
} from "@/lib/connections-store";
import { CloudBadge } from "@/components/metastore/CloudBadge";
import {
  Cloud,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Check,
  Database,
  AlertCircle,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/connections")({
  head: () => ({ meta: [{ title: "Connections · NexaGlint · Multi-Cloud" }] }),
  component: ConnectionsPage,
});

// ─── Provider-specific credential fields ─────────────────────────────────────
const PROVIDER_FIELDS: Record<CloudProvider, { key: string; label: string; placeholder: string; type?: string }[]> = {
  "AWS S3": [
    { key: "region",    label: "AWS Region",        placeholder: "us-east-1" },
    { key: "accessKey", label: "Access Key ID",      placeholder: "AKIA...", type: "password" },
    { key: "secretKey", label: "Secret Access Key",  placeholder: "••••••••", type: "password" },
  ],
  "Azure Blob": [
    { key: "accountName", label: "Storage Account Name", placeholder: "myaccount" },
    { key: "sasToken",    label: "SAS Token",            placeholder: "?sv=2023-...", type: "password" },
  ],
  "MinIO": [
    { key: "endpointUrl", label: "Endpoint URL",    placeholder: "http://localhost:9000" },
    { key: "accessKey",   label: "Access Key",      placeholder: "minioadmin" },
    { key: "secretKey",   label: "Secret Key",      placeholder: "••••••••", type: "password" },
  ],
  "GCS": [
    { key: "projectId",  label: "Project ID",      placeholder: "my-gcp-project" },
    { key: "accessKey",  label: "Service Account", placeholder: "sa@project.iam.gserviceaccount.com" },
  ],
};

const PATH_PLACEHOLDER: Record<CloudProvider, string> = {
  "AWS S3":     "s3://my-bucket/warehouse/",
  "Azure Blob": "abfs://container@account.dfs.core.windows.net/path/",
  "MinIO":      "http://localhost:9000/my-bucket/",
  "GCS":        "gs://my-bucket/warehouse/",
};

// ─── Add Connection Modal ─────────────────────────────────────────────────────
function AddConnectionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: CloudConnection) => void }) {
  const [provider, setProvider] = useState<CloudProvider>("AWS S3");
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [providerOpen, setProviderOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [done, setDone] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) setProviderOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !path.trim()) return;
    setTesting(true);
    const conn = addConnection({ name, provider, path, ...creds });
    // run test right away
    await testConnection(conn.id);
    setTesting(false);
    setDone(true);
    // get the latest version with tableCount
    const updated = getConnections().find((c) => c.id === conn.id) ?? conn;
    setTimeout(() => {
      onAdd(updated);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a0f1a]/95 border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 grid place-items-center">
              <Cloud className="size-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Cloud Connection</h2>
              <p className="text-xs text-gray-500">Connect an object store bucket</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* Provider picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cloud Provider</label>
            <div className="relative" ref={providerRef}>
              <button
                onClick={() => setProviderOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white hover:bg-black/40 transition-colors"
              >
                <CloudBadge provider={provider} size="md" />
                {providerOpen ? <ChevronUp className="size-4 text-gray-500" /> : <ChevronDown className="size-4 text-gray-500" />}
              </button>
              {providerOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-[#0a0f1a] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                  {PROVIDER_LABELS.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setProvider(p); setProviderOpen(false); setPath(""); setCreds({}); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${provider === p ? "bg-white/5" : ""}`}
                    >
                      <CloudBadge provider={p} size="md" />
                      {provider === p && <Check className="size-4 text-cyan-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Connection name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Connection Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${provider} Production`}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </div>

          {/* Bucket path */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bucket / Container Path</label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder={PATH_PLACEHOLDER[provider]}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono text-sm transition-all"
            />
          </div>

          {/* Provider-specific credential fields */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Credentials</div>
            {PROVIDER_FIELDS[provider].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                <input
                  type={field.type ?? "text"}
                  value={creds[field.key] ?? ""}
                  onChange={(e) => setCreds((c) => ({ ...c, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all text-sm"
                />
              </div>
            ))}
            <p className="text-xs text-gray-600">Credentials are stored locally and never sent to any server.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !path.trim() || testing || done}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            {done ? (
              <><Check className="size-4" /> Connected!</>
            ) : testing ? (
              <><Loader2 className="size-4 animate-spin" /> Testing...</>
            ) : (
              <><Plus className="size-4" /> Add & Connect</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Connection Card ──────────────────────────────────────────────────────────
function ConnectionCard({
  conn,
  onRemove,
  onTest,
}: {
  conn: CloudConnection;
  onRemove: (id: string) => void;
  onTest: (id: string) => void;
}) {
  const lastChecked = conn.lastChecked
    ? new Date(conn.lastChecked).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "Never";

  return (
    <div className={`glass-strong rounded-3xl border bg-white/5 backdrop-blur-2xl p-6 transition-all duration-300 hover:-translate-y-1 group
      ${conn.status === "connected" ? "border-white/10 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(52,211,153,0.1)]" : ""}
      ${conn.status === "error"     ? "border-red-500/20 hover:border-red-500/40 hover:shadow-[0_8px_30px_rgba(239,68,68,0.1)]" : ""}
      ${conn.status === "checking"  ? "border-yellow-500/20" : ""}
      ${conn.status === "idle"      ? "border-white/10" : ""}
    `}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className={`size-2.5 rounded-full shrink-0 mt-1 ${STATUS_COLORS[conn.status]}`} />
          <div>
            <div className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">{conn.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{STATUS_TEXT[conn.status]}</div>
          </div>
        </div>
        <CloudBadge provider={conn.provider} size="sm" />
      </div>

      {/* Path */}
      <div className="font-mono text-xs text-gray-400 bg-black/30 border border-white/5 px-3 py-2 rounded-xl truncate mb-4">
        {conn.path}
      </div>

      {/* Error message */}
      {conn.status === "error" && conn.errorMessage && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mb-4">
          <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 leading-relaxed">{conn.errorMessage}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Tables</div>
          <div className="text-lg font-bold text-white">{conn.tableCount}</div>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Provider</div>
          <div className="text-xs font-semibold text-gray-300 truncate">{conn.provider}</div>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
            <Clock className="size-3" /> Last checked
          </div>
          <div className="text-xs font-semibold text-gray-300">{lastChecked}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onTest(conn.id)}
          disabled={conn.status === "checking"}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
        >
          {conn.status === "checking" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {conn.status === "checking" ? "Testing..." : "Test Connection"}
        </button>
        <button
          onClick={() => onRemove(conn.id)}
          className="px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all"
          title="Remove connection"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ConnectionsPage() {
  const [connections, setConnections] = useState<CloudConnection[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setConnections(getConnections());

  useEffect(() => {
    refresh();
    window.addEventListener("nexaglint:connections_updated", refresh);
    return () => window.removeEventListener("nexaglint:connections_updated", refresh);
  }, []);

  const handleRemove = (id: string) => {
    removeConnection(id);
    refresh();
  };

  const handleTest = async (id: string) => {
    await testConnection(id);
  };

  const handleAdd = (conn: CloudConnection) => {
    refresh();
  };

  // Compute summary stats
  const totalTables  = connections.reduce((s, c) => s + c.tableCount, 0);
  const connectedCount = connections.filter((c) => c.status === "connected").length;
  const errorCount   = connections.filter((c) => c.status === "error").length;
  const providers    = Array.from(new Set(connections.map((c) => c.provider)));

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full relative animate-in fade-in duration-1000 pb-10">
      {/* Background */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 animate-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
            <Globe className="size-8 text-cyan-400" />
            Connected Clouds
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Manage multiple object store connections — AWS S3, Azure Blob, MinIO, GCS — all in one unified view.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="size-4" /> Add Connection
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 animate-in slide-in-from-bottom-6 delay-100 fill-mode-both">
        {[
          { label: "Total Connections", value: connections.length, icon: Cloud, color: "text-cyan-400", bg: "from-cyan-500/20" },
          { label: "Connected",         value: connectedCount,     icon: Check,  color: "text-emerald-400", bg: "from-emerald-500/20" },
          { label: "Errors",            value: errorCount,         icon: AlertCircle, color: "text-red-400", bg: "from-red-500/20" },
          { label: "Total Tables",      value: totalTables,        icon: Database, color: "text-purple-400", bg: "from-purple-500/20" },
        ].map((stat, i) => (
          <div key={i} className="glass-strong rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.bg} to-transparent opacity-40 rounded-bl-full`} />
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-3">
              <stat.icon className={`size-4 ${stat.color}`} />
              {stat.label}
            </div>
            <div className="text-3xl font-extrabold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Providers active */}
      {providers.length > 0 && (
        <div className="relative z-10 flex flex-wrap items-center gap-3 animate-in slide-in-from-bottom-6 delay-150 fill-mode-both">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Active providers:</span>
          {providers.map((p) => <CloudBadge key={p} provider={p} size="md" />)}
        </div>
      )}

      {/* Connection Cards Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 relative z-10">
        {connections.map((conn, index) => (
          <div key={conn.id} className="animate-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${200 + index * 80}ms` }}>
            <ConnectionCard conn={conn} onRemove={handleRemove} onTest={handleTest} />
          </div>
        ))}

        {/* Add Connection card (ghost) */}
        <button
          onClick={() => setShowModal(true)}
          className="glass rounded-3xl border-2 border-dashed border-white/10 hover:border-cyan-500/40 bg-white/[0.02] hover:bg-white/5 transition-all duration-300 p-8 flex flex-col items-center justify-center gap-3 group min-h-[280px] animate-in slide-in-from-bottom-8 fill-mode-both"
          style={{ animationDelay: `${200 + connections.length * 80}ms` }}
        >
          <div className="size-14 rounded-2xl border border-dashed border-white/20 group-hover:border-cyan-500/40 bg-white/5 grid place-items-center transition-all group-hover:bg-cyan-500/10">
            <Plus className="size-6 text-gray-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="text-sm font-semibold text-gray-600 group-hover:text-cyan-300 transition-colors">Add Cloud Connection</div>
          <div className="text-xs text-gray-700 text-center max-w-[200px] leading-relaxed">
            Connect AWS S3, Azure Blob, MinIO or GCS
          </div>
        </button>
      </div>

      {/* Empty state */}
      {connections.length === 0 && (
        <div className="relative z-10 glass-strong rounded-3xl p-16 text-center border border-white/10 bg-white/5 backdrop-blur-xl animate-in fade-in fill-mode-both">
          <Globe className="size-12 text-gray-700 mx-auto mb-4" />
          <div className="text-xl font-bold text-white mb-2">No connections yet</div>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">Add your first cloud storage connection to start exploring lakehouse metadata.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:scale-105"
          >
            <Plus className="size-4" /> Add First Connection
          </button>
        </div>
      )}

      {/* Add connection modal */}
      {showModal && (
        <AddConnectionModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
