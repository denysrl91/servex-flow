import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

async function ensureWorkspace(user: User): Promise<string> {
  // First try a quick read in case everything is already provisioned.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileError && profile?.company_id) {
    return profile.company_id;
  }

  // Call the SECURITY DEFINER RPC that creates/repairs profile + company + owner role.
  const { data: workspaceId, error: rpcError } = await supabase.rpc("ensure_user_workspace");
  if (rpcError) {
    console.error("ensure_user_workspace RPC failed:", rpcError);
    throw rpcError;
  }
  if (!workspaceId) {
    throw new Error("Workspace setup returned no company id");
  }
  return workspaceId as string;
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

    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .eq("company_id", workspaceId);

    if (rolesError) throw rolesError;

    setCompanyId(workspaceId);
    setRoles(((rolesData ?? []) as { role: AppRole }[]).map((r) => r.role));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Workspace/profile setup failed:", error);
    toast.error(`Workspace setup failed: ${msg}`);
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

    supabase.auth.getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await loadProfile(data.session.user);
        }
      })
      .catch((error) => {
        console.error("Session restore failed:", error);
        setSession(null);
        setUser(null);
        setCompanyId(null);
        setRoles([]);
      })
      .finally(() => setLoading(false));

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
