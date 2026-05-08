import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Responsive, WidthProvider, type LayoutItem, type ResponsiveLayouts } from "react-grid-layout/legacy";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign, Briefcase, Calendar, CheckCircle2, Receipt, TrendingUp, Package,
  CircleDollarSign, BadgeCheck, Activity, Plus, Sparkles, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Flame, MapPin, Truck, Zap, Brain, Wrench, Radio,
  ClipboardCheck, Headphones, ShieldAlert, Snowflake,
  Users, FileText, Boxes, Home, Wind, HardHat, Briefcase as BriefcaseIcon,
  ShoppingCart, LifeBuoy, Tag, ChevronDown,
  ChevronUp, RotateCcw, GripVertical,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

/* ---------------- Mock Data ---------------- */
const kpis = [
  { label: "Today's Revenue",       value: "$8,420",   delta: "+12.4%", up: true,  icon: DollarSign,       trend: [4,6,5,7,8,9,8,10], to: "/payments" },
  { label: "Month-to-Date Revenue", value: "$184,320", delta: "+8.1%",  up: true,  icon: TrendingUp,       trend: [5,6,7,6,8,9,11,12], to: "/reports" },
  { label: "Open Invoices",         value: "$32,450",  delta: "4 overdue", up: false, icon: Receipt,       trend: [9,8,8,7,7,6,6,5], to: "/invoices" },
  { label: "Active Jobs",           value: "23",       delta: "+3",     up: true,  icon: Briefcase,        trend: [3,4,4,5,6,5,6,7], to: "/jobs" },
  { label: "Scheduled Today",       value: "31",       delta: "+5",     up: true,  icon: Calendar,         trend: [6,7,7,8,8,9,9,10], to: "/schedule" },
  { label: "Completed Jobs",        value: "14",       delta: "+18%",   up: true,  icon: CheckCircle2,     trend: [2,3,4,5,6,7,8,9], to: "/jobs" },
  { label: "Average Ticket",        value: "$612",     delta: "+4.2%",  up: true,  icon: CircleDollarSign, trend: [4,5,5,6,6,7,7,8], to: "/tickets" },
  { label: "Gross Margin",          value: "42.6%",    delta: "+1.1pt", up: true,  icon: Activity,         trend: [6,6,7,7,7,8,8,9], to: "/reports" },
  { label: "Membership Revenue",    value: "$24,180",  delta: "+6.4%",  up: true,  icon: BadgeCheck,       trend: [3,4,4,5,5,6,7,8], to: "/crm" },
  { label: "Inventory Value",       value: "$148,900", delta: "-1.8%",  up: false, icon: Package,          trend: [9,9,8,8,7,8,7,7], to: "/inventory" },
];

const dispatchBoard = [
  { col: "Unassigned",  color: "#7E8A97", count: 4,
    jobs: [
      { id: "J-5031", customer: "Westside Cafe",     type: "RTU not cooling",         priority: "Urgent", eta: "—" },
      { id: "J-5032", customer: "Lakeside HOA",      type: "Pool heater service",     priority: "Medium", eta: "—" },
    ]},
  { col: "Scheduled",   color: "#009DFF", count: 9,
    jobs: [
      { id: "J-5002", customer: "Bayview Office",    type: "Chiller maintenance",     priority: "Medium", eta: "10:30" },
      { id: "J-5003", customer: "John Mitchell",     type: "Furnace tune-up",         priority: "Low",    eta: "13:00" },
    ]},
  { col: "Dispatched",  color: "#25B7FF", count: 5,
    jobs: [
      { id: "J-5004", customer: "Greenfield Schools",type: "Boiler emergency",        priority: "Urgent", eta: "14:30" },
    ]},
  { col: "In Progress", color: "#FFB020", count: 6,
    jobs: [
      { id: "J-5001", customer: "Sunrise Apartments",type: "AC not cooling - Unit 4B",priority: "High",   eta: "On site" },
    ]},
  { col: "Completed",   color: "#00C853", count: 14,
    jobs: [
      { id: "J-4998", customer: "Marcus Lee",        type: "Heat pump diagnostic",    priority: "Medium", eta: "Done" },
    ]},
];

