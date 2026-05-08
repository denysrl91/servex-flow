import { supabase } from "@/integrations/supabase/client";

export type Item = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  unit_cost: number;
  unit_price: number;
  reorder_point: number;
  min_stock_level: number;
  barcode: string | null;
  vendor_name: string | null;
  vendor_email: string | null;
  vendor_phone: string | null;
  track_serial: boolean;
  status: string;
};

export type Location = {
  id: string;
  name: string;
  type: "warehouse" | "van" | "other";
  warehouse_id: string | null;
  van_id: string | null;
  status: string;
};

export type StockRow = {
  id: string;
  item_id: string;
  location_id: string;
  quantity: number;
};

export async function fetchItems() {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function fetchLocations() {
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("*")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Location[];
}

export async function fetchStock() {
  const { data, error } = await supabase.from("inventory_stock").select("*");
  if (error) throw error;
  return (data ?? []) as StockRow[];
}

export function totalOnHand(itemId: string, stock: StockRow[]) {
  return stock
    .filter((s) => s.item_id === itemId)
    .reduce((sum, s) => sum + Number(s.quantity), 0);
}

export function stockByLocation(locationId: string, stock: StockRow[]) {
  return stock.filter((s) => s.location_id === locationId);
}

export function margin(item: Pick<Item, "unit_cost" | "unit_price">) {
  if (!item.unit_price) return 0;
  return ((item.unit_price - item.unit_cost) / item.unit_price) * 100;
}

export function inventoryValue(items: Item[], stock: StockRow[]) {
  let cost = 0;
  let retail = 0;
  for (const item of items) {
    const qty = totalOnHand(item.id, stock);
    cost += qty * Number(item.unit_cost);
    retail += qty * Number(item.unit_price);
  }
  return { cost, retail };
}

export function isLow(item: Item, qty: number) {
  const threshold = Math.max(item.reorder_point ?? 0, item.min_stock_level ?? 0);
  return qty <= threshold;
}