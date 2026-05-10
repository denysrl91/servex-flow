import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Servex — HVAC Field Service Management" },
      { name: "description", content: "AI-powered field service platform for scheduling, dispatching, CRM, estimating, invoicing, inventory, analytics, and contractor operations management." },
      { name: "author", content: "Servex" },
      { property: "og:title", content: "Servex — HVAC Field Service Management" },
      { property: "og:description", content: "AI-powered field service platform for scheduling, dispatching, CRM, estimating, invoicing, inventory, analytics, and contractor operations management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Servex — HVAC Field Service Management" },
      { name: "twitter:description", content: "AI-powered field service platform for scheduling, dispatching, CRM, estimating, invoicing, inventory, analytics, and contractor operations management." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/o8VZx251IfY9EZ5Joby2RtCdfpo1/social-images/social-1778334777399-ServexIQ_V1.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/o8VZx251IfY9EZ5Joby2RtCdfpo1/social-images/social-1778334777399-ServexIQ_V1.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [loading, user, isPublic, navigate]);

  if (isPublic) return <Outlet />;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const initials = (user.user_metadata?.full_name || user.email || "U")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b hairline glass-strong px-3 sm:gap-3 sm:px-4">
            <SidebarTrigger className="shrink-0" />
            <Select defaultValue="acme">
              <SelectTrigger className="hidden h-9 w-[200px] border-border/60 bg-card/40 md:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acme">Acme HVAC Co.</SelectItem>
                <SelectItem value="north">Northstar Mechanical</SelectItem>
                <SelectItem value="bay">Bay Area Climate</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative hidden min-w-0 flex-1 max-w-xl md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers, jobs, invoices…"
                className="h-9 border-border/60 bg-card/40 pl-9"
              />
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
              </Button>
              <div
                className="hidden h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground glow-primary sm:flex"
                style={{ backgroundImage: "var(--gradient-primary)" }}
                title={user.email ?? ""}
              >
                {initials}
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