const techs = [
  { name: "Alex Rivera",   van: "Van 12", status: "On Site",      job: "Sunrise - AC repair",        next: "Greenfield - Boiler",        revenue: "$1,840", done: 3, lowStock: true  },
  { name: "Jamie Wu",      van: "Van 08", status: "On the Way",   job: "Bayview - Chiller maint.",   next: "Lakeside - Heater",          revenue: "$1,420", done: 2, lowStock: false },
  { name: "Carlos Mendez", van: "Van 14", status: "In Progress",  job: "Mitchell - Furnace tune-up", next: "Westside Cafe - RTU",        revenue: "$680",   done: 2, lowStock: false },
  { name: "Sam Patel",     van: "Van 03", status: "Available",    job: "—",                          next: "Marcus Lee - Heat pump",     revenue: "$320",   done: 1, lowStock: true  },
  { name: "Priya Shah",    van: "Van 21", status: "Completed",    job: "Install survey - Patel",     next: "—",                          revenue: "$0",     done: 1, lowStock: false },
  { name: "Devon Brooks",  van: "Van 17", status: "Off Duty",     job: "—",                          next: "—",                          revenue: "$0",     done: 0, lowStock: false },
];

const techStatusColor: Record<string,string> = {
  "Available":  "bg-[oklch(0.65_0.20_145)/0.15] text-[oklch(0.7_0.20_145)] border-[oklch(0.65_0.20_145)/0.4]",
  "On the Way": "bg-primary/15 text-primary border-primary/40",
  "On Site":    "bg-[oklch(0.78_0.16_75)/0.15] text-[oklch(0.78_0.16_75)] border-[oklch(0.78_0.16_75)/0.4]",
  "In Progress":"bg-[oklch(0.78_0.16_75)/0.15] text-[oklch(0.78_0.16_75)] border-[oklch(0.78_0.16_75)/0.4]",
  "Completed":  "bg-[oklch(0.65_0.20_145)/0.15] text-[oklch(0.7_0.20_145)] border-[oklch(0.65_0.20_145)/0.4]",
  "Off Duty":   "bg-muted text-muted-foreground border-border",
};

const lowStock = [
  { name: "Capacitor 45/5 MFD 440V", onHand: 4,  min: 20, location: "Van 03" },
  { name: "Contactor 2-Pole 40A",    onHand: 2,  min: 12, location: "Van 12" },
  { name: "Float Switch Safety",     onHand: 6,  min: 15, location: "Warehouse A2" },
  { name: "Honeywell T6 Thermostat", onHand: 3,  min: 10, location: "Van 12" },
  { name: "Fuse 30A ATM",            onHand: 8,  min: 25, location: "Warehouse A1" },
  { name: "Condensate Pump 120V",    onHand: 1,  min: 6,  location: "Van 08" },
  { name: "PVC 3/4\" Trap",          onHand: 9,  min: 24, location: "Warehouse B1" },
  { name: "Drain Tablets (60ct)",    onHand: 5,  min: 20, location: "Van 14" },
  { name: "18ga Low-voltage Wire",   onHand: 1,  min: 4,  location: "Van 03" },
  { name: "Refrigerant Line Insul.", onHand: 7,  min: 18, location: "Warehouse B2" },
  { name: "UV Light Bulb 24V",       onHand: 2,  min: 8,  location: "Warehouse A3" },
];

const pipeline = [
  { stage: "New Leads",        count: 18, value: 84200,  color: "#25B7FF" },
  { stage: "Estimate Sent",    count: 11, value: 162400, color: "#009DFF" },
  { stage: "Follow-Up Needed", count: 7,  value: 92800,  color: "#FFB020" },
  { stage: "Approved",         count: 5,  value: 138900, color: "#00C853" },
  { stage: "Lost",             count: 3,  value: 41200,  color: "#FF3D3D" },
  { stage: "Installed",        count: 9,  value: 211400, color: "#00C853" },
];

const aiInsights = [
  { icon: Truck,         tone: "primary",  text: "3 vans are below minimum inventory levels.", cta: "Review restock", to: "/inventory/vans" },
  { icon: MapPin,        tone: "primary",  text: "Tech Carlos has the shortest route for emergency call #1842.", cta: "Dispatch Carlos", to: "/dispatch" },
  { icon: ClipboardCheck,tone: "warning",  text: "5 estimates over $5,000 need follow-up today.", cta: "Open list", to: "/estimates" },
  { icon: Zap,           tone: "primary",  text: "Capacitor usage trending +28% this week.", cta: "Adjust min stock", to: "/inventory/low-stock" },
  { icon: BadgeCheck,    tone: "success",  text: "12 maintenance memberships expiring this month.", cta: "Send renewals", to: "/crm" },
  { icon: ShieldAlert,   tone: "danger",   text: "Job #1045 is below target gross margin.", cta: "Inspect job", to: "/jobs" },
];

