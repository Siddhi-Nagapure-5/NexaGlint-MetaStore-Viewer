import { createFileRoute } from "@tanstack/react-router";
import { Database, Terminal, Play, Save, History, Copy, Trash2, Loader2, AlertCircle, CheckCircle2, ChevronRight, FileJson, Table as TableIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { tablesApi, type TableSummary } from "@/lib/api";

export const Route = createFileRoute("/query")({
  head: () => ({ meta: [{ title: "SQL Workspace · NexaGlint" }] }),
  component: QueryPage,
});

function QueryPage() {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [sql, setSql] = useState("-- Select a table from the sidebar to generate a query\n-- Or manually query a bucket:\nSELECT * FROM read_csv_auto('s3://gauri-athena-query-output/**/*.csv') LIMIT 10;");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem("nexaglint_user") || "null");

  useEffect(() => {
    tablesApi.list().then(setTables);
  }, []);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    const start = Date.now();
    try {
      const res = await tablesApi.query({
        sql,
        aws_access_key_id: user?.aws_access_key,
        aws_secret_access_key: user?.aws_secret_key,
        aws_region: user?.aws_region || "us-east-1"
      });
      setResults(res);
      setExecTime(Date.now() - start);
    } catch (err: any) {
      setError(err.message || "Query execution failed.");
    } finally {
      setLoading(false);
    }
  };

  const suggestQuery = (table: TableSummary) => {
    let query = "";
    if (table.format === "Iceberg") {
      // Iceberg scan needs the metadata file, but we can try the folder first if the extension supports it
      query = `SELECT * FROM iceberg_scan('${table.location}') LIMIT 10;`;
    } else if (table.format === "Delta") {
      // DuckDB delta extension is not available on all platforms, fallback to reading the parquet files natively
      query = `SELECT * FROM read_parquet('${table.location}/**/*.parquet') LIMIT 10;`;
    } else if (table.format === "CSV") {
      query = `SELECT * FROM read_csv_auto('${table.location}/**/*.csv') LIMIT 10;`;
    } else {
      query = `SELECT * FROM read_parquet('${table.location}/**/*.parquet') LIMIT 10;`;
    }

    setSql(query);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar - Tables */}
      <div className="w-80 glass-strong border border-white/10 rounded-3xl bg-[#0a0f16]/60 backdrop-blur-3xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="size-5 text-cyan-400" />
            Live Schema
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">Discovered Tables</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tables.length > 0 ? (
            tables.map(t => (
              <button 
                key={t.id} 
                onClick={() => suggestQuery(t)}
                className="w-full text-left p-3 rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{t.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{t.format}</span>
                </div>
                <div className="text-[10px] text-gray-500 truncate opacity-60 font-mono italic">{t.location}</div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 text-gray-600 text-sm italic">No tables discovered yet. Scan a bucket to begin.</div>
          )}
        </div>
      </div>

      {/* Editor & Results */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 glass-strong border border-white/10 rounded-[2.5rem] bg-[#0a0f16]/60 backdrop-blur-3xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-500/10 grid place-items-center border border-cyan-500/20">
                <Terminal className="size-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">SQL Workspace</h2>
                <span className="text-[10px] font-black uppercase text-cyan-500/50 tracking-widest">DuckDB / S3 Real-Time</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExecute}
                disabled={loading || !sql.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#05050a] rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                Execute Query
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent p-6 text-cyan-100 font-mono text-sm resize-none focus:outline-none placeholder:text-gray-700 leading-relaxed"
              placeholder="-- Write your SQL here..."
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="h-[40%] glass-strong border border-white/10 rounded-[2.5rem] bg-[#0a0f16]/80 backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TableIcon className="size-5 text-purple-400" />
              <h3 className="font-bold text-white">Execution Results</h3>
              {execTime && (
                <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">Completed in {execTime}ms</span>
              )}
            </div>
            {results && (
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                {results.rows.length} rows returned
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-cyan-400/50">
                <Loader2 className="size-10 animate-spin" />
                <span className="text-sm font-bold tracking-widest uppercase animate-pulse">Running query against live S3 storage...</span>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-10 text-red-400 text-center gap-4 bg-red-400/5">
                <AlertCircle className="size-10 opacity-50" />
                <div className="max-w-md">
                  <h4 className="font-bold text-lg mb-2 uppercase tracking-tight">Query Failed</h4>
                  <p className="text-sm opacity-80 leading-relaxed font-mono">{error}</p>
                </div>
              </div>
            ) : results ? (
              <div className="inline-block min-w-full align-middle p-4">
                <table className="min-w-full divide-y divide-white/5">
                  <thead>
                    <tr>
                      {results.columns.map((col: string) => (
                        <th key={col} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.rows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        {results.columns.map((col: string) => (
                          <td key={col} className="px-4 py-3 text-sm text-gray-300 font-mono whitespace-nowrap">{String(row[col])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                <Terminal className="size-10 opacity-10" />
                <p className="text-sm font-medium italic">Execute a query to view real-time data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
