import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

type Record = {
  id: string;
  module_key: string;
  title: string;
  subtitle: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150, "Title too long"),
  subtitle: z.string().trim().max(200, "Too long").optional(),
  status: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(2000, "Notes too long").optional(),
});

const STATUS_OPTIONS = ["active", "draft", "in_progress", "complete", "archived"] as const;

function statusTone(s: string) {
  switch (s) {
    case "active": return "bg-primary/15 text-primary";
    case "draft": return "bg-muted text-muted-foreground";
    case "in_progress": return "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)]";
    case "complete": return "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]";
    case "archived": return "bg-muted text-muted-foreground line-through";
    default: return "bg-muted text-muted-foreground";
  }
}

export function ModuleRecords({
  moduleKey,
  singular,
  plural,
  titleLabel = "Title",
  subtitleLabel = "Subtitle",
  notesLabel = "Notes",
  defaultStatus = "active",
}: {
  moduleKey: string;
  singular: string;
  plural: string;
  titleLabel?: string;
  subtitleLabel?: string;
  notesLabel?: string;
  defaultStatus?: string;
}) {
  const { companyId, user } = useAuth();
  const [rows, setRows] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", status: defaultStatus, notes: "" });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("module_records")
      .select("id,module_key,title,subtitle,status,notes,created_at")
      .eq("module_key", moduleKey)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Record[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [moduleKey]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.title, r.subtitle, r.notes, r.status].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [rows, q]);

  const create = async () => {
    if (!companyId) return toast.error("No company on profile");
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const { error } = await supabase.from("module_records").insert({
      company_id: companyId,
      module_key: moduleKey,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${singular} added`);
    setOpen(false);
    setForm({ title: "", subtitle: "", status: defaultStatus, notes: "" });
    load();
  };

  return (
    <Card className="premium-card">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{plural}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Capture, organise, and track {plural.toLowerCase()} for this module.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
              <Plus className="mr-1.5 h-4 w-4" /> Add {singular.toLowerCase()}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New {singular.toLowerCase()}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{titleLabel} <span className="text-destructive">*</span></Label>
                <Input maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{subtitleLabel}</Label>
                <Input maxLength={200} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{notesLabel}</Label>
                <Textarea rows={3} maxLength={2000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder={`Search ${plural.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 text-sm font-semibold">No {plural.toLowerCase()} yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">Click "Add {singular.toLowerCase()}" to create your first record.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">{titleLabel}</th>
                  <th className="px-4 py-2 text-left">{subtitleLabel}</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2 font-medium">{r.title}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.subtitle ?? "—"}</td>
                    <td className="px-4 py-2"><Badge className={statusTone(r.status) + " capitalize"} variant="outline">{r.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-2 text-right text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}