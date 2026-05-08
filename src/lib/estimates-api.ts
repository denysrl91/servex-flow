import { supabase } from "@/integrations/supabase/client";

export type EstimateStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired"
  | "converted";

export type EstimateRow = {
  id: string;
  estimate_number: string;
  title: string;
  status: EstimateStatus;
  subtotal: number;
  tax: number;
  total: number;
  expires_at: string | null;
  approved_at: string | null;
  signed_at: string | null;
  signed_by_name: string | null;
  signature_data: string | null;
  customer_id: string;
  property_id: string | null;
  job_id: string | null;
  equipment_id: string | null;
  notes: string | null;
  created_at: string;
};

export type EstimateOption = {
  id: string;
  estimate_id: string;
  name: string;
  description: string | null;
  amount: number;
  is_selected: boolean;
  is_recommended: boolean;
  sort_order: number;
  tier: "good" | "better" | "best" | null;
  warranty_years: number | null;
  efficiency_rating: string | null;
  monthly_payment: number | null;
  highlights: string[] | null;
};

export type EstimateLineItem = {
  id: string;
  estimate_id: string;
  option_id: string | null;
  type: "labor" | "material" | "equipment";
  item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
};

export type EstimatePhoto = {
  id: string;
  estimate_id: string;
  url: string;
  caption: string | null;
};

export const STATUS_TONE: Record<EstimateStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  approved: "bg-[oklch(0.65_0.16_150)/0.18] text-[oklch(0.38_0.16_150)]",
  rejected: "bg-destructive/15 text-destructive",
  expired: "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)]",
  converted: "bg-[oklch(0.7_0.14_300)/0.18] text-[oklch(0.42_0.14_300)]",
};

export const STATUS_LABEL: Record<EstimateStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  converted: "Converted",
};

export const TIER_THEME: Record<"good" | "better" | "best", { label: string; ring: string; chip: string; bar: string; }>= {
  good: {
    label: "Good",
    ring: "border-border",
    chip: "bg-muted text-foreground",
    bar: "bg-muted",
  },
  better: {
    label: "Better",
    ring: "border-primary/40",
    chip: "bg-primary/10 text-primary",
    bar: "bg-primary/70",
  },
  best: {
    label: "Best",
    ring: "border-[oklch(0.7_0.18_85)]",
    chip: "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)]",
    bar: "bg-[oklch(0.78_0.18_85)]",
  },
};

export async function fetchEstimates() {
  const { data, error } = await supabase
    .from("estimates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EstimateRow[];
}

export async function fetchEstimate(id: string) {
  const [{ data: est, error: e1 }, { data: opts, error: e2 }, { data: lines, error: e3 }, { data: photos, error: e4 }] = await Promise.all([
    supabase.from("estimates").select("*").eq("id", id).maybeSingle(),
    supabase.from("estimate_options").select("*").eq("estimate_id", id).order("sort_order"),
    supabase.from("estimate_line_items").select("*").eq("estimate_id", id).order("sort_order"),
    supabase.from("estimate_photos").select("*").eq("estimate_id", id).order("created_at"),
  ]);
  if (e1 || e2 || e3 || e4) throw e1 ?? e2 ?? e3 ?? e4;
  return {
    estimate: est as EstimateRow | null,
    options: (opts ?? []) as EstimateOption[],
    lineItems: (lines ?? []) as EstimateLineItem[],
    photos: (photos ?? []) as EstimatePhoto[],
  };
}

export function nextEstimateNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const r = Math.floor(1000 + Math.random() * 9000);
  return `EST-${y}${(d.getMonth() + 1).toString().padStart(2, "0")}-${r}`;
}

export function calcOptionTotal(items: EstimateLineItem[], optionId: string) {
  return items
    .filter((l) => l.option_id === optionId)
    .reduce((s, l) => s + Number(l.total || l.quantity * l.unit_price), 0);
}

export function estimateMonthly(amount: number, months = 84, apr = 0.0999) {
  if (!amount) return 0;
  const r = apr / 12;
  const m = (amount * r) / (1 - Math.pow(1 + r, -months));
  return Math.round(m);
}