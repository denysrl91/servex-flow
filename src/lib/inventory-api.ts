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

export async function fetchItems(companyId: string) {
  if (!companyId) return [] as Item[];
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function fetchLocations(companyId: string) {
  if (!companyId) return [] as Location[];
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Location[];
}

export async function fetchStock(companyId: string) {
  if (!companyId) return [] as StockRow[];
  const { data, error } = await supabase
    .from("inventory_stock")
    .select("*")
    .eq("company_id", companyId);
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

/**
 * Returns the id of the company's default warehouse location, creating one
 * if none exists. Used so each item always has somewhere to hold its quantity.
 */
export async function ensureDefaultLocation(companyId: string): Promise<string> {
  const { data: existing, error: readErr } = await supabase
    .from("inventory_locations")
    .select("id")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (readErr) throw readErr;
  if (existing?.id) return existing.id;

  const { data: created, error: insErr } = await supabase
    .from("inventory_locations")
    .insert({ company_id: companyId, name: "Main Warehouse", type: "warehouse" })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return created.id;
}

/** Sets the on-hand quantity for an item at the company's default location. */
export async function setItemQuantity(companyId: string, itemId: string, quantity: number) {
  const locationId = await ensureDefaultLocation(companyId);
  const { data: existing } = await supabase
    .from("inventory_stock")
    .select("id")
    .eq("item_id", itemId)
    .eq("location_id", locationId)
    .maybeSingle();
  if (existing?.id) {
    const { error } = await supabase
      .from("inventory_stock")
      .update({ quantity })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("inventory_stock")
      .insert({ company_id: companyId, item_id: itemId, location_id: locationId, quantity });
    if (error) throw error;
  }
}