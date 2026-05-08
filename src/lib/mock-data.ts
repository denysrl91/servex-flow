export const stats = {
  revenue: 184320,
  jobsToday: 23,
  activeTechs: 12,
  openTickets: 7,
  pendingEstimates: 14,
  unpaidInvoices: 32450,
};

export const customers = [
  { id: "C-1001", name: "Sunrise Apartments", type: "Commercial", contact: "Maria Lopez", phone: "(415) 555-0142", email: "maria@sunrise.com", properties: 4, lifetimeValue: 28400, status: "Active" },
  { id: "C-1002", name: "John Mitchell", type: "Residential", contact: "John Mitchell", phone: "(415) 555-0177", email: "john.m@email.com", properties: 1, lifetimeValue: 4250, status: "Active" },
  { id: "C-1003", name: "Bayview Office Park", type: "Commercial", contact: "Derek Chen", phone: "(415) 555-0193", email: "derek@bayview.com", properties: 6, lifetimeValue: 92100, status: "Active" },
  { id: "C-1004", name: "Sarah Patel", type: "Residential", contact: "Sarah Patel", phone: "(415) 555-0211", email: "sarah.p@email.com", properties: 1, lifetimeValue: 1820, status: "Lead" },
  { id: "C-1005", name: "Greenfield Schools", type: "Commercial", contact: "Roberto Silva", phone: "(415) 555-0234", email: "rsilva@gfs.edu", properties: 12, lifetimeValue: 145800, status: "Active" },
  { id: "C-1006", name: "Marcus Lee", type: "Residential", contact: "Marcus Lee", phone: "(415) 555-0288", email: "mlee@email.com", properties: 2, lifetimeValue: 6700, status: "Active" },
];

export const properties = [
  { id: "P-2001", customer: "Sunrise Apartments", address: "1420 Mission St, San Francisco, CA", type: "Multi-family", units: 24, equipment: 6 },
  { id: "P-2002", customer: "John Mitchell", address: "88 Maple Ln, Oakland, CA", type: "Single-family", units: 1, equipment: 2 },
  { id: "P-2003", customer: "Bayview Office Park", address: "500 Embarcadero, San Francisco, CA", type: "Office", units: 1, equipment: 14 },
  { id: "P-2004", customer: "Greenfield Schools", address: "200 Oak Ave, Berkeley, CA", type: "Education", units: 1, equipment: 22 },
  { id: "P-2005", customer: "Marcus Lee", address: "12 Pine Ct, San Mateo, CA", type: "Single-family", units: 1, equipment: 3 },
];

export const equipment = [
  { id: "E-3001", property: "1420 Mission St", type: "Rooftop Unit", brand: "Carrier", model: "48TC-A08", serial: "CA8821", installed: "2019-04-12", lastService: "2026-03-08", status: "Operational" },
  { id: "E-3002", property: "88 Maple Ln", type: "Split System", brand: "Trane", model: "XR16", serial: "TR4421", installed: "2021-07-20", lastService: "2026-02-19", status: "Operational" },
  { id: "E-3003", property: "500 Embarcadero", type: "Chiller", brand: "York", model: "YK-1200", serial: "YK0098", installed: "2018-01-30", lastService: "2026-04-22", status: "Needs Service" },
  { id: "E-3004", property: "200 Oak Ave", type: "Boiler", brand: "Lochinvar", model: "KBN-285", serial: "LB7765", installed: "2020-09-15", lastService: "2026-01-04", status: "Operational" },
  { id: "E-3005", property: "12 Pine Ct", type: "Heat Pump", brand: "Mitsubishi", model: "MUZ-FH18", serial: "MT2210", installed: "2022-11-02", lastService: "2026-03-30", status: "Operational" },
];

