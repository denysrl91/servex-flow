import { useMemo, useState } from "react";
import { usePriceBook, type PriceBookKind } from "@/lib/price-book-store";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Tag, DollarSign, Percent, Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type PriceItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  unit: string;
  active: boolean;
};

type Props = {
  title: string;
  description: string;
  kind: PriceBookKind;
  categories: string[];
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PriceBook({ title, description, kind, categories }: Props) {
  const [items, setItems] = usePriceBook(kind);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PriceItem>({
    id: "",
    code: "",
    name: "",
    category: categories[0] ?? "General",
    description: "",
    price: 0,
    cost: 0,
    unit: kind === "services" ? "visit" : "each",
    active: true,
  });

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const okCat = cat === "all" || i.category === cat;
      const okQ =
        !q ||
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        i.code.toLowerCase().includes(q.toLowerCase()) ||
        (i.description ?? "").toLowerCase().includes(q.toLowerCase());
      return okCat && okQ;
    });
  }, [items, q, cat]);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.active);
    const avgPrice = active.length
      ? active.reduce((s, i) => s + i.price, 0) / active.length
      : 0;
    const avgMargin = active.length
      ? active.reduce((s, i) => {
          const m = i.price > 0 ? ((i.price - i.cost) / i.price) * 100 : 0;
          return s + m;
        }, 0) / active.length
      : 0;
    return {
      total: items.length,
      active: active.length,
      categories: new Set(items.map((i) => i.category)).size,
      avgPrice,
      avgMargin,
    };
  }, [items]);

  const reset = () =>
    setForm({
      id: "",
      code: "",
      name: "",
      category: categories[0] ?? "General",
      description: "",
      price: 0,
      cost: 0,
      unit: kind === "services" ? "visit" : "each",
      active: true,
    });

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) {
      return toast.error("Code and Name are required");
    }
    const id =
      form.id ||
      `${kind === "services" ? "SVC" : "SAL"}-${Date.now().toString().slice(-6)}`;
    const next = [{ ...form, id }, ...items.filter((i) => i.id !== form.id)];
    setItems(next);
    setOpen(false);
    reset();
    toast.success(form.id ? "Item updated" : "Item added to price book");
  };

  const edit = (i: PriceItem) => {
    setForm(i);
    setOpen(true);
  };

  const remove = (i: PriceItem) => {
    if (!window.confirm(`Delete "${i.name}"? This cannot be undone.`)) return;
    setItems(items.filter((x) => x.id !== i.id));
    toast.success("Item deleted");
  };

  const clearAll = () => {
    if (!items.length) return;
    if (!window.confirm(`Delete ALL ${items.length} items from this price book? This cannot be undone.`)) return;
    setItems([]);
    toast.success("Price book cleared");
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundImage: "var(--gradient-primary)" }}>
                <Plus className="mr-2 h-4 w-4" /> New price item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit price item" : "Add to price book"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Code / SKU *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder={kind === "services" ? "SVC-DIAG-01" : "SAL-AC-3T"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={
                      kind === "services"
                        ? "Diagnostic Visit"
                        : "3-Ton Gold AC + Install"
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Cost ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What's included in this offering"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={save}
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  {form.id ? "Save changes" : "Add to price book"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={Layers} label="Items" value={stats.total.toString()} sub={`${stats.active} active`} />
          <Stat icon={Tag} label="Categories" value={stats.categories.toString()} sub="Live grouping" />
          <Stat icon={DollarSign} label="Avg price" value={fmt(stats.avgPrice)} sub="Across active" />
          <Stat icon={Percent} label="Avg margin" value={`${stats.avgMargin.toFixed(0)}%`} sub="Price − cost" />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by code, name, description"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => {
                  const margin = i.price > 0 ? ((i.price - i.cost) / i.price) * 100 : 0;
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{i.code}</TableCell>
                      <TableCell>
                        <div className="font-medium">{i.name}</div>
                        {i.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{i.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {i.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(i.cost)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{fmt(i.price)}</TableCell>
                      <TableCell
                        className={
                          "text-right tabular-nums " +
                          (margin >= 40 ? "text-emerald-500" : margin >= 20 ? "text-amber-500" : "text-rose-500")
                        }
                      >
                        {margin.toFixed(0)}%
                      </TableCell>
                      <TableCell>
                        {i.active ? (
                          <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => edit(i)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => remove(i)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      No items match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}