const aiToneClass: Record<string,string> = {
  primary: "text-primary border-primary/30 bg-primary/5",
  success: "text-[oklch(0.7_0.20_145)] border-[oklch(0.65_0.20_145)/0.35] bg-[oklch(0.65_0.20_145)/0.06]",
  warning: "text-[oklch(0.78_0.16_75)] border-[oklch(0.78_0.16_75)/0.35] bg-[oklch(0.78_0.16_75)/0.06]",
  danger:  "text-[oklch(0.69_0.21_45)] border-[oklch(0.69_0.21_45)/0.35] bg-[oklch(0.69_0.21_45)/0.06]",
};

const recentInvoices = [
  { num: "INV-9012", cust: "Sunrise Apartments", job: "AC Repair",        amount: 480,  status: "Sent",      due: "May 22", method: "Card",  tech: "Alex R."  },
  { num: "INV-9011", cust: "Bayview Office",     job: "Chiller PM",       amount: 1850, status: "Paid",      due: "May 04", method: "ACH",   tech: "Jamie W." },
  { num: "INV-9010", cust: "Greenfield Schools", job: "Boiler Emergency", amount: 2400, status: "Overdue",   due: "Apr 28", method: "Check", tech: "Alex R."  },
  { num: "INV-9009", cust: "Marcus Lee",         job: "Heat Pump",        amount: 320,  status: "Partial",   due: "May 20", method: "Card",  tech: "Sam P."   },
  { num: "INV-9008", cust: "John Mitchell",      job: "Furnace Tune-up",  amount: 220,  status: "Draft",     due: "—",      method: "—",     tech: "Carlos M."},
];

const invoiceStatus: Record<string,string> = {
  Draft:    "border-border text-muted-foreground",
  Sent:     "border-primary/40 text-primary",
  Paid:     "border-[oklch(0.65_0.20_145)/0.5] text-[oklch(0.7_0.20_145)]",
  Overdue:  "border-[oklch(0.69_0.21_45)/0.5] text-[oklch(0.69_0.21_45)]",
  Partial:  "border-[oklch(0.78_0.16_75)/0.5] text-[oklch(0.78_0.16_75)]",
};

const agreements = [
  { label: "Active Agreements",      value: "284" },
  { label: "Expiring This Month",    value: "12"  },
  { label: "Renewal Opportunities",  value: "$48,200" },
  { label: "Recurring Revenue (MRR)",value: "$24,180" },
  { label: "Missed Visits (30d)",    value: "3"   },
  { label: "Conversion Rate",        value: "62%" },
];

const ticketAlerts = [
  { id: "TK-8201", subject: "AC out at lobby - 24 units affected",  customer: "Sunrise Apartments", priority: "Urgent",  type: "SLA",      age: "1h"  },
  { id: "TK-8200", subject: "Callback - thermostat still offline",  customer: "Marcus Lee",         priority: "High",    type: "Callback", age: "3h"  },
  { id: "TK-8199", subject: "Warranty claim - compressor R-32",     customer: "Greenfield Schools", priority: "High",    type: "Warranty", age: "1d"  },
  { id: "TK-8198", subject: "Cafeteria too warm at lunch rush",     customer: "Greenfield Schools", priority: "Medium",  type: "Open",     age: "5h"  },
  { id: "TK-8197", subject: "Quarterly PM overdue",                 customer: "Bayview Office",     priority: "Medium",  type: "Overdue",  age: "2d"  },
];

const ticketTone: Record<string,string> = {
  Urgent:  "bg-[oklch(0.69_0.21_45)/0.15] text-[oklch(0.69_0.21_45)] border-[oklch(0.69_0.21_45)/0.4]",
  High:    "bg-[oklch(0.78_0.16_75)/0.15] text-[oklch(0.78_0.16_75)] border-[oklch(0.78_0.16_75)/0.4]",
  Medium:  "bg-primary/15 text-primary border-primary/40",
};

const reportSnapshots = [
  { title: "Revenue by Week",         bars: [42,55,48,61,72,68,74,82] },
  { title: "Jobs by Status",          bars: [9, 31, 5, 6, 14, 4] },
  { title: "Inventory Usage",         bars: [22,28,30,26,34,38,42,40] },
  { title: "Technician Performance",  bars: [55,68,72,80,88,92] },
  { title: "Estimate Close Rate",     bars: [38,42,45,48,51,57,62] },
  { title: "Service vs Install Rev.", bars: [60,40,55,45,50,50,52,48] },
];

