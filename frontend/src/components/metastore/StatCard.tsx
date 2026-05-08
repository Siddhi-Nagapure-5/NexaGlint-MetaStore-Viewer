import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub?: string; icon: LucideIcon; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-5 hover-glow relative overflow-hidden">
      <div className="absolute -top-10 -right-10 size-32 rounded-full opacity-30 blur-3xl"
           style={{ background: accent ?? "var(--gradient-brand)" }} />
      <div className="flex items-center justify-between relative">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="size-9 rounded-xl grid place-items-center glass">
          <Icon className="size-4" />
        </div>
      </div>
      <div className={cn("mt-3 text-3xl font-semibold tracking-tight neon-text")}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
