import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Building2, Wrench, Calendar, Radio,
  Briefcase, FileText, Receipt, Package, ShoppingCart, HardHat,
  TrendingUp, Headphones, BarChart3, Settings, Snowflake,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Properties", url: "/properties", icon: Building2 },
  { title: "Equipment", url: "/equipment", icon: Wrench },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Dispatch", url: "/dispatch", icon: Radio },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
];

const salesNav = [
  { title: "Estimates", url: "/estimates", icon: FileText },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Sales Pipeline", url: "/pipeline", icon: TrendingUp },
];

const opsNav = [
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
  { title: "Technicians", url: "/technicians", icon: HardHat },
  { title: "Tickets", url: "/tickets", icon: Headphones },
];

const systemNav = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items, currentPath }: { label: string; items: typeof mainNav; currentPath: string }) {
  const { state } = useSidebar();
  return (
    <SidebarGroup>
      {state !== "collapsed" && <SidebarGroupLabel className="text-sidebar-foreground/60">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = item.url === "/" ? currentPath === "/" : currentPath.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Snowflake className="h-5 w-5" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">Servex</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">HVAC Field Service</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavGroup label="Operations" items={mainNav} currentPath={currentPath} />
        <NavGroup label="Sales & Billing" items={salesNav} currentPath={currentPath} />
        <NavGroup label="Workforce" items={opsNav} currentPath={currentPath} />
        <NavGroup label="System" items={systemNav} currentPath={currentPath} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {state !== "collapsed" && (
          <div className="px-2 py-2 text-xs text-sidebar-foreground/60">
            <p className="font-medium text-sidebar-foreground">Acme HVAC Co.</p>
            <p>Pro Plan · 12 seats</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}