/* ---------------- Helpers ---------------- */
function Sparkline({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const w = 80, h = 24, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
      <polyline fill="url(#sg)" stroke="none" points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
}

function MiniBars({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-20 items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[3px] transition-all duration-300 hover:opacity-90"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: `linear-gradient(180deg, ${color}, color-mix(in oklab, ${color} 25%, transparent))`,
            boxShadow: `0 0 12px color-mix(in oklab, ${color} 30%, transparent)`,
          }}
        />
      ))}
    </div>
  );
}

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

/* ---------------- Drag-and-drop widget shell ---------------- */
const WIDGET_LAYOUTS_KEY = "servex.dashboard.layouts.v3";
const ResponsiveGridLayout = WidthProvider(Responsive);

type Widget = { id: string; label: string; render: () => ReactNode };

/** Default layout per breakpoint. Cols: lg=12, md=10, sm=6, xs=4, xxs=2. */
const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg: [
    { i: "kpis",                  x: 0, y: 0,  w: 12, h: 4, minW: 6, minH: 3 },
    { i: "dispatch-board",        x: 0, y: 4,  w: 8,  h: 8, minW: 4, minH: 5 },
    { i: "technician-status",     x: 8, y: 4,  w: 4,  h: 8, minW: 3, minH: 5 },
    { i: "inventory-command",     x: 0, y: 12, w: 8,  h: 11, minW: 4, minH: 6 },
    { i: "ai-brain",              x: 8, y: 12, w: 4,  h: 11, minW: 3, minH: 6 },
    { i: "sales-pipeline",        x: 0, y: 23, w: 8,  h: 9, minW: 4, minH: 6 },
    { i: "maintenance-agreements",x: 8, y: 23, w: 4,  h: 9, minW: 3, minH: 5 },
    { i: "recent-invoices",       x: 0, y: 32, w: 8,  h: 8, minW: 4, minH: 5 },
    { i: "ticket-alerts",         x: 8, y: 32, w: 4,  h: 8, minW: 3, minH: 5 },
    { i: "live-map",              x: 0, y: 40, w: 8,  h: 9, minW: 4, minH: 6 },
    { i: "reports-snapshot",      x: 8, y: 40, w: 4,  h: 9, minW: 3, minH: 5 },
  ],
  md: [
    { i: "kpis",                  x: 0, y: 0,  w: 10, h: 4 },
    { i: "dispatch-board",        x: 0, y: 4,  w: 6,  h: 8 },
    { i: "technician-status",     x: 6, y: 4,  w: 4,  h: 8 },
    { i: "inventory-command",     x: 0, y: 12, w: 6,  h: 11 },
    { i: "ai-brain",              x: 6, y: 12, w: 4,  h: 11 },
    { i: "sales-pipeline",        x: 0, y: 23, w: 6,  h: 9 },
    { i: "maintenance-agreements",x: 6, y: 23, w: 4,  h: 9 },
    { i: "recent-invoices",       x: 0, y: 32, w: 6,  h: 8 },
    { i: "ticket-alerts",         x: 6, y: 32, w: 4,  h: 8 },
    { i: "live-map",              x: 0, y: 40, w: 6,  h: 9 },
    { i: "reports-snapshot",      x: 6, y: 40, w: 4,  h: 9 },
  ],
  sm: [
    { i: "kpis",                  x: 0, y: 0,  w: 6, h: 6 },
    { i: "dispatch-board",        x: 0, y: 6,  w: 6, h: 8 },
    { i: "technician-status",     x: 0, y: 14, w: 6, h: 8 },
    { i: "inventory-command",     x: 0, y: 22, w: 6, h: 11 },
    { i: "ai-brain",              x: 0, y: 33, w: 6, h: 9 },
    { i: "sales-pipeline",        x: 0, y: 42, w: 6, h: 9 },
    { i: "maintenance-agreements",x: 0, y: 51, w: 6, h: 7 },
    { i: "recent-invoices",       x: 0, y: 58, w: 6, h: 8 },
    { i: "ticket-alerts",         x: 0, y: 66, w: 6, h: 8 },
    { i: "live-map",              x: 0, y: 74, w: 6, h: 9 },
    { i: "reports-snapshot",      x: 0, y: 83, w: 6, h: 9 },
  ],
};
// Mirror sm to xs/xxs (single column stacks)
DEFAULT_LAYOUTS.xs  = (DEFAULT_LAYOUTS.sm  as LayoutItem[]).map((l) => ({ ...l, w: 4 }));
DEFAULT_LAYOUTS.xxs = (DEFAULT_LAYOUTS.sm  as LayoutItem[]).map((l) => ({ ...l, w: 2 }));

