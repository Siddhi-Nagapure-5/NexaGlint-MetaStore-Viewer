import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Lakehouse Metastore" }] }),
  component: () => (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Connections, engines, and preferences.</p>
      </div>
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="text-sm font-medium">Object Store Connection</div>
        <div className="grid gap-3">
          <label className="text-xs text-muted-foreground">Endpoint
            <Input defaultValue="https://s3.amazonaws.com" className="mt-1 glass border-0" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">Access Key
              <Input defaultValue="AKIA••••••••" className="mt-1 glass border-0" />
            </label>
            <label className="text-xs text-muted-foreground">Secret
              <Input type="password" defaultValue="••••••••••••" className="mt-1 glass border-0" />
            </label>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="text-sm font-medium">Trino Integration</div>
        <Input defaultValue="trino://lakehouse-trino:8080" className="glass border-0" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Enable query execution from table view</span>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" className="rounded-xl">Cancel</Button>
        <Button className="rounded-xl border-0" style={{ background: "var(--gradient-brand)" }}>Save changes</Button>
      </div>
    </div>
  ),
});
