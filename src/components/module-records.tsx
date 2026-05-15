import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Inbox, Pencil, Trash2 } from "lucide-react";
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
import { getModuleSchema, type ModuleField } from "@/lib/module-fields";

type DbRecord = {
  id: string;
  module_key: string;
  title: string;
  subtitle: string | null;
  status: string;
  notes: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
};

function statusTone(s: string) {
  const k = (s || "").toLowerCase();
  if (["active","connected","operational","published","paid","approved","complete","completed","sent","resolved","actioned","renewed"].includes(k))
    return "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]";
  if (["pending","scheduled","new","invited","draft","logged","planning","submitted","open","acknowledged","contacted","preferred","follow_up","processing"].includes(k))
    return "bg-primary/15 text-primary";
  if (["overdue","failed","error","disputed","escalated","breached","down","critical","needs_service","flagged","rejected","expired","revoked"].includes(k))
    return "bg-destructive/15 text-destructive";
  if (["paused","on_hold","in_shop","reserved"].includes(k))
    return "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)]";
  if (["archived","retired","cancelled","removed","disabled","inactive","dismissed"].includes(k))
    return "bg-muted text-muted-foreground line-through";
  return "bg-muted text-muted-foreground";
}

function formatValue(v: unknown, type?: string) {
  if (v === null || v === undefined || v === "") return "—";
  if (type === "currency" && typeof v === "number") return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
  if (type === "currency" && typeof v === "string" && !isNaN(Number(v))) return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(v));
  if (type === "date" && typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toLocaleDateString();
  }
  return String(v);
}

