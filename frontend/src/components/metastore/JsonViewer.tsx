import { useState } from "react";
import { ChevronRight } from "lucide-react";

function Node({ name, value, depth = 0 }: { name?: string; value: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = value && typeof value === "object";
  if (!isObj) {
    return (
      <div className="font-mono text-xs leading-relaxed" style={{ paddingLeft: depth * 14 }}>
        {name && <span className="text-violet-300">"{name}"</span>}
        {name && <span className="text-muted-foreground">: </span>}
        <span className={typeof value === "string" ? "text-emerald-300" : "text-cyan-300"}>
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  return (
    <div className="font-mono text-xs">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground" style={{ paddingLeft: depth * 14 }}>
        <ChevronRight className={`size-3 transition-transform ${open ? "rotate-90" : ""}`} />
        {name && <span className="text-violet-300">"{name}"</span>}
        {name && <span>: </span>}
        <span>{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
      {open && entries.map(([k, v]) => <Node key={k} name={k} value={v} depth={depth + 1} />)}
    </div>
  );
}

export function JsonViewer({ data }: { data: unknown }) {
  return (
    <div className="glass rounded-xl p-4 overflow-auto max-h-[60vh]">
      <Node value={data} />
    </div>
  );
}
