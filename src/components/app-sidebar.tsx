import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Contact2, Users, Building2, Wrench, Calendar, Radio,
  Briefcase, FileText, Receipt, CreditCard, Package, Truck, Warehouse,
  ShoppingCart, HardHat, TrendingUp, Headphones, BarChart3, Settings, Snowflake,
  Tag, BookOpen,
  Brain, MessageSquare, FolderOpen, BadgeCheck, Layers, HardDrive, ClipboardList,
  Car, Landmark, RefreshCw, Building, MapPin, ShieldCheck, CalendarCheck,
  UserSquare2, Globe, Star, Bell, LineChart, Compass, PieChart, Plug, Code2,
  Zap, Clock, DollarSign, GraduationCap, Repeat,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const overviewNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "AI Operations Brain", url: "/ai-brain", icon: Brain },
];

const customersNav = [
  { title: "CRM", url: "/crm", icon: Contact2 },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Properties", url: "/properties", icon: Building2 },
  { title: "Equipment", url: "/equipment", icon: Wrench },
  { title: "Communications", url: "/communications", icon: MessageSquare },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Memberships", url: "/memberships", icon: BadgeCheck },
];

const opsNav = [
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Dispatch Board", url: "/dispatch", icon: Radio },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Projects", url: "/projects", icon: Layers },
  { title: "Installations", url: "/installations", icon: HardDrive },
  { title: "Service Tickets", url: "/tickets", icon: Headphones },
  { title: "Forms & Checklists", url: "/forms", icon: ClipboardList },
  { title: "Fleet", url: "/fleet", icon: Car },
];

const salesNav = [
  { title: "Estimates", url: "/estimates", icon: FileText },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Sales Pipeline", url: "/pipeline", icon: TrendingUp },
  { title: "Financing", url: "/financing", icon: Landmark },
  { title: "Sales Price Book", url: "/sales-catalog", icon: Tag },
  { title: "Service Price Book", url: "/services-catalog", icon: BookOpen },
  { title: "Membership Billing", url: "/membership-billing", icon: Repeat },
];

const inventoryNav = [
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Van Inventory", url: "/inventory/vans", icon: Truck },
  { title: "Warehouse", url: "/inventory/warehouse", icon: Warehouse },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
  { title: "Vendors", url: "/vendors", icon: Building },
  { title: "Inventory Transfers", url: "/inventory/transfer", icon: RefreshCw },
];

const workforceNav = [
  { title: "Technicians", url: "/technicians", icon: HardHat },
  { title: "Payroll", url: "/payroll", icon: DollarSign },
  { title: "Time Tracking", url: "/time-tracking", icon: Clock },
  { title: "Commissions", url: "/commissions", icon: TrendingUp },
  { title: "Training", url: "/training", icon: GraduationCap },
];

const commercialNav = [
  { title: "Commercial Accounts", url: "/commercial", icon: Building },
  { title: "Assets", url: "/assets", icon: Package },
  { title: "Locations", url: "/locations", icon: MapPin },
  { title: "SLA Management", url: "/sla", icon: ShieldCheck },
  { title: "Preventive Maintenance", url: "/preventive-maintenance", icon: CalendarCheck },
];

const cxNav = [
  { title: "Customer Portal", url: "/customer-portal", icon: UserSquare2 },
  { title: "Online Booking", url: "/online-booking", icon: Globe },
  { title: "Reviews", url: "/reviews", icon: Star },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const analyticsNav = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Executive Dashboard", url: "/executive-dashboard", icon: LineChart },
  { title: "Forecasting", url: "/forecasting", icon: Compass },
  { title: "Business Intelligence", url: "/business-intelligence", icon: PieChart },
];

const systemNav = [
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "API Access", url: "/api-access", icon: Code2 },
  { title: "Automation", url: "/automation", icon: Zap },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items, currentPath }: { label: string; items: typeof overviewNav; currentPath: string }) {
  const { state } = useSidebar();
  return (
    <SidebarGroup className="px-1.5 pb-1.5 pt-2 first:pt-1">
      {state !== "collapsed" && (
        <SidebarGroupLabel className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const active = item.url === "/" ? currentPath === "/" : currentPath.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className="h-9 rounded-md data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/70"}`} />
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-primary-foreground glow-primary" style={{ backgroundImage: "var(--gradient-primary)" }}>
            <Snowflake className="h-5 w-5" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground text-glow">Servex</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Field Service</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavGroup label="Overview" items={overviewNav} currentPath={currentPath} />
        <NavGroup label="CRM" items={customersNav} currentPath={currentPath} />
        <NavGroup label="Operations" items={opsNav} currentPath={currentPath} />
        <NavGroup label="Sales & Billing" items={salesNav} currentPath={currentPath} />
        <NavGroup label="Inventory" items={inventoryNav} currentPath={currentPath} />
        <NavGroup label="Workforce" items={workforceNav} currentPath={currentPath} />
        <NavGroup label="Commercial" items={commercialNav} currentPath={currentPath} />
        <NavGroup label="Customer Experience" items={cxNav} currentPath={currentPath} />
        <NavGroup label="Analytics" items={analyticsNav} currentPath={currentPath} />
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
