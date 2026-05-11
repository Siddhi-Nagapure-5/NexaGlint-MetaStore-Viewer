import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Database, Zap, HardDrive, Bell, User, Key, Globe, ChevronDown } from "lucide-react";
import { authApi } from "@/lib/api";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NexaGlint" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Cloud Identity");
  const [user, setUser] = useState<any>(null);
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nexaglint_user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      if (u.aws_access_key) setAwsAccessKey(u.aws_access_key);
      if (u.aws_secret_key) setAwsSecretKey(u.aws_secret_key);
      if (u.aws_region) setAwsRegion(u.aws_region);
    }
  }, []);

  const handleSave = async () => {
    setSaveMessage(null);
    if (!awsAccessKey || !awsSecretKey) {
      setSaveMessage({ type: "error", text: "Please enter both Access Key and Secret Key." });
      return;
    }
    setSaving(true);
    try {
      const res = await authApi.awsLogin(awsAccessKey, awsSecretKey, awsRegion || "us-east-1");
      localStorage.setItem("nexaglint_user", JSON.stringify(res.user));
      if (res.access_token) {
        localStorage.setItem("nexaglint_token", res.access_token);
      }
      setUser(res.user);
      setSaveMessage({ type: "success", text: "Settings saved and STS Validated successfully!" });
    } catch (e: any) {
      setSaveMessage({ type: "error", text: e.message || "Failed to validate AWS credentials." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

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
            { label: "General", Icon: User },
            { label: "Cloud Identity", Icon: Key },
            { label: "Storage & Engines", Icon: Database },
            { label: "Notifications", Icon: Bell },
            { label: "Security", Icon: Shield },
          ].map((tab) => (
            <button 
              key={tab.label} 
              onClick={() => setActiveTab(tab.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.label ? "bg-white/10 text-cyan-400 border border-white/10 shadow-lg" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
            >
              <tab.Icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-8">
          {activeTab === "General" && (
            <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3 mb-2">
                 <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 grid place-items-center">
                   <User className="size-5 text-blue-400" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-white">General Information</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Personal Profile</p>
                 </div>
               </div>
               <div className="grid gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                   <Input value={user?.name || "NexaGlint User"} readOnly className="h-12 bg-black/40 border-white/10 rounded-xl px-4 text-cyan-100 font-mono text-sm opacity-60" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                   <Input value={user?.email || "user@nexaglint.io"} readOnly className="h-12 bg-black/40 border-white/10 rounded-xl px-4 text-cyan-100 font-mono text-sm opacity-60" />
                 </div>
               </div>
            </section>
          )}

          {/* Cloud Identity Section */}
          {activeTab === "Cloud Identity" && (
            <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
                  value={awsAccessKey}
                  onChange={(e) => setAwsAccessKey(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE" 
                  className="h-12 bg-black/40 border-white/10 rounded-xl px-4 text-cyan-100 font-mono text-sm focus:ring-cyan-500/50 placeholder:text-gray-600" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Secret Access Key</label>
                <Input 
                  type="password" 
                  value={awsSecretKey}
                  onChange={(e) => setAwsSecretKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" 
                  className="h-12 bg-black/40 border-white/10 rounded-xl px-4 text-cyan-100 font-mono text-sm focus:ring-cyan-500/50 placeholder:text-gray-600" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Default Region</label>
                  <Select value={awsRegion} onValueChange={setAwsRegion}>
                    <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl pl-4 pr-4">
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
                        <SelectItem value="ca-central-1">ca-central-1</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-gray-500">Europe</SelectLabel>
                        <SelectItem value="eu-central-1">eu-central-1</SelectItem>
                        <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                        <SelectItem value="eu-west-2">eu-west-2</SelectItem>
                        <SelectItem value="eu-west-3">eu-west-3</SelectItem>
                        <SelectItem value="eu-north-1">eu-north-1</SelectItem>
                        <SelectItem value="eu-south-1">eu-south-1</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-gray-500">Asia Pacific</SelectLabel>
                        <SelectItem value="ap-south-1">ap-south-1</SelectItem>
                        <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
                        <SelectItem value="ap-southeast-2">ap-southeast-2</SelectItem>
                        <SelectItem value="ap-northeast-1">ap-northeast-1</SelectItem>
                        <SelectItem value="ap-northeast-2">ap-northeast-2</SelectItem>
                        <SelectItem value="ap-northeast-3">ap-northeast-3</SelectItem>
                        <SelectItem value="ap-east-1">ap-east-1</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-gray-500">Middle East & Africa</SelectLabel>
                        <SelectItem value="me-south-1">me-south-1</SelectItem>
                        <SelectItem value="me-central-1">me-central-1</SelectItem>
                        <SelectItem value="af-south-1">af-south-1</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-gray-500">South America</SelectLabel>
                        <SelectItem value="sa-east-1">sa-east-1</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Status</label>
                  {user?.aws_access_key ? (
                    <div className="h-12 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      STS Validated
                    </div>
                  ) : (
                    <div className="h-12 bg-gray-500/5 border border-gray-500/20 rounded-xl px-4 flex items-center gap-2 text-gray-400 text-sm font-bold">
                      <div className="size-2 rounded-full bg-gray-500" />
                      Not Connected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
          )}

          {/* Performance Section */}
          {activeTab === "Storage & Engines" && (
            <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
          )}

          {activeTab === "Notifications" && (
            <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3 mb-2">
                 <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/20 grid place-items-center">
                   <Bell className="size-5 text-pink-400" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Alerts & Updates</p>
                 </div>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-sm font-bold text-white">Schema Change Alerts</div>
                     <div className="text-xs text-gray-500 mt-1">Get notified when a table schema evolves.</div>
                   </div>
                   <Switch defaultChecked />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-sm font-bold text-white">Email Digest</div>
                     <div className="text-xs text-gray-500 mt-1">Receive daily summaries of metastore activity.</div>
                   </div>
                   <Switch />
                 </div>
               </div>
            </section>
          )}

          {activeTab === "Security" && (
            <section className="glass-strong rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3 mb-2">
                 <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                   <Shield className="size-5 text-emerald-400" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-white">Security Settings</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Account Protection</p>
                 </div>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</div>
                     <div className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</div>
                   </div>
                   <Switch />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                   <div>
                     <div className="text-sm font-bold text-white">SSO Integration</div>
                     <div className="text-xs text-gray-500 mt-1">Login using your corporate identity provider.</div>
                   </div>
                   <Switch disabled />
                 </div>
               </div>
            </section>
          )}

          <div className="flex items-center justify-between gap-4 mt-6">
             {saveMessage ? (
               <div className={`text-sm font-bold ${saveMessage.type === "success" ? "text-emerald-400" : "text-red-400"} animate-in fade-in`}>
                 {saveMessage.text}
               </div>
             ) : (
               <div />
             )}
             <div className="flex gap-4">
               <Button variant="ghost" className="rounded-xl px-8 h-12 font-bold text-gray-500 hover:text-white transition-colors">Discard</Button>
               <Button onClick={handleSave} disabled={saving} className="rounded-xl px-8 h-12 font-bold text-black border-0 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all" style={{ background: "var(--gradient-brand)" }}>
                 {saving ? <><Loader2 className="size-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
