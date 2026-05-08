import { createFileRoute } from "@tanstack/react-router";
import { PriceBook, type PriceItem } from "@/components/price-book";

export const Route = createFileRoute("/services-catalog")({ component: ServicesCatalog });

const CATEGORIES = [
  "Diagnostics",
  "Repairs",
  "Maintenance",
  "Tune-Ups",
  "Refrigerant",
  "Duct & Air Flow",
  "Emergency",
];

const ITEMS: PriceItem[] = [
  { id: "SVC-DIAG-STD", code: "SVC-DIAG-STD", name: "Standard Diagnostic Visit", category: "Diagnostics", description: "Up to 60 minutes onsite to identify the issue.", cost: 35, price: 129, unit: "visit", active: true },
  { id: "SVC-DIAG-AH", code: "SVC-DIAG-AH", name: "After-Hours Diagnostic Visit", category: "Emergency", description: "Evenings, weekends, holidays.", cost: 65, price: 249, unit: "visit", active: true },
  { id: "SVC-CAP-REPL", code: "SVC-CAP-REPL", name: "Capacitor Replacement", category: "Repairs", description: "Includes capacitor and labor.", cost: 28, price: 189, unit: "repair", active: true },
  { id: "SVC-CONT-REPL", code: "SVC-CONT-REPL", name: "Contactor Replacement", category: "Repairs", description: "Single-pole or two-pole contactor swap.", cost: 22, price: 219, unit: "repair", active: true },
  { id: "SVC-BLR-MOTOR", code: "SVC-BLR-MOTOR", name: "Blower Motor Replacement", category: "Repairs", description: "ECM or PSC blower motor with labor.", cost: 280, price: 749, unit: "repair", active: true },
  { id: "SVC-COND-CLEAN", code: "SVC-COND-CLEAN", name: "Condenser Coil Deep Clean", category: "Maintenance", description: "Chemical clean and rinse of outdoor coil.", cost: 35, price: 199, unit: "service", active: true },
  { id: "SVC-DRAIN-CLR", code: "SVC-DRAIN-CLR", name: "Condensate Drain Clearing", category: "Maintenance", description: "Clear blocked drain line, treat with tablets.", cost: 18, price: 149, unit: "service", active: true },
  { id: "SVC-TUNE-AC", code: "SVC-TUNE-AC", name: "AC Precision Tune-Up", category: "Tune-Ups", description: "21-point inspection and performance tune.", cost: 25, price: 119, unit: "tune-up", active: true },
  { id: "SVC-TUNE-FUR", code: "SVC-TUNE-FUR", name: "Furnace Tune-Up & Safety Check", category: "Tune-Ups", description: "Combustion analysis, flame inspection, safety test.", cost: 25, price: 119, unit: "tune-up", active: true },
  { id: "SVC-MAINT-PLAN", code: "SVC-MAINT-PLAN", name: "Comfort Club Maintenance Plan", category: "Maintenance", description: "2 visits/yr + priority service + 15% off repairs.", cost: 60, price: 219, unit: "year", active: true },
  { id: "SVC-R410A-LB", code: "SVC-R410A-LB", name: "R-410A Refrigerant (per lb)", category: "Refrigerant", description: "Per pound charged after leak verification.", cost: 18, price: 95, unit: "lb", active: true },
  { id: "SVC-LEAK-SEARCH", code: "SVC-LEAK-SEARCH", name: "Refrigerant Leak Search", category: "Refrigerant", description: "Electronic leak detection up to 90 minutes.", cost: 30, price: 249, unit: "service", active: true },
  { id: "SVC-DUCT-INSP", code: "SVC-DUCT-INSP", name: "Duct Inspection & Static Test", category: "Duct & Air Flow", description: "Total external static, supply/return assessment.", cost: 20, price: 149, unit: "service", active: true },
  { id: "SVC-DUCT-SEAL", code: "SVC-DUCT-SEAL", name: "Duct Sealing (per system)", category: "Duct & Air Flow", description: "Mastic-seal accessible joints in attic or crawl.", cost: 220, price: 695, unit: "system", active: true },
  { id: "SVC-EMG-NOHEAT", code: "SVC-EMG-NOHEAT", name: "Emergency No-Heat Service", category: "Emergency", description: "Same-day priority dispatch, includes diagnostic.", cost: 70, price: 299, unit: "visit", active: true },
];

function ServicesCatalog() {
  return (
    <PriceBook
      title="Services Price Book"
      description="Standard service pricing for repairs, maintenance, and tune-ups."
      kind="services"
      categories={CATEGORIES}
      initialItems={ITEMS}
    />
  );
}