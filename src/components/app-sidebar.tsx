import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Users, Wrench, FileText, Receipt, Package, HardHat,
  BarChart3, Settings, Snowflake, ChevronRight, Megaphone, Plug,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton,
  SidebarMenuSubItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Child = { title: string; url: string };
type Section = { title: string; url: string; icon: typeof LayoutDashboard; children: Child[] };

const NAV: Section[] = [
  {
    title: "Dashboard", url: "/", icon: LayoutDashboard,
    children: [
      { title: "Executive Dashboard", url: "/executive-dashboard" },
      { title: "Operations Overview", url: "/" },
      { title: "Dispatch Dashboard", url: "/dispatch" },
      { title: "Sales Dashboard", url: "/business-intelligence" },
      { title: "AI Insights", url: "/ai-brain" },
    ],
  },
  {
    title: "CRM", url: "/crm", icon: Users,
    children: [
      { title: "CRM Overview", url: "/crm" },
      { title: "Customers", url: "/customers" },
      { title: "Properties", url: "/properties" },
      { title: "Equipment", url: "/equipment" },
      { title: "Commercial Accounts", url: "/commercial" },
      { title: "Documents & Photos", url: "/documents" },
      { title: "Communications", url: "/communications" },
    ],
  },
  {
    title: "Operations", url: "/jobs", icon: Wrench,
    children: [
      { title: "Jobs", url: "/jobs" },
      { title: "Schedule", url: "/schedule" },
      { title: "Dispatch Board", url: "/dispatch" },
      { title: "Service Tickets", url: "/tickets" },
      { title: "Installations", url: "/installations" },
      { title: "Preventive Maintenance", url: "/preventive-maintenance" },
      { title: "Projects", url: "/projects" },
      { title: "Fleet Tracking", url: "/fleet" },
      { title: "Time Tracking", url: "/time-tracking" },
      { title: "SLA Management", url: "/sla" },
    ],
  },
  {
    title: "Sales", url: "/estimates", icon: FileText,
    children: [
      { title: "Estimates", url: "/estimates" },
      { title: "Sales Pipeline", url: "/pipeline" },
      { title: "Price Book", url: "/sales-catalog" },
      { title: "Service Catalog", url: "/services-catalog" },
      { title: "Memberships", url: "/memberships" },
      { title: "Financing", url: "/financing" },
      { title: "Online Booking", url: "/online-booking" },
    ],
  },
  {
    title: "Billing", url: "/invoices", icon: Receipt,
    children: [
      { title: "Invoices", url: "/invoices" },
      { title: "Payments", url: "/payments" },
      { title: "Membership Billing", url: "/membership-billing" },
    ],
  },
  {
    title: "Inventory", url: "/inventory", icon: Package,
    children: [
      { title: "Inventory Overview", url: "/inventory" },
      { title: "Items", url: "/inventory/items" },
      { title: "Warehouse", url: "/inventory/warehouse" },
      { title: "Van Inventory", url: "/inventory/vans" },
      { title: "Transfers", url: "/inventory/transfer" },
      { title: "Low Stock", url: "/inventory/low-stock" },
      { title: "Purchase Orders", url: "/purchase-orders" },
      { title: "Vendors", url: "/vendors" },
      { title: "Inventory Reports", url: "/inventory/reports" },
    ],
  },
  {
    title: "Workforce", url: "/technicians", icon: HardHat,
    children: [
      { title: "Technicians", url: "/technicians" },
      { title: "Payroll", url: "/payroll" },
      { title: "Commissions", url: "/commissions" },
      { title: "Training & Certifications", url: "/training" },
    ],
  },
  {
    title: "Marketing", url: "/reviews", icon: Megaphone,
    children: [
      { title: "Reviews", url: "/reviews" },
      { title: "Communications", url: "/communications" },
      { title: "Customer Portal", url: "/customer-portal" },
      { title: "Forms", url: "/forms" },
      { title: "Online Booking", url: "/online-booking" },
    ],
  },
  {
    title: "Reports & Analytics", url: "/reports", icon: BarChart3,
    children: [
      { title: "Reports", url: "/reports" },
      { title: "Business Intelligence", url: "/business-intelligence" },
      { title: "Forecasting", url: "/forecasting" },
      { title: "Executive Dashboard", url: "/executive-dashboard" },
      { title: "AI Brain", url: "/ai-brain" },
    ],
  },
  {
    title: "Integrations", url: "/integrations", icon: Plug,
    children: [
      { title: "Integrations", url: "/integrations" },
      { title: "Automations", url: "/automation" },
      { title: "API Access", url: "/api-access" },
    ],
  },
  {
    title: "Settings", url: "/settings", icon: Settings,
    children: [
      { title: "Company Settings", url: "/settings" },
      { title: "Locations", url: "/locations" },
      { title: "Assets", url: "/assets" },
      { title: "Notifications", url: "/notifications" },
    ],
  },
];

function isChildActive(url: string, path: string) {
  return url === "/" ? path === "/" : path === url || path.startsWith(url + "/");
}

function sectionActive(section: Section, path: string) {
  return section.children.some((c) => isChildActive(c.url, path));
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { user, companyId, roles } = useAuth();
  const { data: company } = useQuery({
    queryKey: ["sidebar-company", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId!)
        .maybeSingle();
      return data;
    },
  });
  const companyName = company?.name?.trim() || "My Company";
  const userLabel = (user?.user_metadata as { full_name?: string } | undefined)?.full_name || user?.email || "Signed in";
  const roleLabel = roles[0] ? roles[0].replace(/_/g, " ") : null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-primary-foreground glow-primary" style={{ backgroundImage: "var(--gradient-primary)" }}>
            <Snowflake className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground text-glow">Servex</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Field Service</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup className="px-1.5 py-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV.map((section) => {
                const active = sectionActive(section, currentPath);

                if (collapsed) {
                  return (
                    <SidebarMenuItem key={section.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={section.title}
                        className="h-9 rounded-md data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                      >
                        <Link to={section.url} className="flex items-center gap-3">
                          <section.icon className={`h-4 w-4 shrink-0 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/70"}`} />
                          <span>{section.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible key={section.title} defaultOpen={active} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={active}
                          className="h-9 rounded-md data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                        >
                          <section.icon className={`h-4 w-4 shrink-0 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/70"}`} />
                          <span className="flex-1 text-left">{section.title}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mr-0 border-sidebar-border/60 pr-0">
                          {section.children.map((child) => {
                            const cActive = isChildActive(child.url, currentPath);
                            return (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton asChild isActive={cActive} className="data-[active=true]:bg-sidebar-accent/60 data-[active=true]:text-sidebar-accent-foreground">
                                  <Link to={child.url}>{child.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-xs text-sidebar-foreground/60">
            <p className="truncate font-medium text-sidebar-foreground">{companyName}</p>
            <p className="truncate">{userLabel}{roleLabel ? ` · ${roleLabel}` : ""}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
