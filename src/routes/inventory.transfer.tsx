import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchItems, fetchLocations, fetchStock, stockByLocation } from "@/lib/inventory-api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/inventory/transfer")({ component: TransferPage });

function TransferPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { companyId } = useAuth();
  const items = useQuery({ queryKey: ["inv-items"], queryFn: fetchItems });
  const locs = useQuery({ queryKey: ["inv-locs"], queryFn: fetchLocations });
  const stock = useQuery({ queryKey: ["inv-stock"], queryFn: fetchStock });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const available = useMemo(() => {
    if (!from) return 0;
    const s = stockByLocation(from, stock.data ?? []).find((r) => r.item_id === itemId);
    return Number(s?.quantity ?? 0);
  }, [from, itemId, stock.data]);

  async function adjustStock(locationId: string, item: string, delta: number) {
    const existing = (stock.data ?? []).find((s) => s.location_id === locationId && s.item_id === item);
    if (existing) {
      const newQty = Number(existing.quantity) + delta;
      const { error } = await supabase.from("inventory_stock").update({ quantity: newQty }).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("inventory_stock").insert({
        company_id: companyId,
        location_id: locationId,
        item_id: item,
        quantity: delta,
      });
      if (error) throw error;
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return toast.error("Missing company");
    const q = Number(qty);
    if (!from || !to || !itemId || q <= 0) return toast.error("Fill all fields");
    if (from === to) return toast.error("From and To must differ");
    if (q > available) return toast.error(`Only ${available} available at source`);
    setSaving(true);
    try {
      await adjustStock(from, itemId, -q);
      await adjustStock(to, itemId, q);
      const { error } = await supabase.from("inventory_transactions").insert({
        company_id: companyId,
        item_id: itemId,
        from_location_id: from,
        to_location_id: to,
        type: "transfer",
        quantity: q,
        notes: notes || null,
      });
      if (error) throw error;
      toast.success("Transfer recorded");
      qc.invalidateQueries({ queryKey: ["inv-stock"] });
      qc.invalidateQueries({ queryKey: ["inv-tx"] });
      navigate({ to: "/inventory/warehouse" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Transfer Inventory" description="Move stock between warehouse and vans." />
      <form onSubmit={onSubmit} className="p-6">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle className="text-base">Move stock</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-1.5">
                <Label>From</Label>
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger><SelectValue placeholder="Source location" /></SelectTrigger>
                  <SelectContent>
                    {(locs.data ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name} ({l.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ArrowRight className="mb-2 h-5 w-5 text-muted-foreground" />
              <div className="space-y-1.5">
                <Label>To</Label>
                <Select value={to} onValueChange={setTo}>
                  <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    {(locs.data ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name} ({l.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Item</Label>
                <Select value={itemId} onValueChange={setItemId}>
                  <SelectTrigger><SelectValue placeholder="Pick item" /></SelectTrigger>
                  <SelectContent>
                    {(items.data ?? []).map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.sku} — {i.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Quantity {from && itemId && <span className="text-xs text-muted-foreground">({available} available)</span>}</Label>
                <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional — reason or job reference" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/inventory" })}>Cancel</Button>
              <Button type="submit" disabled={saving} style={{ backgroundImage: "var(--gradient-primary)" }}>
                {saving ? "Transferring..." : "Transfer stock"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}