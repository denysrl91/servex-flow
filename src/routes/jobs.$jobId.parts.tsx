import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchItems, fetchLocations, fetchStock, isLow, type Item } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, ScanLine, Plus, Minus, Trash2, AlertTriangle, Send, Package } from "lucide-react";

export const Route = createFileRoute("/jobs/$jobId/parts")({ component: JobPartsPage });

type Line = { item: Item; qty: number };

function JobPartsPage() {
  const { jobId } = Route.useParams();
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const job = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const tech = useQuery({
    queryKey: ["my-tech", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("technicians").select("id,full_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const van = useQuery({
    queryKey: ["my-van", tech.data?.id],
    enabled: !!tech.data?.id,
    queryFn: async () => {
      const { data } = await supabase.from("vans").select("id,name").eq("technician_id", tech.data!.id).maybeSingle();
      return data;
    },
  });

  const vanLoc = useQuery({
    queryKey: ["my-van-loc", van.data?.id],
    enabled: !!van.data?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_locations")
        .select("id,name")
        .eq("van_id", van.data!.id)
        .eq("type", "van")
        .maybeSingle();
      return data;
    },
  });

  const items = useQuery({ queryKey: ["inv-items"], queryFn: fetchItems });
  const stock = useQuery({ queryKey: ["inv-stock"], queryFn: fetchStock });
  const locs = useQuery({ queryKey: ["inv-locs"], queryFn: fetchLocations });

  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const locationId = vanLoc.data?.id ?? null;

  const onHandMap = useMemo(() => {
    const m = new Map<string, number>();
    if (!locationId) return m;
    for (const s of stock.data ?? []) {
      if (s.location_id === locationId) m.set(s.item_id, Number(s.quantity));
    }
    return m;
  }, [stock.data, locationId]);

  const vanItems = useMemo(() => {
    return (items.data ?? [])
      .map((i) => ({ item: i, qty: onHandMap.get(i.id) ?? 0 }))
      .filter((x) => x.qty > 0 || (x.item.barcode && search));
  }, [items.data, onHandMap, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vanItems.slice(0, 8);
    return vanItems.filter((x) =>
      x.item.name.toLowerCase().includes(q) ||
      x.item.sku.toLowerCase().includes(q) ||
      (x.item.barcode ?? "").toLowerCase().includes(q),
    ).slice(0, 12);
  }, [vanItems, search]);

  // Auto-add on exact barcode match (typical scanner behavior: emits string + Enter)
  useEffect(() => {
    const q = search.trim();
    if (!q) return;
    const exact = vanItems.find((x) => (x.item.barcode ?? "") === q || x.item.sku === q);
    if (exact) {
      addLine(exact.item);
      setSearch("");
      inputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function addLine(item: Item) {
    setLines((prev) => {
      const ix = prev.findIndex((l) => l.item.id === item.id);
      const onHand = onHandMap.get(item.id) ?? 0;
      if (ix >= 0) {
        const next = [...prev];
        next[ix] = { ...next[ix], qty: Math.min(next[ix].qty + 1, onHand) };
        return next;
      }
      return [...prev, { item, qty: 1 }];
    });
  }

  function setQty(itemId: string, qty: number) {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.item.id !== itemId) return l;
          const max = onHandMap.get(itemId) ?? 0;
          return { ...l, qty: Math.max(0, Math.min(qty, max)) };
        })
        .filter((l) => l.qty > 0),
    );
  }

  function removeLine(itemId: string) {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }

  const totalCost = lines.reduce((a, l) => a + l.qty * Number(l.item.unit_cost), 0);
  const totalPrice = lines.reduce((a, l) => a + l.qty * Number(l.item.unit_price), 0);

  // Items that will be low after this usage
  const lowAfter = useMemo(() => {
    return lines
      .map((l) => {
        const remaining = (onHandMap.get(l.item.id) ?? 0) - l.qty;
        return { item: l.item, remaining };
      })
      .filter((x) => isLow(x.item, x.remaining));
  }, [lines, onHandMap]);

  async function submitUsage() {
    if (!companyId || !locationId) return toast.error("No van assigned to your account");
    if (lines.length === 0) return toast.error("Add at least one part");
    setSaving(true);
    try {
      for (const l of lines) {
        const row = (stock.data ?? []).find((s) => s.location_id === locationId && s.item_id === l.item.id);
        if (!row) throw new Error(`No stock row for ${l.item.name}`);
        const newQty = Number(row.quantity) - l.qty;
        const { error: u } = await supabase.from("inventory_stock").update({ quantity: newQty }).eq("id", row.id);
        if (u) throw u;
        const { error: t } = await supabase.from("inventory_transactions").insert({
          company_id: companyId,
          item_id: l.item.id,
          from_location_id: locationId,
          type: "issue",
          quantity: l.qty,
          job_id: jobId,
          reference: `Job ${jobId.slice(0, 8)}`,
          notes: `Used on job by ${tech.data?.full_name ?? "technician"}`,
        });
        if (t) throw t;
      }
      toast.success(`Logged ${lines.length} part${lines.length > 1 ? "s" : ""} to job`);
      qc.invalidateQueries({ queryKey: ["inv-stock"] });
      setLines([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log parts");
    } finally {
      setSaving(false);
    }
  }

  async function requestRestock() {
    if (!companyId) return;
    const targets = lowAfter.length ? lowAfter : lines.map((l) => ({ item: l.item, remaining: (onHandMap.get(l.item.id) ?? 0) - l.qty }));
    if (targets.length === 0) return toast.error("Nothing to restock");
    setRequesting(true);
    try {
      // Find warehouse managers + admins/owners to notify
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("user_id,role")
        .in("role", ["warehouse_manager", "owner", "admin"]);
      const recipients = Array.from(new Set((roleRows ?? []).map((r) => r.user_id)));
      if (recipients.length === 0) {
        toast.error("No warehouse manager found in your company");
        return;
      }
      const lineSummary = targets
        .map((t) => `${t.item.sku} ${t.item.name} (${t.remaining} left)`)
        .join(", ");
      const rows = recipients.map((uid) => ({
        company_id: companyId,
        user_id: uid,
        type: "inventory" as const,
        title: `Restock request from ${tech.data?.full_name ?? "technician"}`,
        body: `Van: ${van.data?.name ?? "Van"}. Needs: ${lineSummary}`,
        link: `/inventory/low-stock`,
      }));
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) throw error;
      toast.success(`Restock request sent to ${recipients.length} manager${recipients.length > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send request");
    } finally {
      setRequesting(false);
    }
  }

  const noVan = !vanLoc.isLoading && !locationId;

  return (
    <>
      <PageHeader
        title="Parts used on job"
        description={job.data?.title ? `${job.data.job_number ?? ""} · ${job.data.title}` : "Log parts and update van stock"}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        }
      />
      <div className="mx-auto grid w-full max-w-3xl gap-4 p-4 sm:p-6">
        {noVan && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
              <div>
                <p className="font-medium">No van assigned</p>
                <p className="text-muted-foreground">Ask dispatch to link your tech profile to a van so you can pull from van stock.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><ScanLine className="h-4 w-4" /> Scan or search</span>
              {van.data && <Badge variant="outline">{van.data.name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              ref={inputRef}
              autoFocus
              inputMode="search"
              placeholder="Scan barcode/QR, or type SKU or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 text-base"
            />
            {locationId && (
              <div className="grid gap-2">
                {filtered.length === 0 && <p className="text-sm text-muted-foreground">No matching parts on your van.</p>}
                {filtered.map(({ item, qty }) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { addLine(item); setSearch(""); inputRef.current?.focus(); }}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.sku}{item.barcode ? ` · ${item.barcode}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={isLow(item, qty) ? "border-destructive/40 text-destructive" : ""}>
                        {qty} on van
                      </Badge>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" /> Parts on this job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No parts added yet.</p>
            ) : (
              <div className="space-y-2">
                {lines.map((l) => {
                  const onHand = onHandMap.get(l.item.id) ?? 0;
                  return (
                    <div key={l.item.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.item.name}</p>
                        <p className="text-xs text-muted-foreground">{l.item.sku} · ${Number(l.item.unit_price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQty(l.item.id, l.qty - 1)}><Minus className="h-3.5 w-3.5" /></Button>
                        <Input
                          type="number"
                          min={0}
                          max={onHand}
                          value={l.qty}
                          onChange={(e) => setQty(l.item.id, Number(e.target.value))}
                          className="h-8 w-14 text-center"
                        />
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQty(l.item.id, l.qty + 1)}><Plus className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeLine(l.item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  );
                })}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost / Charge</span>
                  <span className="font-medium">${totalCost.toFixed(2)} / ${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {lowAfter.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" /> Van will be low after this job
                </p>
                <ul className="mt-1 ml-6 list-disc text-xs text-muted-foreground">
                  {lowAfter.map((x) => (
                    <li key={x.item.id}>{x.item.name} — {x.remaining} left (reorder at {Math.max(x.item.reorder_point, x.item.min_stock_level)})</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={requestRestock}
                disabled={requesting || lines.length === 0}
              >
                <Send className="mr-2 h-4 w-4" /> {requesting ? "Sending…" : "Request restock"}
              </Button>
              <Button
                type="button"
                onClick={submitUsage}
                disabled={saving || lines.length === 0 || !locationId}
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                {saving ? "Saving…" : `Log ${lines.length || ""} part${lines.length === 1 ? "" : "s"} & update van`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}