export const jobs = [
  { id: "J-5001", customer: "Sunrise Apartments", title: "AC unit not cooling - Unit 4B", tech: "Alex Rivera", scheduled: "2026-05-08 09:00", status: "In Progress", priority: "High", value: 480 },
  { id: "J-5002", customer: "Bayview Office Park", title: "Quarterly chiller maintenance", tech: "Jamie Wu", scheduled: "2026-05-08 10:30", status: "Scheduled", priority: "Medium", value: 1850 },
  { id: "J-5003", customer: "John Mitchell", title: "Furnace tune-up", tech: "Carlos Mendez", scheduled: "2026-05-08 13:00", status: "Scheduled", priority: "Low", value: 220 },
  { id: "J-5004", customer: "Greenfield Schools", title: "Boiler emergency repair", tech: "Alex Rivera", scheduled: "2026-05-08 14:30", status: "Dispatched", priority: "Urgent", value: 2400 },
  { id: "J-5005", customer: "Marcus Lee", title: "Heat pump diagnostic", tech: "Sam Patel", scheduled: "2026-05-08 16:00", status: "Scheduled", priority: "Medium", value: 320 },
  { id: "J-5006", customer: "Sarah Patel", title: "New install consultation", tech: "Jamie Wu", scheduled: "2026-05-09 09:00", status: "Scheduled", priority: "Low", value: 0 },
];

export const estimates = [
  { id: "EST-7001", customer: "Sarah Patel", title: "Full HVAC replacement", amount: 12450, status: "Sent", created: "2026-05-02", expires: "2026-06-01" },
  { id: "EST-7002", customer: "Bayview Office Park", title: "Add VRF zone - 3rd floor", amount: 28900, status: "Approved", created: "2026-04-28", expires: "2026-05-28" },
  { id: "EST-7003", customer: "Marcus Lee", title: "Smart thermostat package", amount: 890, status: "Draft", created: "2026-05-07", expires: "2026-06-06" },
  { id: "EST-7004", customer: "John Mitchell", title: "Duct cleaning + sealing", amount: 1640, status: "Rejected", created: "2026-04-15", expires: "2026-05-15" },
];

export const invoices = [
  { id: "INV-9001", customer: "Sunrise Apartments", amount: 480, due: "2026-05-22", status: "Sent", issued: "2026-05-08" },
  { id: "INV-9002", customer: "Bayview Office Park", amount: 1850, due: "2026-05-25", status: "Paid", issued: "2026-05-04" },
  { id: "INV-9003", customer: "Greenfield Schools", amount: 2400, due: "2026-05-15", status: "Overdue", issued: "2026-04-10" },
  { id: "INV-9004", customer: "Marcus Lee", amount: 320, due: "2026-05-20", status: "Sent", issued: "2026-05-06" },
  { id: "INV-9005", customer: "John Mitchell", amount: 220, due: "2026-05-30", status: "Draft", issued: "2026-05-08" },
];

export const inventory = [
  { id: "SKU-001", name: "R-410A Refrigerant (25 lb)", category: "Refrigerant", onHand: 12, reorder: 6, cost: 185, location: "Truck 1 / Warehouse" },
  { id: "SKU-002", name: "Capacitor 45/5 MFD 440V", category: "Electrical", onHand: 48, reorder: 20, cost: 9.5, location: "Warehouse A2" },
  { id: "SKU-003", name: "16x25x1 MERV 11 Filter", category: "Filters", onHand: 4, reorder: 24, cost: 12, location: "Warehouse B1" },
  { id: "SKU-004", name: "Honeywell T6 Pro Thermostat", category: "Controls", onHand: 14, reorder: 8, cost: 78, location: "Warehouse A1" },
  { id: "SKU-005", name: "Copper Line Set 3/8 x 7/8", category: "Materials", onHand: 22, reorder: 10, cost: 142, location: "Warehouse B2" },
];

export const purchaseOrders = [
  { id: "PO-4001", vendor: "Ferguson HVAC", items: 8, total: 3420, status: "Received", created: "2026-04-25" },
  { id: "PO-4002", vendor: "Johnstone Supply", items: 3, total: 945, status: "Sent", created: "2026-05-03" },
  { id: "PO-4003", vendor: "Carrier Distribution", items: 1, total: 8200, status: "Pending Approval", created: "2026-05-07" },
  { id: "PO-4004", vendor: "Grainger", items: 12, total: 1280, status: "Received", created: "2026-04-19" },
];

