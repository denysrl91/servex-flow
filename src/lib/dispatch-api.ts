import { supabase } from "@/integrations/supabase/client";

export const JOB_STATUSES = [
  "unassigned",
  "scheduled",
  "dispatched",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
  "invoiced",
  "paid",
  "cancelled",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const STATUS_LABEL: Record<JobStatus, string> = {
  unassigned: "Unassigned",
  scheduled: "Scheduled",
  dispatched: "Dispatched",
  on_the_way: "On the Way",
  arrived: "Arrived",
  in_progress: "In Progress",
  completed: "Completed",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const STATUS_TONE: Record<JobStatus, string> = {
  unassigned: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-primary/10 text-primary border-primary/20",
  dispatched: "bg-[oklch(0.65_0.16_260)/0.15] text-[oklch(0.45_0.16_260)] border-transparent",
  on_the_way: "bg-[oklch(0.72_0.18_220)/0.15] text-[oklch(0.45_0.18_220)] border-transparent",
  arrived: "bg-[oklch(0.72_0.18_180)/0.15] text-[oklch(0.4_0.18_180)] border-transparent",
  in_progress: "bg-[oklch(0.78_0.18_85)/0.2] text-[oklch(0.4_0.16_85)] border-transparent",
  completed: "bg-[oklch(0.65_0.16_150)/0.15] text-[oklch(0.4_0.16_150)] border-transparent",
  invoiced: "bg-[oklch(0.7_0.14_300)/0.15] text-[oklch(0.45_0.14_300)] border-transparent",
  paid: "bg-[oklch(0.65_0.16_150)/0.25] text-[oklch(0.35_0.16_150)] border-transparent font-semibold",
  cancelled: "bg-destructive/10 text-destructive border-transparent line-through",
};

export type Job = {
  id: string;
  job_number: string;
  title: string;
  description: string | null;
  status: JobStatus;
  priority: "low" | "medium" | "high" | "urgent";
  technician_id: string | null;
  customer_id: string;
  property_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  eta_minutes: number | null;
  is_emergency: boolean;
  service_address: string | null;
  recurrence: string | null;
  total_value: number;
};

export type Tech = {
  id: string;
  full_name: string;
  status: string;
  role_title: string | null;
};

export type Customer = { id: string; name: string; billing_address: string | null };

export async function fetchJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("id,job_number,title,description,status,priority,technician_id,customer_id,property_id,scheduled_start,scheduled_end,duration_minutes,eta_minutes,is_emergency,service_address,recurrence,total_value")
    .order("scheduled_start", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function fetchTechs() {
  const { data, error } = await supabase.from("technicians").select("id,full_name,status,role_title").order("full_name");
  if (error) throw error;
  return (data ?? []) as Tech[];
}

export async function fetchCustomers() {
  const { data, error } = await supabase.from("customers").select("id,name,billing_address");
  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function updateJob(id: string, patch: Partial<Job>) {
  const { error } = await supabase.from("jobs").update(patch).eq("id", id);
  if (error) throw error;
}

export function priorityTone(p: string) {
  if (p === "urgent") return "bg-destructive text-destructive-foreground";
  if (p === "high") return "bg-[oklch(0.72_0.18_50)] text-white";
  if (p === "medium") return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}