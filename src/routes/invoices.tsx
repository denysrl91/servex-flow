import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { invoices as seed } from "@/lib/mock-data";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAllPriceBook } from "@/lib/price-book-store";

const tone: Record<string, string> = {
  Paid: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)]",
  Sent: "bg-primary/10 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/invoices")({ component: InvoicesPage });

type LineItem = { id: string; code: string; name: string; kind: "sales" | "services"; quantity: number; unit_price: number };

function InvoicesPage() {
  const [rows, setRows] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", due: "", status: "Draft" });
  const [items, setItems] = useState<LineItem[]>([]);
  const [pickValue, setPickValue] = useState("");
  const priceBook = useAllPriceBook();

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.unit_price, 0), [items]);
  const tax = useMemo(() => Math.round(subtotal * 0.08 * 100) / 100, [subtotal]);
  const total = subtotal + tax;

  const addFromPriceBook = (key: string) => {
    if (!key) return;
    const [kind, code] = key.split("::");
    const entry = priceBook.find((p) => p.kind === kind && p.item.code === code);
    if (!entry) return;
    setItems((arr) => [
      ...arr,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: entry.item.code,
        name: entry.item.name,
        kind: entry.kind,
        quantity: 1,
        unit_price: entry.item.price,
      },
    ]);
    setPickValue("");
  };

  const reset = () => {
    setForm({ customer: "", due: "", status: "Draft" });
    setItems([]);
    setPickValue("");
  };

  const create = () => {
    if (!form.customer.trim()) return toast.error("Customer is required");
    if (items.length === 0) return toast.error("Add at least one line item from the price book");
    const id = `INV-${9100 + rows.length}`;
    setRows([
      {
        id,
        customer: form.customer,
        amount: total,
        due: form.due || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: form.status,
        issued: new Date().toISOString().slice(0, 10),
      },
      ...rows,
    ]);
    reset();
    setOpen(false);
    toast.success("Invoice created");
  };

  const sales = priceBook.filter((p) => p.kind === "sales" && p.item.active);
  const services = priceBook.filter((p) => p.kind === "services" && p.item.active);

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Send, track payments, and chase overdue balances."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-2 h-4 w-4" /> New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Customer</Label>
                    <Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due date</Label>
                    <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Add line item from price book</Label>
                  <Select value={pickValue} onValueChange={addFromPriceBook}>
                    <SelectTrigger><SelectValue placeholder="Search products & services…" /></SelectTrigger>
                    <SelectContent className="max-h-[320px]">
                      {sales.length > 0 && <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sales</div>}
                      {sales.map((e) => (
                        <SelectItem key={`sales::${e.item.code}`} value={`sales::${e.item.code}`}>
                          {e.item.code} — {e.item.name} (${e.item.price})
                        </SelectItem>
                      ))}
                      {services.length > 0 && <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Services</div>}
                      {services.map((e) => (
                        <SelectItem key={`services::${e.item.code}`} value={`services::${e.item.code}`}>
                          {e.item.code} — {e.item.name} (${e.item.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {items.length > 0 && (
                  <div className="overflow-hidden rounded-md border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left">Item</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Price</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((i) => (
                          <tr key={i.id} className="border-t border-border">
                            <td className="px-3 py-2">
                              <div className="font-medium">{i.name}</div>
                              <div className="text-[11px] text-muted-foreground">{i.code} · <span className="capitalize">{i.kind}</span></div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input type="number" min="1" step="1" className="ml-auto h-8 w-20 text-right" value={i.quantity}
                                onChange={(e) => setItems((arr) => arr.map((x) => x.id === i.id ? { ...x, quantity: Number(e.target.value) || 1 } : x))} />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input type="number" min="0" step="0.01" className="ml-auto h-8 w-24 text-right" value={i.unit_price}
                                onChange={(e) => setItems((arr) => arr.map((x) => x.id === i.id ? { ...x, unit_price: Number(e.target.value) } : x))} />
                            </td>
                            <td className="px-3 py-2 text-right font-medium tabular-nums">${(i.quantity * i.unit_price).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">
                              <Button size="sm" variant="ghost" onClick={() => setItems((arr) => arr.filter((x) => x.id !== i.id))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Draft","Sent","Paid","Overdue"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span className="tabular-nums">${tax.toLocaleString()}</span></div>
                    <div className="mt-1 flex justify-between font-semibold"><span>Total</span><span className="tabular-nums">${total.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} style={{ backgroundImage: "var(--gradient-primary)" }}>Create invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6">
        <DataTable
          rows={rows}
          columns={[
            { key: "id", header: "Invoice" },
            { key: "customer", header: "Customer", render: (r) => <span className="font-medium">{r.customer}</span> },
            { key: "issued", header: "Issued" },
            { key: "due", header: "Due" },
            { key: "amount", header: "Amount", render: (r) => <span className="font-medium">${r.amount.toLocaleString()}</span>, className: "text-right" },
            { key: "status", header: "Status", render: (r) => <Badge className={`${tone[r.status]} border-transparent`}>{r.status}</Badge> },
          ]}
        />
      </div>
    </>
  );
}