function FieldInput({ field, value, onChange }: { field: ModuleField; value: unknown; onChange: (v: unknown) => void }) {
  const v = value ?? "";
  if (field.type === "textarea") {
    return <Textarea rows={3} maxLength={2000} placeholder={field.placeholder} value={String(v)} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "select") {
    return (
      <Select value={String(v || "")} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent>
          {field.options?.map((opt) => (
            <SelectItem key={opt} value={opt} className="capitalize">{opt.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  const inputType =
    field.type === "number" || field.type === "currency" ? "number" :
    field.type === "date" ? "date" :
    field.type === "email" ? "email" :
    field.type === "tel" ? "tel" : "text";
  return (
    <Input
      type={inputType}
      step={field.type === "currency" ? "0.01" : undefined}
      maxLength={inputType === "text" ? 200 : undefined}
      placeholder={field.placeholder}
      value={String(v)}
      onChange={(e) => onChange(field.type === "number" || field.type === "currency" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
    />
  );
}

export function ModuleRecords({
  moduleKey,
  singular,
  plural,
}: {
  moduleKey: string;
  singular: string;
  plural: string;
  // legacy props kept for backward compatibility — ignored
  titleLabel?: string;
  subtitleLabel?: string;
  notesLabel?: string;
  defaultStatus?: string;
}) {
  const { companyId, user } = useAuth();
  const schema = useMemo(() => getModuleSchema(moduleKey), [moduleKey]);
  const primaryField = useMemo(() => schema.fields.find((f) => f.primary) ?? schema.fields[0], [schema]);
  const secondaryField = useMemo(() => schema.fields.find((f) => f.secondary), [schema]);
  const statusField = useMemo(() => schema.fields.find((f) => f.key === "status"), [schema]);
  const tableFields = useMemo(() => schema.fields.filter((f) => f.showInTable && f.key !== "status"), [schema]);

  const initialForm = useMemo(() => {
    const o: Record<string, unknown> = {};
    schema.fields.forEach((f) => { o[f.key] = f.key === "status" ? (schema.defaultStatus ?? f.options?.[0] ?? "active") : ""; });
    return o;
  }, [schema]);

  const [rows, setRows] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { setForm(initialForm); }, [initialForm]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("module_records")
      .select("id,module_key,title,subtitle,status,notes,data,created_at")
      .eq("module_key", moduleKey)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as DbRecord[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [moduleKey]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const hay = [r.title, r.subtitle, r.status, r.notes, ...Object.values(r.data ?? {}).map((v) => String(v ?? ""))]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (r: DbRecord) => {
    const next: Record<string, unknown> = { ...initialForm };
    schema.fields.forEach((f) => {
      if (f.primary) next[f.key] = r.title ?? "";
      else if (f.secondary) next[f.key] = r.subtitle ?? (r.data?.[f.key] ?? "");
      else if (f.key === "status") next[f.key] = r.status ?? schema.defaultStatus ?? "active";
      else if (f.key === "notes") next[f.key] = r.notes ?? "";
      else next[f.key] = r.data?.[f.key] ?? "";
    });
    setForm(next);
    setEditingId(r.id);
    setOpen(true);
  };

  const remove = async (r: DbRecord) => {
    if (!confirm(`Delete this ${singular.toLowerCase()}?`)) return;
    const { error } = await supabase.from("module_records").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${singular} deleted`);
    load();
  };

  const save = async () => {
    if (!companyId) return toast.error("No company on profile");
    // validate required fields
    for (const f of schema.fields) {
      const v = form[f.key];
      if (f.required && (v === "" || v === null || v === undefined)) {
        return toast.error(`${f.label} is required`);
      }
    }
    const titleVal = String(form[primaryField.key] ?? "").trim() || singular;
    const subtitleVal = secondaryField ? String(form[secondaryField.key] ?? "").trim() : "";
    const statusVal = statusField ? String(form.status ?? schema.defaultStatus ?? "active") : (schema.defaultStatus ?? "active");
    const notesVal = typeof form.notes === "string" ? form.notes : "";

    // build clean data object (everything except notes — it has its own column)
    const dataObj: Record<string, unknown> = {};
    for (const f of schema.fields) {
      if (f.key === "notes") continue;
      const v = form[f.key];
      if (v !== "" && v !== null && v !== undefined) dataObj[f.key] = v;
    }

    setSaving(true);
    const payload = {
      title: titleVal.slice(0, 150),
      subtitle: subtitleVal ? subtitleVal.slice(0, 200) : null,
      status: statusVal,
      notes: notesVal ? notesVal.slice(0, 2000) : null,
      data: dataObj as never,
    };
    const { error } = editingId
      ? await supabase.from("module_records").update(payload).eq("id", editingId)
      : await supabase.from("module_records").insert({
          ...payload,
          company_id: companyId,
          module_key: moduleKey,
          created_by: user?.id ?? null,
        });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? `${singular} updated` : `${singular} added`);
    setOpen(false);
    setEditingId(null);
    setForm(initialForm);
    load();
  };

  const getCell = (r: DbRecord, f: ModuleField) => {
    if (f.primary) return r.title;
    if (f.secondary) return r.subtitle ?? formatValue(r.data?.[f.key], f.type);
    return formatValue(r.data?.[f.key], f.type);
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
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }} onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> Add {singular.toLowerCase()}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {schema.fields.map((f) => (
                <div key={f.key} className={`space-y-1.5 ${f.span === 2 || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                  <Label>
                    {f.label}{f.required ? <span className="text-destructive"> *</span> : null}
                  </Label>
                  <FieldInput field={f} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
                {saving ? "Saving…" : editingId ? "Update" : "Save"}
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
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {tableFields.map((f) => (
                    <th key={f.key} className="px-4 py-2 text-left whitespace-nowrap">{f.label}</th>
                  ))}
                  {statusField ? <th className="px-4 py-2 text-left">Status</th> : null}
                  <th className="px-4 py-2 text-right whitespace-nowrap">Created</th>
                  <th className="px-4 py-2 text-right whitespace-nowrap w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                    {tableFields.map((f, i) => (
                      <td key={f.key} className={`px-4 py-2 ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>
                        {getCell(r, f)}
                      </td>
                    ))}
                    {statusField ? (
                      <td className="px-4 py-2">
                        <Badge className={statusTone(r.status) + " capitalize"} variant="outline">
                          {(r.status ?? "").replace(/_/g, " ")}
                        </Badge>
                      </td>
                    ) : null}
                    <td className="px-4 py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(r)} aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r)} aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
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
