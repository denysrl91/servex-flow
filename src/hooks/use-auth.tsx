import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const loadProfile = async (uid: string) => {
    const [{ data: profile }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("company_id").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setCompanyId(profile?.company_id ?? null);
    setRoles(((rolesData ?? []) as { role: AppRole }[]).map((r) => r.role));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setCompanyId(null);
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
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
      if (user) await loadProfile(user.id);
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