export const technicians = [
  { id: "T-101", name: "Alex Rivera", role: "Senior Tech", phone: "(415) 555-0301", jobsToday: 4, utilization: 92, status: "On Job", skills: ["Refrigeration", "Commercial"] },
  { id: "T-102", name: "Jamie Wu", role: "Service Tech", phone: "(415) 555-0302", jobsToday: 3, utilization: 78, status: "Available", skills: ["Residential", "Install"] },
  { id: "T-103", name: "Carlos Mendez", role: "Service Tech", phone: "(415) 555-0303", jobsToday: 2, utilization: 65, status: "Driving", skills: ["Residential", "Diagnostics"] },
  { id: "T-104", name: "Sam Patel", role: "Apprentice", phone: "(415) 555-0304", jobsToday: 2, utilization: 55, status: "Available", skills: ["Residential"] },
  { id: "T-105", name: "Priya Shah", role: "Lead Installer", phone: "(415) 555-0305", jobsToday: 1, utilization: 88, status: "On Job", skills: ["Install", "Ductwork"] },
];

export const pipeline = [
  { stage: "New Lead", deals: [{ id: "D-1", name: "Sarah Patel - HVAC replacement", value: 12450 }, { id: "D-2", name: "Westside Cafe - RTU install", value: 18200 }] },
  { stage: "Qualified", deals: [{ id: "D-3", name: "Bayview - VRF expansion", value: 28900 }] },
  { stage: "Proposal", deals: [{ id: "D-4", name: "Marcus Lee - Smart controls", value: 890 }, { id: "D-5", name: "Lakeside HOA - Maintenance plan", value: 14400 }] },
  { stage: "Negotiation", deals: [{ id: "D-6", name: "Greenfield Schools - Annual contract", value: 86000 }] },
  { stage: "Won", deals: [{ id: "D-7", name: "Sunrise Apartments - Service plan", value: 9600 }] },
];

export const tickets = [
  { id: "TK-8001", customer: "Sunrise Apartments", subject: "AC making loud noise in lobby", priority: "High", status: "Open", assigned: "Alex Rivera", created: "2026-05-08 08:14" },
  { id: "TK-8002", customer: "Marcus Lee", subject: "Thermostat unresponsive", priority: "Medium", status: "In Progress", assigned: "Sam Patel", created: "2026-05-07 16:42" },
  { id: "TK-8003", customer: "Greenfield Schools", subject: "Cafeteria too warm", priority: "High", status: "Open", assigned: "Jamie Wu", created: "2026-05-08 07:55" },
  { id: "TK-8004", customer: "John Mitchell", subject: "Filter replacement question", priority: "Low", status: "Resolved", assigned: "Carlos Mendez", created: "2026-05-06 11:30" },
];

export const revenueByMonth = [
  { month: "Nov", revenue: 142000 },
  { month: "Dec", revenue: 158000 },
  { month: "Jan", revenue: 134000 },
  { month: "Feb", revenue: 168000 },
  { month: "Mar", revenue: 195000 },
  { month: "Apr", revenue: 184320 },
];

export const scheduleSlots = [
  { time: "08:00", jobs: [{ tech: "Alex Rivera", job: "Sunrise - AC repair", duration: 2 }] },
  { time: "09:00", jobs: [{ tech: "Jamie Wu", job: "Bayview - Chiller maint.", duration: 3 }] },
  { time: "10:00", jobs: [] },
  { time: "11:00", jobs: [{ tech: "Sam Patel", job: "Marcus Lee - Diagnostic", duration: 1 }] },
  { time: "13:00", jobs: [{ tech: "Carlos Mendez", job: "Mitchell - Tune-up", duration: 2 }] },
  { time: "14:30", jobs: [{ tech: "Alex Rivera", job: "Greenfield - Boiler repair", duration: 3 }] },
  { time: "16:00", jobs: [{ tech: "Priya Shah", job: "New install survey", duration: 2 }] },
];