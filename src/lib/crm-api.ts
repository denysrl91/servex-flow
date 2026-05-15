import { supabase } from "@/integrations/supabase/client";

export async function nextDocNumber(companyId: string, prefix: string, table: string, column: string) {
  const { data, error } = await supabase.rpc("next_doc_number", {
    _company_id: companyId,
    _prefix: prefix,
    _table: table,
    _column: column,
  });
  if (error) throw error;
  return data as string;
}

export async function createJobForCustomer(args: {
  companyId: string;
  userId: string | null;
  customerId: string;
  title: string;
  description?: string;
  scheduledStart?: string | null;
  durationMinutes?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  serviceAddress?: string | null;
  totalValue?: number;
}) {
  const job_number = await nextDocNumber(args.companyId, "JOB", "jobs", "job_number");
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      company_id: args.companyId,
      customer_id: args.customerId,
      job_number,
      title: args.title,
      description: args.description || null,
      scheduled_start: args.scheduledStart || null,
      duration_minutes: args.durationMinutes ?? 60,
      priority: args.priority ?? "medium",
      service_address: args.serviceAddress || null,
      total_value: args.totalValue ?? 0,
      created_by: args.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function createEstimateForCustomer(args: {
  companyId: string;
  userId: string | null;
  customerId: string;
  title: string;
  total?: number;
  notes?: string;
}) {
  const estimate_number = await nextDocNumber(args.companyId, "EST", "estimates", "estimate_number");
  const { data, error } = await supabase
    .from("estimates")
    .insert({
      company_id: args.companyId,
      customer_id: args.customerId,
      estimate_number,
      title: args.title,
      total: args.total ?? 0,
      subtotal: args.total ?? 0,
      notes: args.notes || null,
      created_by: args.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function createInvoiceForCustomer(args: {
  companyId: string;
  userId: string | null;
  customerId: string;
  jobId?: string | null;
  estimateId?: string | null;
  total: number;
  dueDate?: string | null;
  notes?: string;
}) {
  const invoice_number = await nextDocNumber(args.companyId, "INV", "invoices", "invoice_number");
  const total = Number(args.total) || 0;
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      company_id: args.companyId,
      customer_id: args.customerId,
      job_id: args.jobId || null,
      estimate_id: args.estimateId || null,
      invoice_number,
      total,
      subtotal: total,
      balance_due: total,
      due_at: args.dueDate || null,
      notes: args.notes || null,
      created_by: args.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function recordPayment(args: {
  companyId: string;
  userId: string | null;
  invoiceId: string;
  customerId: string;
  amount: number;
  method?: "card" | "cash" | "check" | "ach" | "other";
  reference?: string;
}) {
  const { error } = await supabase.from("payments").insert({
    company_id: args.companyId,
    invoice_id: args.invoiceId,
    customer_id: args.customerId,
    amount: args.amount,
    method: args.method ?? "card",
    reference: args.reference || null,
    created_by: args.userId,
  });
  if (error) throw error;

  // Update invoice balance + status
  const { data: pays } = await supabase
    .from("payments")
    .select("amount")
    .eq("invoice_id", args.invoiceId)
    .eq("status", "completed");
  const paid = (pays ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0);
  const { data: inv } = await supabase
    .from("invoices")
    .select("total")
    .eq("id", args.invoiceId)
    .maybeSingle();
  const total = Number(inv?.total ?? 0);
  const balance = Math.max(0, total - paid);
  const status = balance <= 0 ? "paid" : paid > 0 ? "partial" : "sent";
  await supabase
    .from("invoices")
    .update({ amount_paid: paid, balance_due: balance, status })
    .eq("id", args.invoiceId);
}