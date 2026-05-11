import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { Zap, Menu, LayoutDashboard, Search, Boxes, GitBranch, BarChart3, Settings, LogOut, Layers, Bell, Eye, X, AlertTriangle, GitCommit, TrendingDown, Globe, Terminal, BookOpen } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getAlerts,
  getUnreadCount,
  markAllRead,
  markRead,
  simulatePolling,
  type WatchAlert,
} from "@/lib/watch-store";
import { clearToken, USER_KEY, getToken } from "@/lib/api";

const nav = [
  { to: "/dashboard",   label: "Dashboard",       Icon: LayoutDashboard },
  { to: "/tables",      label: "Tables Explorer",  Icon: Search },
  { to: "/query",       label: "Query Workspace",  Icon: Terminal },
  { to: "/connections", label: "Connections",       Icon: Globe },
  { to: "/partitions",  label: "Partitions",        Icon: Boxes },
  { to: "/snapshots",   label: "Snapshots",         Icon: GitBranch },
  { to: "/metrics",     label: "Metrics",           Icon: BarChart3 },
] as const;

const accountNav = [
  { to: "/help", label: "Help Desk", Icon: BookOpen },
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/", label: "Disconnect", Icon: LogOut },
];

const ALERT_ICONS: Record<WatchAlert["type"], React.ReactNode> = {
  new_snapshot: <GitCommit className="size-4 text-cyan-400" />,
  schema_change: <AlertTriangle className="size-4 text-yellow-400" />,
  row_drop: <TrendingDown className="size-4 text-red-400" />,
  new_table: <Eye className="size-4 text-emerald-400" />,
};

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const isHome = path === "/";

  // ── Current user from localStorage ─────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
    } catch { return null; }
  });
  const userInitial = (user?.name || user?.email || "U")[0].toUpperCase();
  const userLabel = user?.name || user?.email || "lakehouse-user";

  // ── Notifications ──────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<WatchAlert[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const refreshAlerts = async () => {
    try {
      const realAlerts = await getAlerts();
      setAlerts(realAlerts);
      setUnread(realAlerts.filter(a => !a.read).length);
    } catch { /* not logged in */ }
  };

  useEffect(() => {
    if (!user) return;
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    refreshAlerts();
  };


  const isAuth = path.startsWith("/auth");
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // ── Auth Protection & Sync ────────────────────────────────────────────
  useEffect(() => {
    // Hard purge old mock connections if they still exist in localStorage
    try {
      const connections = JSON.parse(localStorage.getItem("nexaglint_connections") ?? "[]");
      const hasMock = connections.some((c: any) => c.name === "AWS Production" || c.name === "Azure Staging");
      if (hasMock) {
        localStorage.setItem("nexaglint_connections", JSON.stringify([]));
        window.dispatchEvent(new CustomEvent("nexaglint:connections_updated"));
      }
    } catch (e) {
      console.error("Purge failed", e);
    }

    // Sync user state from localStorage on route change
    const storedUser = JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
    if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
      setUser(storedUser);
    }

    if (!isHome && !isAuth && !storedUser) {
      router.navigate({ to: "/auth" });
    }
  }, [path, isHome, isAuth]);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    router.navigate({ to: "/auth" });
  };

  if (isAuth) {
    return <Outlet />;
  }

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

          <div className="flex items-center gap-3">
            <Link to="/help" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mr-2">
              Help Desk
            </Link>
            {getToken() ? (
              <>
                <button
                  onClick={() => { clearToken(); setUser(null); router.navigate({ to: "/auth" }); }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign out
                </button>
                <Link to="/dashboard">
                  <Button className="rounded-xl border-0 h-10 px-6 font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-105 transition-transform">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button className="rounded-xl border-0 h-10 px-6 font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-105 transition-transform">
                  Open Explorer
                </Button>
              </Link>
            )}
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
            n.label === "Disconnect" ? (
              <button key={n.label} 
                onClick={handleLogout}
                title={collapsed ? n.label : undefined}
                className={cn(
                  "w-full flex items-center text-sm rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-300",
                  collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                )}>
                <n.Icon className={cn("shrink-0 text-gray-500", collapsed ? "size-5" : "size-4")} />
                {!collapsed && <span>{n.label}</span>}
              </button>
            ) : (
              <Link key={n.to} to={n.to} title={collapsed ? n.label : undefined}
                className={cn(
                  "flex items-center text-sm rounded-xl transition-all duration-300",
                  collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  path.startsWith(n.to)
                    ? "bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 font-semibold border border-cyan-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}>
                <n.Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4", path.startsWith(n.to) ? "text-cyan-400" : "text-gray-500")} />
                {!collapsed && <span>{n.label}</span>}
              </Link>
            )
          ))}
        </nav>
        
        <Link to="/settings" className={cn(
          "m-3 mt-0 rounded-2xl border border-white/5 bg-white/5 flex items-center backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer",
          collapsed ? "p-2 justify-center" : "p-4 gap-3",
          path.startsWith("/settings") && "border-cyan-500/20 bg-cyan-500/5"
        )}>
          <div className={cn("rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 grid place-items-center text-white font-bold shadow-md shrink-0", collapsed ? "size-10 text-base" : "size-9 text-sm")}>
            {userInitial}
          </div>
          {!collapsed && (
            <div className="text-xs overflow-hidden flex-1">
              <div className="font-semibold text-white truncate">{userLabel}</div>
              <div className="text-cyan-400/80 truncate text-[10px] uppercase tracking-wider mt-0.5 font-medium">NexaGlint Member</div>
            </div>
          )}
        </Link>
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

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={async () => { 
                  setNotifOpen((o) => !o); 
                  if (!notifOpen) { 
                    await markAllRead(); 
                    refreshAlerts(); 
                  } 
                }}
                className="relative size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center transition-all hover:border-white/20"
              >
                <Bell className={cn("size-4", unread > 0 ? "text-cyan-400" : "text-gray-500")} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-cyan-500 text-[10px] font-black text-black grid place-items-center animate-bounce">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {/* Alerts Panel */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] glass-strong border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Bell className="size-4 text-cyan-400" />
                      <span className="font-semibold text-sm text-white">Watch Alerts</span>
                      {alerts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-400">{alerts.length}</span>
                      )}
                    </div>
                    <button onClick={handleMarkAll} className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center">
                        <Eye className="size-8 text-gray-700 mx-auto mb-3" />
                        <div className="text-sm text-gray-500 font-medium">No alerts yet</div>
                        <div className="text-xs text-gray-600 mt-1">Watch a table to get notified of changes</div>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={async () => { await markRead(alert.id); refreshAlerts(); }}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors",
                            !alert.read && "bg-cyan-500/5 border-l-2 border-l-cyan-500/50"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">{ALERT_ICONS[alert.type]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-200 truncate">{alert.tableName}</div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{alert.message}</div>
                            <div className="text-[10px] text-gray-600 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          {!alert.read && (
                            <span className="size-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
