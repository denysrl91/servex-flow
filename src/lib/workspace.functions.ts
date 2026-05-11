import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ensureWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const email = typeof context.claims.email === "string" ? context.claims.email : `${userId}@user.local`;
    const metadata = (context.claims.user_metadata ?? {}) as Record<string, unknown>;
    const fullName = String(metadata.full_name ?? metadata.name ?? email);
    const requestedCompany = String(metadata.company_name ?? "").trim();

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    let companyId = existingProfile?.company_id ?? null;

    if (!companyId) {
      const { data: role } = await supabaseAdmin
        .from("user_roles")
        .select("company_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      companyId = role?.company_id ?? null;
    }

    if (!companyId) {
      const { data: company, error } = await supabaseAdmin
        .from("companies")
        .insert({ name: requestedCompany || `${fullName}'s HVAC Company`, email })
        .select("id")
        .single();
      if (error) throw error;
      companyId = company.id;
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      company_id: companyId,
      email,
      full_name: fullName,
    });
    if (profileError) throw profileError;

    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      company_id: companyId,
      role: "owner",
    }, { onConflict: "user_id,company_id,role" });
    if (roleError) throw roleError;

    return { companyId };
  });