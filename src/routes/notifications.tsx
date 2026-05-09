import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Bell, Check, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

const TYPES = ["system", "job", "invoice", "payment", "ticket", "inventory"];

function NotificationsPage() {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "system", title: "", body: "", link: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    setRows(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => [r.title, r.body, r.type, r.status].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ status: "read", read_at: new Date().toISOString() }).eq("id", id);
    load();
  };

  const create = async () => {
    if (!companyId || !user?.id) return toast.error("Missing context");
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    const { error } = await supabase.from("notifications").insert({
      company_id: companyId,
      user_id: user.id,
      type: form.type as any,
      title: form.title.trim(),
      body: form.body || null,
      link: form.link || null,
      status: "unread",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Notification created");
    setOpen(false);
    setForm({ type: "system", title: "", body: "", link: "" });
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Customer Experience"
        title="Notifications"
        description="In-app alerts for jobs, invoices, payments, tickets and system events."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-1.5 h-4 w-4" /> New notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>New notification</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Type">
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Title" required className="sm:col-span-2">
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </Field>
                <Field label="Body" className="sm:col-span-2">
                  <Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </Field>
                <Field label="Link" className="sm:col-span-2">
                  <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/jobs/abc" />
                </Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>{saving ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search notifications…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">You're all caught up</h3>
            <p className="mt-1 text-sm text-muted-foreground">No notifications to show.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <div key={r.id} className={"flex items-start gap-3 rounded-lg border border-border bg-card p-4 " + (r.status === "unread" ? "ring-1 ring-primary/30" : "")}>
                <Bell className="mt-0.5 h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.title}</p>
                    <Badge variant="outline" className="capitalize text-[10px]">{r.type}</Badge>
                    {r.status === "unread" && <Badge className="bg-primary/15 text-primary text-[10px]">new</Badge>}
                  </div>
                  {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                {r.status === "unread" && (
                  <Button size="sm" variant="ghost" onClick={() => markRead(r.id)}><Check className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={"space-y-1.5 " + (className ?? "")}><Label>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>{children}</div>;
}
