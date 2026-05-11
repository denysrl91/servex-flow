import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "owner"
  | "admin"
  | "dispatcher"
  | "technician"
  | "accountant"
  | "sales_rep"
  | "office_staff"
  | "warehouse_manager";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  companyId: string | null;
  roles: AppRole[];
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

async function ensureWorkspace(user: User) {
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (profile?.company_id) {
    return profile.company_id;
  }

  const companyName =
    user.user_metadata?.company_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "My HVAC Company";

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      email: user.email ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (companyError) throw companyError;

  const companyId = company.id;

  if (!profile) {
    const { error: insertProfileError } = await supabase.from("profiles").insert({
      id: user.id,
      company_id: companyId,
      full_name: user.user_metadata?.full_name ?? user.email ?? "Owner",
      email: user.email ?? null,
    });

    if (insertProfileError) throw insertProfileError;
  } else {
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", user.id);

    if (updateProfileError) throw updateProfileError;
  }

  await supabase.from("user_roles").upsert(
    {
      user_id: user.id,
      company_id: companyId,
      role: "owner",
    },
    {
      onConflict: "user_id,company_id,role",
    }
  );

  return companyId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const loadProfile = async (currentUser: User) => {
    try {
      const workspaceId = await ensureWorkspace(currentUser);

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .eq("company_id", workspaceId);

      setCompanyId(workspaceId);
      setRoles(((rolesData ?? []) as { role: AppRole }[]).map((r) => r.role));
    } catch (error) {
      console.error("Workspace/profile setup failed:", error);
      setCompanyId(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setTimeout(() => loadProfile(newSession.user), 0);
      } else {
        setCompanyId(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await loadProfile(data.session.user);
      }

      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    user,
    session,
    loading,
    companyId,
    roles,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refresh: async () => {
      if (user) await loadProfile(user);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function hasAnyRole(roles: AppRole[], required: AppRole[]) {
  return roles.some((r) => required.includes(r));
}