function useWidgetLayouts() {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(DEFAULT_LAYOUTS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIDGET_LAYOUTS_KEY);
      if (raw) setLayouts(JSON.parse(raw));
    } catch {}
  }, []);
  const persist = (next: ResponsiveLayouts) => {
    setLayouts(next);
    try { localStorage.setItem(WIDGET_LAYOUTS_KEY, JSON.stringify(next)); } catch {}
  };
  const reset = () => {
    try { localStorage.removeItem(WIDGET_LAYOUTS_KEY); } catch {}
    setLayouts(DEFAULT_LAYOUTS);
  };
  return { layouts, persist, reset };
}

function WidgetShell({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div key={id} className="group/widget relative h-full w-full overflow-hidden">
      <div
        aria-label={`Drag ${label}`}
        className="widget-drag-handle absolute right-2 top-2 z-20 flex h-7 items-center gap-1 rounded-md border hairline bg-card/85 px-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:text-foreground group-hover/widget:opacity-100 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div className="h-full w-full overflow-auto">
        {children}
      </div>
    </div>
  );
}

const priorityDot: Record<string,string> = {
  Urgent: "bg-[#FF6A00]", High: "bg-[#FFB020]", Medium: "bg-[#25B7FF]", Low: "bg-[#7E8A97]",
};

/* ---------------- Page ---------------- */
const WIDGETS_DEFS: { id: string; label: string }[] = [
  { id: "kpis", label: "KPI Strip" },
  { id: "dispatch-board", label: "Dispatch Board" },
  { id: "technician-status", label: "Technician Status" },
  { id: "inventory-command", label: "Inventory Command" },
  { id: "ai-brain", label: "AI Operations Brain" },
  { id: "sales-pipeline", label: "Sales Pipeline" },
  { id: "maintenance-agreements", label: "Maintenance Agreements" },
  { id: "recent-invoices", label: "Recent Invoices" },
  { id: "ticket-alerts", label: "Service Ticket Alerts" },
  { id: "live-map", label: "Live Routes & Job Map" },
  { id: "reports-snapshot", label: "Reports Snapshot" },
];

