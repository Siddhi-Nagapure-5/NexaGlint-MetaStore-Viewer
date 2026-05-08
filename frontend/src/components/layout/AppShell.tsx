import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Cloud, CheckCircle2, Loader2, Zap, Menu, X, LayoutDashboard, Search, Boxes, GitBranch, BarChart3, Settings, LogOut, Layers } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/tables", label: "Tables Explorer", Icon: Search },
  { to: "/partitions", label: "Partitions", Icon: Boxes },
  { to: "/snapshots", label: "Snapshots", Icon: GitBranch },
  { to: "/metrics", label: "Metrics", Icon: BarChart3 },
] as const;

const accountNav = [
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/", label: "Disconnect", Icon: LogOut },
];

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [bucket, setBucket] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nexaglint_bucket") || "s3://lakehouse/warehouse";
    }
    return "s3://lakehouse/warehouse";
  });
  const [status, setStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [open, setOpen] = useState(false);
  const isHome = path === "/";

  const connect = () => {
    if (!bucket) return;
    setStatus("loading");
    localStorage.setItem("nexaglint_bucket", bucket);
    setTimeout(() => setStatus("connected"), 900);
  };

  const isAuth = path.startsWith("/auth");

  if (isAuth) {
    return <Outlet />;
  }

  const [collapsed, setCollapsed] = useState(false);

  if (isHome) {
    return (
      <div className="min-h-screen flex flex-col w-full text-white bg-[#090b14] selection:bg-cyan-500/30">
        <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full relative z-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-9 rounded-xl grid place-items-center bg-gradient-to-b from-[#00d2ff] to-[#007aff] shadow-[0_0_20px_rgba(0,210,255,0.4)] relative">
              <div className="absolute inset-0 bg-white/10 rounded-xl" />
              <Layers className="size-5 text-[#05050a] relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight mt-0.5">
              <span className="text-[22px] font-extrabold tracking-tight text-white">NexaGlint</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold mt-[-2px]">Metastore</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#formats" className="hover:text-white transition-colors">Formats</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          </div>

          <div className="flex items-center">
            <Link to="/auth">
              <Button className="rounded-xl border-0 h-10 px-6 font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-105 transition-transform">
                Open Explorer
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 w-full relative z-10">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full text-white bg-[#05050a] selection:bg-cyan-500/30 font-sans">
      {/* SIDEBAR */}
      <aside className={cn(
        "border-r border-white/10 flex flex-col h-screen sticky top-0 bg-[#090b14]/80 backdrop-blur-2xl z-20 transition-all duration-300",
        collapsed ? "w-[80px]" : "w-64"
      )}>
        <div className={cn("p-6 flex items-center mb-2", collapsed ? "justify-center px-0" : "gap-3")}>
          <div className="size-9 rounded-xl grid place-items-center shrink-0 bg-gradient-to-b from-[#00d2ff] to-[#007aff] shadow-[0_0_20px_rgba(0,210,255,0.4)] relative cursor-pointer" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
            <div className="absolute inset-0 bg-white/10 rounded-xl" />
            <Layers className="size-5 text-[#05050a] relative z-10" strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="font-extrabold tracking-tight text-xl text-white mt-0.5 truncate">NexaGlint</span>}
        </div>

        {!collapsed && (
          <div className="px-4 pb-2 pt-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase whitespace-nowrap">
            Navigation
          </div>
        )}
        <nav className={cn("flex-1 space-y-1", collapsed ? "px-3" : "px-3")}>
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} title={collapsed ? n.label : undefined}
                className={cn(
                  "flex items-center text-sm rounded-xl transition-all duration-300",
                  collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  active 
                    ? "bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 font-semibold border border-cyan-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}>
                <n.Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4", active ? "text-cyan-400" : "text-gray-500")} />
                {!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 pt-8 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase whitespace-nowrap">
            Account
          </div>
        )}
        <nav className={cn("space-y-1 mb-6", collapsed ? "px-3" : "px-3")}>
          {accountNav.map((n) => (
            <Link key={n.to} to={n.to} title={collapsed ? n.label : undefined}
              className={cn(
                "flex items-center text-sm rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300",
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
              )}>
              <n.Icon className={cn("shrink-0 text-gray-500", collapsed ? "size-5" : "size-4")} />
              {!collapsed && <span>{n.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className={cn(
          "m-3 mt-0 rounded-2xl border border-white/5 bg-white/5 flex items-center backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer",
          collapsed ? "p-2 justify-center" : "p-4 gap-3"
        )}>
          <div className={cn("rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 grid place-items-center text-white font-bold shadow-md shrink-0", collapsed ? "size-10 text-base" : "size-9 text-sm")}>
            U
          </div>
          {!collapsed && (
            <div className="text-xs overflow-hidden">
              <div className="font-semibold text-white truncate">lakehouse-user</div>
              <div className="text-cyan-400/80 truncate text-[10px] uppercase tracking-wider mt-0.5 font-medium">Connected via S3</div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Global Ambient Glow for Main Area */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />
        
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#05050a]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Menu className="size-5 text-gray-400 hover:text-white cursor-pointer transition-colors" onClick={() => setCollapsed(!collapsed)} />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center gap-2 shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-colors hover:bg-cyan-500/20 cursor-pointer">
              <Zap className="size-3.5 text-cyan-400 animate-pulse" /> AWS Connected
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 relative z-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
