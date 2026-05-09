import type { TableFormat } from "@/lib/mock-data";

const styles: Record<TableFormat, string> = {
  Iceberg: "from-cyan-400/30 to-blue-500/30 text-cyan-200 border-cyan-300/30",
  Delta: "from-violet-400/30 to-fuchsia-500/30 text-violet-200 border-violet-300/30",
  Hudi: "from-amber-400/30 to-orange-500/30 text-amber-200 border-amber-300/30",
  Parquet: "from-emerald-400/30 to-teal-500/30 text-emerald-200 border-emerald-300/30",
  CSV: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

export function FormatBadge({ format }: { format: TableFormat }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-gradient-to-r px-2.5 py-0.5 text-[11px] font-medium ${styles[format]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {format}
    </span>
  );
}
