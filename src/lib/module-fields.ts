// Per-module custom field schemas. Used by <ModuleRecords/> to render
// dynamic forms and tables. All extra values are persisted to the
// `module_records.data` jsonb column. The primary field becomes `title`,
// the secondary field becomes `subtitle`, and a field with key="status"
// (if present) overrides the status column.

export type FieldType =
  | "text" | "textarea" | "number" | "currency"
  | "date" | "email" | "tel" | "select";

export type ModuleField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];      // for select
  primary?: boolean;       // becomes record.title (only one allowed)
  secondary?: boolean;     // becomes record.subtitle (only one allowed)
  showInTable?: boolean;   // include as table column
  span?: 1 | 2;            // grid span in form (default 1)
};

export type ModuleSchema = {
  fields: ModuleField[];
  defaultStatus?: string;
};

const STATUS = (opts: string[], def = opts[0]): ModuleField => ({
  key: "status", label: "Status", type: "select", options: opts, required: true, showInTable: true,
});

const NOTES: ModuleField = { key: "notes", label: "Notes", type: "textarea", span: 2 };

export const MODULE_SCHEMAS: Record<string, ModuleSchema> = {
  // ---------------- CRM ----------------
  "memberships": {
    defaultStatus: "active",
    fields: [
      { key: "name", label: "Membership Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "plan_tier", label: "Plan Tier", type: "select", options: ["Silver","Gold","Platinum","Custom"], required: true, showInTable: true, secondary: true },
      { key: "client", label: "Client / Customer", type: "text", required: true, showInTable: true },
      { key: "property", label: "Property", type: "text" },
      { key: "frequency", label: "Visit Frequency", type: "select", options: ["Monthly","Quarterly","Semi-Annual","Annual"], required: true, showInTable: true },
      { key: "annual_value", label: "Annual Value", type: "currency", required: true, showInTable: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "expiration_date", label: "Expiration Date", type: "date" },
      { key: "agreement_number", label: "Agreement #", type: "text" },
      STATUS(["active","pending","expired","cancelled","renewed"]),
      { key: "details", label: "Coverage Details", type: "textarea", span: 2 },
    ],
  },
  "communications": {
    defaultStatus: "logged",
    fields: [
      { key: "subject", label: "Subject", type: "text", required: true, primary: true, showInTable: true },
      { key: "channel", label: "Channel", type: "select", options: ["Phone","Email","SMS","WhatsApp","In-Person","Note"], required: true, showInTable: true, secondary: true },
      { key: "direction", label: "Direction", type: "select", options: ["Inbound","Outbound"], required: true, showInTable: true },
      { key: "customer", label: "Customer", type: "text", showInTable: true },
      { key: "contact_name", label: "Contact", type: "text" },
      { key: "occurred_at", label: "Date & Time", type: "date", required: true },
      STATUS(["logged","follow_up","resolved","escalated"], "logged"),
      { key: "body", label: "Message / Summary", type: "textarea", span: 2, required: true },
    ],
  },
  "documents": {
    defaultStatus: "active",
    fields: [
      { key: "title", label: "Document Title", type: "text", required: true, primary: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Contract","Invoice","Estimate","Permit","Photo","Manual","Warranty","Other"], required: true, showInTable: true, secondary: true },
      { key: "related_to", label: "Linked To (Customer / Job / Property)", type: "text", showInTable: true },
      { key: "url", label: "File URL", type: "text", placeholder: "https://…" },
      { key: "version", label: "Version", type: "text" },
      { key: "expires_on", label: "Expiration Date", type: "date" },
      STATUS(["active","archived","draft"]),
      NOTES,
    ],
  },

  // ---------------- OPERATIONS ----------------
  "projects": {
    defaultStatus: "planning",
    fields: [
      { key: "project_name", label: "Project Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "customer", label: "Customer", type: "text", required: true, showInTable: true, secondary: true },
      { key: "property", label: "Property", type: "text" },
      { key: "project_manager", label: "Project Manager", type: "text", showInTable: true },
      { key: "budget", label: "Budget", type: "currency", showInTable: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "target_completion", label: "Target Completion", type: "date" },
      STATUS(["planning","in_progress","on_hold","complete","cancelled"], "planning"),
      { key: "scope", label: "Scope of Work", type: "textarea", span: 2 },
    ],
  },
  "installations": {
    defaultStatus: "scheduled",
    fields: [
      { key: "install_name", label: "Install Title", type: "text", required: true, primary: true, showInTable: true },
      { key: "customer", label: "Customer", type: "text", required: true, showInTable: true, secondary: true },
      { key: "property", label: "Property", type: "text" },
      { key: "equipment_type", label: "Equipment Type", type: "select", options: ["AC Unit","Furnace","Heat Pump","Boiler","Mini Split","Water Heater","Other"], required: true, showInTable: true },
      { key: "brand_model", label: "Brand / Model", type: "text" },
      { key: "scheduled_date", label: "Scheduled Date", type: "date", required: true },
      { key: "lead_tech", label: "Lead Technician", type: "text" },
      { key: "permit_number", label: "Permit #", type: "text" },
      { key: "value", label: "Job Value", type: "currency" },
      STATUS(["scheduled","in_progress","commissioning","complete","warranty"]),
      NOTES,
    ],
  },
  "forms": {
    defaultStatus: "active",
    fields: [
      { key: "form_name", label: "Form / Checklist Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "form_type", label: "Type", type: "select", options: ["Inspection","Safety","Install Checklist","Maintenance","Quality Audit","Customer Sign-off","Other"], required: true, showInTable: true, secondary: true },
      { key: "applies_to", label: "Applies To", type: "select", options: ["Jobs","Tickets","Installations","Maintenance","Projects","All"] },
      { key: "owner", label: "Owner", type: "text", showInTable: true },
      { key: "fields_count", label: "# Fields", type: "number" },
      { key: "version", label: "Version", type: "text" },
      STATUS(["active","draft","archived"]),
      { key: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },
  "fleet": {
    defaultStatus: "active",
    fields: [
      { key: "vehicle_name", label: "Vehicle Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "vehicle_type", label: "Type", type: "select", options: ["Service Van","Box Truck","Pickup","Trailer","Car","Other"], required: true, showInTable: true, secondary: true },
      { key: "make", label: "Make", type: "text" },
      { key: "model", label: "Model", type: "text" },
      { key: "year", label: "Year", type: "number" },
      { key: "license_plate", label: "License Plate", type: "text", showInTable: true },
      { key: "vin", label: "VIN", type: "text" },
      { key: "assigned_tech", label: "Assigned Technician", type: "text", showInTable: true },
      { key: "odometer", label: "Odometer (mi)", type: "number" },
      { key: "next_service_due", label: "Next Service Due", type: "date" },
      STATUS(["active","in_shop","retired","reserved"]),
      NOTES,
    ],
  },

  // ---------------- SALES & BILLING ----------------
  "financing": {
    defaultStatus: "available",
    fields: [
      { key: "program_name", label: "Program Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "lender", label: "Lender / Provider", type: "text", required: true, showInTable: true, secondary: true },
      { key: "apr", label: "APR (%)", type: "number", showInTable: true },
      { key: "term_months", label: "Term (months)", type: "number", showInTable: true },
      { key: "min_amount", label: "Min Amount", type: "currency" },
      { key: "max_amount", label: "Max Amount", type: "currency" },
      { key: "promo_code", label: "Promo Code", type: "text" },
      { key: "expires_on", label: "Promo Expiration", type: "date" },
      STATUS(["available","promo","retired"]),
      { key: "details", label: "Program Details", type: "textarea", span: 2 },
    ],
  },
  "membership-billing": {
    defaultStatus: "scheduled",
    fields: [
      { key: "invoice_label", label: "Invoice Label", type: "text", required: true, primary: true, showInTable: true },
      { key: "membership", label: "Membership", type: "text", required: true, showInTable: true, secondary: true },
      { key: "customer", label: "Customer", type: "text", required: true, showInTable: true },
      { key: "amount", label: "Amount", type: "currency", required: true, showInTable: true },
      { key: "billing_cycle", label: "Billing Cycle", type: "select", options: ["Monthly","Quarterly","Annual"], required: true },
      { key: "next_charge_date", label: "Next Charge Date", type: "date", required: true, showInTable: true },
      { key: "payment_method", label: "Payment Method", type: "select", options: ["Card","ACH","Check","Cash"] },
      STATUS(["scheduled","paid","failed","refunded","cancelled"]),
      NOTES,
    ],
  },

  // ---------------- INVENTORY ----------------
  "vendors": {
    defaultStatus: "active",
    fields: [
      { key: "vendor_name", label: "Vendor Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Equipment","Parts","Tools","Supplies","Subcontractor","Other"], required: true, showInTable: true, secondary: true },
      { key: "contact_name", label: "Contact Name", type: "text" },
      { key: "email", label: "Email", type: "email", showInTable: true },
      { key: "phone", label: "Phone", type: "tel", showInTable: true },
      { key: "website", label: "Website", type: "text" },
      { key: "account_number", label: "Account #", type: "text" },
      { key: "payment_terms", label: "Payment Terms", type: "select", options: ["Net 15","Net 30","Net 45","Net 60","COD","Prepaid"] },
      { key: "address", label: "Address", type: "textarea", span: 2 },
      STATUS(["active","preferred","on_hold","inactive"]),
    ],
  },

  // ---------------- WORKFORCE ----------------
  "payroll": {
    defaultStatus: "draft",
    fields: [
      { key: "run_name", label: "Payroll Run Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "period_start", label: "Period Start", type: "date", required: true, showInTable: true },
      { key: "period_end", label: "Period End", type: "date", required: true, showInTable: true },
      { key: "pay_date", label: "Pay Date", type: "date", required: true, showInTable: true },
      { key: "employee_count", label: "Employees", type: "number" },
      { key: "gross_total", label: "Gross Total", type: "currency", showInTable: true },
      { key: "net_total", label: "Net Total", type: "currency" },
      STATUS(["draft","approved","processing","paid","cancelled"], "draft"),
      NOTES,
    ],
  },
  "time-tracking": {
    defaultStatus: "submitted",
    fields: [
      { key: "entry_label", label: "Entry Label", type: "text", required: true, primary: true, showInTable: true },
      { key: "technician", label: "Technician", type: "text", required: true, showInTable: true, secondary: true },
      { key: "job", label: "Job / Project", type: "text", showInTable: true },
      { key: "date", label: "Date", type: "date", required: true, showInTable: true },
      { key: "clock_in", label: "Clock In", type: "text", placeholder: "08:00" },
      { key: "clock_out", label: "Clock Out", type: "text", placeholder: "17:00" },
      { key: "hours", label: "Total Hours", type: "number", required: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Regular","Overtime","Travel","Training","PTO"] },
      STATUS(["submitted","approved","rejected","paid"]),
      NOTES,
    ],
  },
  "commissions": {
    defaultStatus: "pending",
    fields: [
      { key: "commission_label", label: "Commission Label", type: "text", required: true, primary: true, showInTable: true },
      { key: "salesperson", label: "Salesperson / Tech", type: "text", required: true, showInTable: true, secondary: true },
      { key: "deal_reference", label: "Job / Estimate #", type: "text", showInTable: true },
      { key: "sale_amount", label: "Sale Amount", type: "currency", required: true },
      { key: "rate_pct", label: "Rate %", type: "number" },
      { key: "commission_amount", label: "Commission $", type: "currency", required: true, showInTable: true },
      { key: "earned_date", label: "Earned Date", type: "date", required: true },
      { key: "payout_date", label: "Payout Date", type: "date" },
      STATUS(["pending","approved","paid","disputed"]),
      NOTES,
    ],
  },
  "training": {
    defaultStatus: "active",
    fields: [
      { key: "course_name", label: "Course Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Safety","Technical","Soft Skills","Compliance","Certification"], required: true, showInTable: true, secondary: true },
      { key: "provider", label: "Provider", type: "text" },
      { key: "duration_hours", label: "Duration (hrs)", type: "number" },
      { key: "required_for", label: "Required For", type: "text", showInTable: true },
      { key: "certification", label: "Certification Earned", type: "text" },
      { key: "expires_after_months", label: "Expires After (months)", type: "number" },
      STATUS(["active","draft","retired"]),
      { key: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },

  // ---------------- COMMERCIAL ----------------
  "commercial": {
    defaultStatus: "active",
    fields: [
      { key: "account_name", label: "Account Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "industry", label: "Industry", type: "select", options: ["Retail","Office","Healthcare","Hospitality","Industrial","Education","Government","Other"], showInTable: true, secondary: true },
      { key: "primary_contact", label: "Primary Contact", type: "text", showInTable: true },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "annual_spend", label: "Annual Spend", type: "currency", showInTable: true },
      { key: "account_manager", label: "Account Manager", type: "text" },
      { key: "billing_address", label: "Billing Address", type: "textarea", span: 2 },
      STATUS(["active","prospect","on_hold","inactive"]),
    ],
  },
  "assets": {
    defaultStatus: "operational",
    fields: [
      { key: "asset_name", label: "Asset Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "asset_type", label: "Type", type: "select", options: ["RTU","Chiller","Boiler","Cooling Tower","Pump","AHU","VRF","Other"], required: true, showInTable: true, secondary: true },
      { key: "location", label: "Location", type: "text", showInTable: true },
      { key: "manufacturer", label: "Manufacturer", type: "text" },
      { key: "model", label: "Model", type: "text" },
      { key: "serial_number", label: "Serial #", type: "text" },
      { key: "install_date", label: "Install Date", type: "date" },
      { key: "warranty_expires", label: "Warranty Expires", type: "date" },
      { key: "last_service", label: "Last Service", type: "date", showInTable: true },
      STATUS(["operational","needs_service","down","retired"], "operational"),
      NOTES,
    ],
  },
  "locations": {
    defaultStatus: "active",
    fields: [
      { key: "location_name", label: "Location Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "account", label: "Parent Account", type: "text", showInTable: true, secondary: true },
      { key: "address", label: "Street Address", type: "text", required: true },
      { key: "city", label: "City", type: "text", showInTable: true },
      { key: "region", label: "State / Region", type: "text" },
      { key: "postal_code", label: "Postal Code", type: "text" },
      { key: "site_contact", label: "Site Contact", type: "text" },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "access_notes", label: "Access Notes", type: "textarea", span: 2 },
      STATUS(["active","inactive","under_construction"]),
    ],
  },
  "sla": {
    defaultStatus: "active",
    fields: [
      { key: "sla_name", label: "SLA Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "account", label: "Account", type: "text", required: true, showInTable: true, secondary: true },
      { key: "priority_level", label: "Priority Level", type: "select", options: ["Critical","High","Medium","Low"], required: true, showInTable: true },
      { key: "response_time_hours", label: "Response Time (hrs)", type: "number", required: true, showInTable: true },
      { key: "resolution_time_hours", label: "Resolution Time (hrs)", type: "number" },
      { key: "coverage_hours", label: "Coverage", type: "select", options: ["8x5","12x5","24x5","24x7"] },
      { key: "penalty_terms", label: "Penalty Terms", type: "text" },
      { key: "effective_date", label: "Effective Date", type: "date" },
      { key: "expires_on", label: "Expires On", type: "date" },
      STATUS(["active","draft","expired","breached"]),
      NOTES,
    ],
  },
  "preventive-maintenance": {
    defaultStatus: "scheduled",
    fields: [
      { key: "pm_name", label: "PM Plan Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "asset", label: "Asset", type: "text", showInTable: true, secondary: true },
      { key: "customer", label: "Customer", type: "text", showInTable: true },
      { key: "frequency", label: "Frequency", type: "select", options: ["Weekly","Monthly","Quarterly","Semi-Annual","Annual"], required: true, showInTable: true },
      { key: "next_due", label: "Next Due Date", type: "date", required: true, showInTable: true },
      { key: "assigned_tech", label: "Assigned Tech", type: "text" },
      { key: "estimated_hours", label: "Est. Hours", type: "number" },
      { key: "checklist_template", label: "Checklist Template", type: "text" },
      STATUS(["scheduled","overdue","complete","paused"]),
      NOTES,
    ],
  },

  // ---------------- CUSTOMER EXPERIENCE ----------------
  "customer-portal": {
    defaultStatus: "active",
    fields: [
      { key: "portal_user", label: "Portal User", type: "text", required: true, primary: true, showInTable: true },
      { key: "customer", label: "Customer Account", type: "text", required: true, showInTable: true, secondary: true },
      { key: "email", label: "Email", type: "email", required: true, showInTable: true },
      { key: "role", label: "Role", type: "select", options: ["Owner","Manager","Tenant","Viewer"], required: true, showInTable: true },
      { key: "last_login", label: "Last Login", type: "date" },
      { key: "invited_on", label: "Invited On", type: "date" },
      STATUS(["active","invited","disabled"]),
      NOTES,
    ],
  },
  "online-booking": {
    defaultStatus: "new",
    fields: [
      { key: "request_subject", label: "Request Subject", type: "text", required: true, primary: true, showInTable: true },
      { key: "service_type", label: "Service Type", type: "select", options: ["Repair","Maintenance","Estimate","Install","Inspection","Other"], required: true, showInTable: true, secondary: true },
      { key: "customer_name", label: "Customer Name", type: "text", required: true, showInTable: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "email", label: "Email", type: "email" },
      { key: "address", label: "Service Address", type: "text" },
      { key: "preferred_date", label: "Preferred Date", type: "date", required: true, showInTable: true },
      { key: "preferred_window", label: "Preferred Window", type: "select", options: ["Morning","Afternoon","Evening","Anytime"] },
      STATUS(["new","contacted","scheduled","completed","cancelled"], "new"),
      { key: "details", label: "Issue Details", type: "textarea", span: 2 },
    ],
  },
  "reviews": {
    defaultStatus: "published",
    fields: [
      { key: "reviewer_name", label: "Reviewer Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "rating", label: "Rating (1-5)", type: "number", required: true, showInTable: true, secondary: true },
      { key: "source", label: "Source", type: "select", options: ["Google","Yelp","Facebook","In-App","BBB","Other"], required: true, showInTable: true },
      { key: "job_reference", label: "Job / Tech Reference", type: "text", showInTable: true },
      { key: "review_date", label: "Date", type: "date", required: true },
      { key: "comment", label: "Review", type: "textarea", span: 2 },
      { key: "response", label: "Your Response", type: "textarea", span: 2 },
      STATUS(["published","pending","flagged","removed"]),
    ],
  },
  "notifications": {
    defaultStatus: "draft",
    fields: [
      { key: "title", label: "Notification Title", type: "text", required: true, primary: true, showInTable: true },
      { key: "channel", label: "Channel", type: "select", options: ["In-App","Email","SMS","Push"], required: true, showInTable: true, secondary: true },
      { key: "audience", label: "Audience", type: "select", options: ["All Customers","Members","Technicians","Office Staff","Admins","Custom"], required: true, showInTable: true },
      { key: "send_at", label: "Send At", type: "date" },
      { key: "link", label: "Link / CTA URL", type: "text" },
      STATUS(["draft","scheduled","sent","cancelled"], "draft"),
      { key: "body", label: "Message Body", type: "textarea", span: 2, required: true },
    ],
  },

  // ---------------- ANALYTICS ----------------
  "executive-dashboard": {
    defaultStatus: "active",
    fields: [
      { key: "view_name", label: "View Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "audience", label: "Audience", type: "select", options: ["CEO","CFO","COO","Sales","Operations","All Execs"], required: true, showInTable: true, secondary: true },
      { key: "kpi_focus", label: "KPI Focus", type: "select", options: ["Revenue","Margin","Cash Flow","Pipeline","Service Metrics","Mixed"] },
      { key: "refresh_cadence", label: "Refresh Cadence", type: "select", options: ["Live","Hourly","Daily","Weekly"] },
      { key: "owner", label: "Owner", type: "text", showInTable: true },
      STATUS(["active","draft","archived"]),
      { key: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },
  "forecasting": {
    defaultStatus: "draft",
    fields: [
      { key: "forecast_name", label: "Forecast Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Revenue","Demand","Inventory","Labor","Cash Flow"], required: true, showInTable: true, secondary: true },
      { key: "period", label: "Period", type: "select", options: ["Weekly","Monthly","Quarterly","Annual"], required: true, showInTable: true },
      { key: "horizon_months", label: "Horizon (months)", type: "number" },
      { key: "model_type", label: "Model", type: "select", options: ["AI / ML","Trend","Seasonal","Manual"] },
      { key: "projected_value", label: "Projected Value", type: "currency", showInTable: true },
      { key: "as_of", label: "As Of", type: "date" },
      STATUS(["draft","published","archived"]),
      NOTES,
    ],
  },
  "business-intelligence": {
    defaultStatus: "active",
    fields: [
      { key: "report_name", label: "Report / Dashboard Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "data_source", label: "Data Source", type: "select", options: ["Jobs","Sales","Inventory","Finance","Customers","Cross-Module"], required: true, showInTable: true, secondary: true },
      { key: "visualization", label: "Visualization", type: "select", options: ["Table","Bar","Line","Pie","KPI","Map","Mixed"] },
      { key: "owner", label: "Owner", type: "text", showInTable: true },
      { key: "shared_with", label: "Shared With", type: "text" },
      { key: "last_refreshed", label: "Last Refreshed", type: "date" },
      STATUS(["active","draft","archived"]),
      { key: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },

  // ---------------- SYSTEM ----------------
  "ai-brain": {
    defaultStatus: "open",
    fields: [
      { key: "insight_title", label: "Insight Title", type: "text", required: true, primary: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Revenue","Dispatch","Inventory","Maintenance","Customer","Risk","Other"], required: true, showInTable: true, secondary: true },
      { key: "severity", label: "Severity", type: "select", options: ["Info","Low","Medium","High","Critical"], required: true, showInTable: true },
      { key: "confidence_pct", label: "Confidence %", type: "number" },
      { key: "recommended_action", label: "Recommended Action", type: "textarea", span: 2 },
      { key: "linked_entity", label: "Linked Record", type: "text" },
      { key: "detected_on", label: "Detected On", type: "date" },
      STATUS(["open","acknowledged","actioned","dismissed"], "open"),
    ],
  },
  "integrations": {
    defaultStatus: "connected",
    fields: [
      { key: "integration_name", label: "Integration Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "category", label: "Category", type: "select", options: ["Accounting","Payments","Calendar","Communications","Marketing","CRM","Storage","Other"], required: true, showInTable: true, secondary: true },
      { key: "provider", label: "Provider", type: "text", showInTable: true },
      { key: "environment", label: "Environment", type: "select", options: ["Production","Sandbox","Staging"] },
      { key: "connected_account", label: "Connected Account", type: "text" },
      { key: "connected_on", label: "Connected On", type: "date" },
      STATUS(["connected","disconnected","error","pending"]),
      NOTES,
    ],
  },
  "api-access": {
    defaultStatus: "active",
    fields: [
      { key: "key_name", label: "Key Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "key_type", label: "Type", type: "select", options: ["Personal","Service","Webhook","OAuth"], required: true, showInTable: true, secondary: true },
      { key: "scopes", label: "Scopes / Permissions", type: "text", placeholder: "read:jobs, write:invoices" },
      { key: "owner", label: "Owner", type: "text", showInTable: true },
      { key: "rate_limit_per_min", label: "Rate Limit (req/min)", type: "number" },
      { key: "last_used", label: "Last Used", type: "date" },
      { key: "expires_on", label: "Expires On", type: "date" },
      STATUS(["active","revoked","expired"]),
      NOTES,
    ],
  },
  "automation": {
    defaultStatus: "active",
    fields: [
      { key: "workflow_name", label: "Workflow Name", type: "text", required: true, primary: true, showInTable: true },
      { key: "trigger", label: "Trigger", type: "select", options: ["Job Created","Job Completed","Invoice Paid","Estimate Sent","Customer Added","Schedule","Webhook","Manual"], required: true, showInTable: true, secondary: true },
      { key: "action_count", label: "# Actions", type: "number", showInTable: true },
      { key: "owner", label: "Owner", type: "text", showInTable: true },
      { key: "last_run", label: "Last Run", type: "date" },
      { key: "success_rate_pct", label: "Success Rate %", type: "number" },
      STATUS(["active","paused","draft","error"]),
      { key: "description", label: "Description", type: "textarea", span: 2 },
    ],
  },
};

export const DEFAULT_SCHEMA: ModuleSchema = {
  defaultStatus: "active",
  fields: [
    { key: "title", label: "Title", type: "text", required: true, primary: true, showInTable: true },
    { key: "subtitle", label: "Subtitle", type: "text", secondary: true, showInTable: true },
    STATUS(["active","draft","in_progress","complete","archived"]),
    NOTES,
  ],
};

export function getModuleSchema(moduleKey: string): ModuleSchema {
  return MODULE_SCHEMAS[moduleKey] ?? DEFAULT_SCHEMA;
}