function Dashboard() {
  const { layouts, persist, reset } = useWidgetLayouts();

  const renderers: Record<string, () => ReactNode> = {
    "kpis": () => (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl">
          <Card className="premium-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] cursor-pointer">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 60%, transparent), transparent)" }} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_8%,transparent)]">
                  <k.icon className="h-4 w-4" />
                </div>
                <Sparkline data={k.trend} />
              </div>
              <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight tabular-nums">{k.value}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="truncate text-xs text-muted-foreground">{k.label}</p>
                <span className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${k.up ? "border-[oklch(0.65_0.20_145)/0.35] bg-[oklch(0.65_0.20_145)/0.08] text-[oklch(0.7_0.20_145)]" : "border-[oklch(0.69_0.21_45)/0.35] bg-[oklch(0.69_0.21_45)/0.08] text-[oklch(0.69_0.21_45)]"}`}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />} {k.delta}
                </span>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    ),
    "dispatch-board": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-primary" /> Dispatch Board
            </CardTitle>
            <p className="text-xs text-muted-foreground">Live job pipeline · {dispatchBoard.reduce((a,b)=>a+b.count,0)} active jobs</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/dispatch">Open board <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent className="overflow-x-auto pb-4">
          <div className="flex min-w-[860px] gap-3">
            {dispatchBoard.map((c) => (
              <div key={c.col} className="w-[180px] flex-1 rounded-xl border hairline bg-card/40 p-2" style={{ backgroundImage: `linear-gradient(180deg, color-mix(in oklab, ${c.color} 10%, transparent), transparent 60%)` }}>
                <div className="mb-2 flex items-center justify-between px-1.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{c.col}</span>
                  </div>
                  <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums" style={{ borderColor: `color-mix(in oklab, ${c.color} 35%, transparent)`, color: c.color }}>{c.count}</span>
                </div>
                <div className="space-y-2">
                  {c.jobs.map((j) => (
                    <Link key={j.id} to="/jobs" className="block rounded-lg border hairline bg-background/50 p-2 transition hover:bg-background/80 hover:border-primary/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">{j.id}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[j.priority] ?? "bg-muted"}`} />
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium">{j.customer}</p>
                      <p className="truncate text-xs text-muted-foreground">{j.type}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>ETA {j.eta}</span>
                        <span className="rounded-sm border hairline px-1.5 py-px">{j.priority}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    "technician-status": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-primary" /> Technician Status
          </CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/technicians">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {techs.map((t) => (
            <Link key={t.name} to="/technicians" className="flex items-center gap-3 rounded-lg border hairline bg-card/40 p-2.5 transition hover:bg-card/70 hover:border-primary/40">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground ring-2 ring-primary/30" style={{ backgroundImage: "var(--gradient-primary)" }}>
                  {t.name.split(" ").map((s)=>s[0]).join("")}
                </div>
                {t.lowStock && <Flame className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-card p-0.5 text-[#FF6A00]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <Badge variant="outline" className={`${techStatusColor[t.status]} text-[10px]`}>{t.status}</Badge>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{t.van} · {t.job}</p>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Next: {t.next}</span>
                  <span><span className="text-foreground/80">{t.revenue}</span> · {t.done} done</span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    ),
    "inventory-command": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" /> Inventory Command
            </CardTitle>
            <p className="text-xs text-muted-foreground">Critical HVAC parts running low across vans and warehouses.</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/inventory">Open inventory <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Van Alerts", value: "9", icon: Truck, to: "/inventory/vans" as const },
              { label: "Warehouse Alerts", value: "5", icon: Package, to: "/inventory/warehouse" as const },
              { label: "Parts Used Today", value: "126", icon: Activity, to: "/inventory/reports" as const },
              { label: "POs Awaiting Approval", value: "3", icon: ClipboardCheck, to: "/purchase-orders" as const },
            ].map((s) => (
              <Link key={s.label} to={s.to} className="block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <s.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
              </Link>
            ))}
          </div>
          <div className="mt-3 max-h-[260px] overflow-y-auto rounded-lg border hairline">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card/90 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Item</th>
                  <th className="px-3 py-2.5 text-left font-medium">Location</th>
                  <th className="px-3 py-2.5 text-right font-medium">On Hand / Min</th>
                  <th className="px-3 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStock.map((i) => {
                  const ratio = i.onHand / i.min;
                  const danger = ratio < 0.4;
                  return (
                    <tr key={i.name} className="cursor-pointer transition hover:bg-card/40" onClick={() => { window.location.href = "/inventory/low-stock"; }}>
                      <td className="px-3 py-2 font-medium"><Link to="/inventory/low-stock" className="hover:text-primary">{i.name}</Link></td>
                      <td className="px-3 py-2 text-muted-foreground">{i.location}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span className={danger ? "text-[oklch(0.69_0.21_45)]" : "text-foreground"}>{i.onHand}</span>
                        <span className="text-muted-foreground"> / {i.min}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant="outline" className={danger ? "border-[oklch(0.69_0.21_45)/0.5] text-[oklch(0.69_0.21_45)]" : "border-[oklch(0.78_0.16_75)/0.5] text-[oklch(0.78_0.16_75)]"}>
                          {danger ? "Critical" : "Low"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    ),
    "ai-brain": () => (
      <Card className="premium-card relative h-full overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(420px 220px at 100% 0%, color-mix(in oklab, var(--primary) 26%, transparent), transparent 60%), radial-gradient(280px 180px at 0% 100%, color-mix(in oklab, var(--primary-glow) 18%, transparent), transparent 65%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 70%, transparent), transparent)" }} />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary glow-primary">
                <Brain className="h-4 w-4" />
              </span>
              AI Operations Brain
            </CardTitle>
            <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Recommendations updated 2 minutes ago</p>
        </CardHeader>
        <CardContent className="relative space-y-2">
          {aiInsights.map((a, i) => (
            <Link key={i} to={a.to} className={`flex items-start gap-3 rounded-lg border p-3 transition hover:translate-x-0.5 ${aiToneClass[a.tone]}`}>
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background/40">
                <a.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{a.text}</p>
                <span className="mt-1 inline-block text-[11px] font-medium opacity-80 transition hover:opacity-100">{a.cta} →</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    ),
    "sales-pipeline": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Sales Pipeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">Total pipeline ${pipeline.reduce((a,p)=>a+p.value,0).toLocaleString()} · Close rate 38%</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/pipeline">Open pipeline <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {pipeline.map((p) => (
              <Link key={p.stage} to="/pipeline" className="block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <span className="text-[11px] font-medium text-muted-foreground">{p.stage}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{p.count}</p>
                <p className="text-xs text-muted-foreground">${(p.value/1000).toFixed(1)}k</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div className="h-full" style={{ width: `${Math.min(100, p.count*5)}%`, background: p.color }} />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { tier: "Good", value: 14, hue: "#7E8A97" },
              { tier: "Better", value: 22, hue: "#25B7FF" },
              { tier: "Best", value: 9, hue: "#009DFF" },
            ].map((t) => (
              <Link key={t.tier} to="/estimates" className="block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.tier} tier</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: t.hue, textShadow: `0 0 16px color-mix(in oklab, ${t.hue} 45%, transparent)` }}>{t.value}</p>
                <p className="text-[10px] text-muted-foreground">selected this month</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    "maintenance-agreements": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BadgeCheck className="h-4 w-4 text-primary" /> Maintenance Agreements
          </CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/crm">Manage <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {agreements.map((a) => (
            <Link key={a.label} to="/crm" className="block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
              <p className="text-[11px] text-muted-foreground">{a.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{a.value}</p>
            </Link>
          ))}
          <Link to="/reports" className="col-span-2 block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
            <div className="mb-1 flex justify-between text-xs"><span>Annual renewal target</span><span className="text-muted-foreground">$310k / $500k</span></div>
            <Progress value={62} />
          </Link>
        </CardContent>
      </Card>
    ),
    "recent-invoices": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" /> Recent Invoices
          </CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/invoices">All invoices <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b hairline">
                <th className="py-2.5 pr-3 text-left font-medium">Invoice</th>
                <th className="py-2.5 pr-3 text-left font-medium">Customer</th>
                <th className="py-2.5 pr-3 text-left font-medium">Job</th>
                <th className="py-2.5 pr-3 text-right font-medium">Amount</th>
                <th className="py-2.5 pr-3 text-left font-medium">Status</th>
                <th className="py-2.5 pr-3 text-left font-medium">Due</th>
                <th className="py-2.5 pr-3 text-left font-medium">Method</th>
                <th className="py-2.5 text-left font-medium">Tech</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentInvoices.map((r) => (
                <tr key={r.num} className="cursor-pointer transition hover:bg-card/40">
                  <td className="py-2.5 pr-3 font-medium text-primary"><Link to="/invoices" className="hover:underline">{r.num}</Link></td>
                  <td className="py-2.5 pr-3">{r.cust}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{r.job}</td>
                  <td className="py-2.5 pr-3 text-right font-medium tabular-nums">${r.amount.toLocaleString()}</td>
                  <td className="py-2.5 pr-3"><Badge variant="outline" className={invoiceStatus[r.status]}>{r.status}</Badge></td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{r.due}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{r.method}</td>
                  <td className="py-2.5 text-muted-foreground">{r.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    ),
    "ticket-alerts": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Headphones className="h-4 w-4 text-primary" /> Service Ticket Alerts
          </CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/tickets">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {ticketAlerts.map((t) => (
            <Link key={t.id} to="/tickets" className="block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{t.id}</span>·<span>{t.type}</span>·<span>{t.age} ago</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.customer}</p>
                </div>
                <Badge variant="outline" className={`${ticketTone[t.priority]} text-[10px] shrink-0`}>{t.priority}</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    ),
    "live-map": () => (
      <Card className="premium-card h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" /> Live Routes & Job Map
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">8 in field</Badge>
            <Badge variant="outline" className="border-[oklch(0.69_0.21_45)/0.5] text-[oklch(0.69_0.21_45)]"><AlertTriangle className="mr-1 h-3 w-3" />2 emergency</Badge>
            <Button asChild variant="ghost" size="sm"><Link to="/dispatch">Open <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[320px] overflow-hidden rounded-lg border hairline">
            <div className="absolute inset-0" style={{ background: "radial-gradient(600px 320px at 30% 30%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 60%), radial-gradient(500px 280px at 80% 70%, color-mix(in oklab, var(--primary-glow) 18%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in oklab, var(--card) 88%, transparent), color-mix(in oklab, var(--card) 70%, transparent))" }} />
            <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" className="text-muted-foreground" />
            </svg>
            <svg className="absolute inset-0 h-full w-full">
              <path d="M 60 80 Q 200 40 320 160 T 580 220" fill="none" stroke="#25B7FF" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M 100 260 Q 240 220 360 280 T 600 120" fill="none" stroke="#009DFF" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            {[
              { x: "12%", y: "30%", color: "#FF6A00", label: "Emergency · Greenfield" },
              { x: "38%", y: "55%", color: "#009DFF", label: "Bayview · Chiller PM" },
              { x: "62%", y: "40%", color: "#25B7FF", label: "Sunrise · AC Repair" },
              { x: "78%", y: "70%", color: "#00C853", label: "Mitchell · Tune-up done" },
              { x: "50%", y: "82%", color: "#FFB020", label: "Marcus Lee · In progress" },
            ].map((p, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full ring-2 ring-background" style={{ background: p.color, boxShadow: `0 0 16px ${p.color}` }} />
                  <span className="mt-1 hidden whitespace-nowrap rounded-full border hairline bg-card/80 px-2 py-0.5 text-[10px] backdrop-blur sm:inline">{p.label}</span>
                </div>
              </div>
            ))}
            <div className="absolute bottom-3 left-3 rounded-md border hairline glass px-2 py-1 text-[10px] text-muted-foreground">
              <Snowflake className="mr-1 inline h-3 w-3 text-primary" /> Google Maps integration · route optimization placeholder
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    "reports-snapshot": () => (
      <Card className="premium-card h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3Icon className="h-4 w-4 text-primary" /> Reports Snapshot
          </CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/reports">All reports <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {reportSnapshots.map((r) => (
            <Link key={r.title} to="/reports" className="block rounded-lg border hairline bg-card/40 p-3 transition hover:bg-card/60 hover:border-primary/40">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{r.title}</p>
              <div className="mt-3"><MiniBars data={r.bars} /></div>
            </Link>
          ))}
        </CardContent>
      </Card>
    ),
  };

  const widgets: Widget[] = WIDGETS_DEFS.map((def) => ({ ...def, render: renderers[def.id] }));

  return (
    <>
      <PageHeader
        eyebrow="Servex · Live Operations"
        title="Operations Command Center"
        description="Real-time overview of revenue, dispatch, technicians, and inventory. Drag any widget to rearrange."
        actions={
          <>
            <Button variant="outline" size="sm" className="hairline">
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> Ask Servex AI
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="glow-primary" style={{ backgroundImage: "var(--gradient-primary)" }}>
                  <Plus className="mr-2 h-4 w-4" /> Add New <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Operations</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link to="/jobs"><BriefcaseIcon className="mr-2 h-4 w-4" /> Job</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/tickets"><LifeBuoy className="mr-2 h-4 w-4" /> Service Ticket</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/estimates/new"><FileText className="mr-2 h-4 w-4" /> Estimate</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>People & Places</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link to="/customers"><Users className="mr-2 h-4 w-4" /> Customer</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/properties"><Home className="mr-2 h-4 w-4" /> Property</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/equipment"><Wind className="mr-2 h-4 w-4" /> Equipment</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/technicians"><HardHat className="mr-2 h-4 w-4" /> Technician</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Inventory & Catalog</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link to="/inventory/items/new"><Boxes className="mr-2 h-4 w-4" /> Inventory Item</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/purchase-orders"><ShoppingCart className="mr-2 h-4 w-4" /> Purchase Order</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/sales-catalog"><Tag className="mr-2 h-4 w-4" /> Sale Item</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/services-catalog"><Wrench className="mr-2 h-4 w-4" /> Service Item</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="hairline" onClick={reset} title="Reset dashboard layout">
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset layout
            </Button>
          </>
        }
      />

      <div className="p-4 md:p-6 lg:p-8">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={40}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          draggableHandle=".widget-drag-handle"
          isDraggable
          isResizable
          compactType="vertical"
          onLayoutChange={(_current, all) => persist(all)}
        >
          {widgets.map((w) => (
            <div key={w.id}>
              <WidgetShell id={w.id} label={w.label}>{w.render()}</WidgetShell>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </>
  );
}

// alias to avoid clashing with imported BarChart3
function BarChart3Icon(props: React.ComponentProps<typeof TrendingUp>) {
  return <TrendingUp {...props} />;
}
