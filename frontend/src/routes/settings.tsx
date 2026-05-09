import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Database, Zap, HardDrive, Bell, User, Key, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NexaGlint" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nexaglint_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative">
        <div className="absolute -top-20 -left-20 size-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Platform Settings</h1>
        <p className="text-gray-400 font-medium">Manage your cloud identity, storage connections, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar-ish tabs (Visual only for now) */}
        <div className="space-y-1">
          {[
            { label: "General", Icon: User, active: true },
            { label: "Cloud Identity", Icon: Key },
            { label: "Storage & Engines", Icon: Database },
            { label: "Notifications", Icon: Bell },
            { label: "Security", Icon: Shield },
          ].map((tab) => (
            <button key={tab.label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${tab.active ? "bg-white/10 text-cyan-400 border border-white/10 shadow-lg" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
              <tab.Icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* Cloud Identity Section */}
          <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
                <Key className="size-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AWS Identity</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Current Active Session</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Access Key ID</label>
                <Input 
                  readOnly 
                  value={user?.aws_access_key || "Not connected"} 
                  className="h-12 bg-black/40 border-white/10 rounded-xl px-4 text-cyan-100 font-mono text-sm focus:ring-cyan-500/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Secret Access Key</label>
                <Input 
                  type="password" 
                  readOnly 
                  value={user?.aws_secret_key ? "••••••••••••••••" : "Not connected"} 
                  className="h-12 bg-black/40 border-white/10 rounded-xl px-4 text-cyan-100 font-mono text-sm focus:ring-cyan-500/50" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Default Region</label>
                  <Select disabled value={user?.aws_region || "us-east-1"}>
                    <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl pl-4 pr-4 opacity-60">
                      <div className="flex items-center gap-3">
                        <Globe className="size-4 text-gray-600" />
                        <SelectValue placeholder="Select region" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                      <SelectGroup>
                        <SelectLabel className="text-gray-500">North America</SelectLabel>
                        <SelectItem value="us-east-1">us-east-1</SelectItem>
                        <SelectItem value="us-east-2">us-east-2</SelectItem>
                        <SelectItem value="us-west-1">us-west-1</SelectItem>
                        <SelectItem value="us-west-2">us-west-2</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-gray-500">Asia Pacific</SelectLabel>
                        <SelectItem value="ap-south-1">ap-south-1</SelectItem>
                        <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
                        <SelectItem value="ap-southeast-2">ap-southeast-2</SelectItem>
                        <SelectItem value="ap-northeast-1">ap-northeast-1</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Status</label>
                  <div className="h-12 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    STS Validated
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Section */}
          <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 grid place-items-center">
                <Zap className="size-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Engine Preferences</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Performance & Caching</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm font-bold text-white">DuckDB 0.10.1 (Live Mode)</div>
                  <div className="text-xs text-gray-500 mt-1">Execute SQL directly against S3 manifests.</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                <div>
                  <div className="text-sm font-bold text-white">Trino Passthrough</div>
                  <div className="text-xs text-gray-500 mt-1">Connect to a remote Trino cluster for large scans.</div>
                </div>
                <Switch />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4">
             <Button variant="ghost" className="rounded-xl px-8 h-12 font-bold text-gray-500 hover:text-white transition-colors">Discard</Button>
             <Button className="rounded-xl px-8 h-12 font-bold text-black border-0 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all" style={{ background: "var(--gradient-brand)" }}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
