import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

type ListOptions = {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  filters?: Record<string, string | number | boolean | null>;
  enabled?: boolean;
};

/**
 * Tenant-scoped list query. Auto-keys by table + companyId + options so React
 * Query handles caching, refetch and invalidation. RLS still enforces the
 * company_id check at the database — this is just convention for the cache key.
 */
export function useTenantList<Row = Record<string, unknown>>(
  table: TableName,
  options: ListOptions = {},
) {
  const { companyId } = useAuth();
  const enabled = (options.enabled ?? true) && !!companyId;
  const key: QueryKey = [table, companyId, options];

  const query = useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => {
      let q = supabase.from(table).select(options.select ?? "*");
      if (options.filters) {
        for (const [k, v] of Object.entries(options.filters)) {
          if (v === null) q = q.is(k, null);
          else q = q.eq(k, v as never);
        }
      }
      if (options.orderBy) {
        q = q.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
      } else {
        q = q.order("created_at", { ascending: false });
      }
      if (options.limit) q = q.limit(options.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  return query;
}

/**
 * Tenant-scoped mutation. Wraps insert/update/delete with auto company_id,
 * created_by, toast feedback, and cache invalidation for the table.
 */
export function useTenantMutation<TVars = unknown, TResult = unknown>(
  table: TableName,
  fn: (
    vars: TVars,
    ctx: { companyId: string; userId: string | null; supabase: typeof supabase },
  ) => Promise<TResult>,
  opts?: { successMessage?: string; invalidate?: TableName[] },
) {
  const { companyId, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: TVars) => {
      if (!companyId) throw new Error("No company context — please sign in again");
      return fn(vars, { companyId, userId: user?.id ?? null, supabase });
    },
    onSuccess: () => {
      if (opts?.successMessage) toast.success(opts.successMessage);
      qc.invalidateQueries({ queryKey: [table] });
      for (const t of opts?.invalidate ?? []) qc.invalidateQueries({ queryKey: [t] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export const fmtMoney = (n: number | string | null | undefined) =>
  `$${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString() : "—";
