import { useEffect, useState } from "react";
import type { PriceItem } from "@/components/price-book";

export type PriceBookKind = "sales" | "services";

const STORAGE_KEY = (k: PriceBookKind) => `servex.price-book.${k}.v1`;

export const SALES_CATEGORIES = [
  "Air Conditioners",
  "Heat Pumps",
  "Furnaces",
  "Mini Splits",
  "Indoor Air Quality",
  "Thermostats",
  "Install Packages",
];

export const SERVICES_CATEGORIES = [
  "Diagnostics",
  "Repairs",
  "Maintenance",
  "Tune-Ups",
  "Refrigerant",
  "Duct & Air Flow",
  "Emergency",
];

export const SEED_SALES: PriceItem[] = [
  { id: "SAL-AC-2T-G", code: "SAL-AC-2T-G", name: "2-Ton 14 SEER2 AC — Good", category: "Air Conditioners", description: "Builder-grade single-stage condenser with standard install.", cost: 2400, price: 4995, unit: "system", active: true },
  { id: "SAL-AC-3T-B", code: "SAL-AC-3T-B", name: "3-Ton 16 SEER2 AC — Better", category: "Air Conditioners", description: "Two-stage condenser, smart Wi-Fi thermostat included.", cost: 3100, price: 6995, unit: "system", active: true },
  { id: "SAL-AC-4T-P", code: "SAL-AC-4T-P", name: "4-Ton 20 SEER2 AC — Premium", category: "Air Conditioners", description: "Variable-speed inverter system, 12-yr parts warranty.", cost: 4800, price: 10495, unit: "system", active: true },
  { id: "SAL-HP-3T", code: "SAL-HP-3T", name: "3-Ton Heat Pump 17 SEER2", category: "Heat Pumps", description: "Dual-fuel ready, includes outdoor unit and air handler.", cost: 4200, price: 8495, unit: "system", active: true },
  { id: "SAL-FUR-80", code: "SAL-FUR-80", name: "80% AFUE Gas Furnace 80k BTU", category: "Furnaces", description: "Single-stage upflow furnace, std install.", cost: 1450, price: 3495, unit: "unit", active: true },
  { id: "SAL-FUR-96", code: "SAL-FUR-96", name: "96% AFUE Modulating Furnace", category: "Furnaces", description: "Modulating, variable-speed blower, premium efficiency.", cost: 2400, price: 5995, unit: "unit", active: true },
  { id: "SAL-MS-1Z", code: "SAL-MS-1Z", name: "Single-Zone Mini Split 12k BTU", category: "Mini Splits", description: "Wall-mount inverter, includes line set up to 25 ft.", cost: 1100, price: 3295, unit: "system", active: true },
  { id: "SAL-MS-3Z", code: "SAL-MS-3Z", name: "Tri-Zone Mini Split 27k BTU", category: "Mini Splits", description: "Three indoor heads, premium inverter compressor.", cost: 3200, price: 7995, unit: "system", active: true },
  { id: "SAL-IAQ-UV", code: "SAL-IAQ-UV", name: "UV-C Air Purifier (Whole Home)", category: "Indoor Air Quality", description: "In-duct UV-C lamp with replacement program.", cost: 320, price: 895, unit: "unit", active: true },
  { id: "SAL-IAQ-MERV", code: "SAL-IAQ-MERV", name: "MERV-16 Media Filter Cabinet", category: "Indoor Air Quality", description: "Includes initial filter and cabinet install.", cost: 240, price: 695, unit: "unit", active: true },
  { id: "SAL-TS-SMART", code: "SAL-TS-SMART", name: "Smart Wi-Fi Thermostat", category: "Thermostats", description: "Pro install, learning schedule, geofencing.", cost: 95, price: 349, unit: "each", active: true },
  { id: "SAL-PKG-COMPLETE", code: "SAL-PKG-COMPLETE", name: "Complete Comfort System (AC + Furnace)", category: "Install Packages", description: "Matched system, smart thermostat, 10-yr parts + 2-yr labor.", cost: 5400, price: 11995, unit: "system", active: true },
];

export const SEED_SERVICES: PriceItem[] = [
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

const seedFor = (k: PriceBookKind) => (k === "sales" ? SEED_SALES : SEED_SERVICES);

function read(kind: PriceBookKind): PriceItem[] {
  if (typeof window === "undefined") return seedFor(kind);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(kind));
    if (raw === null) {
      // First ever load — seed once, then persist so future empties stick.
      const seeded = seedFor(kind);
      window.localStorage.setItem(STORAGE_KEY(kind), JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as PriceItem[];
    return Array.isArray(parsed) ? parsed : seedFor(kind);
  } catch {
    return seedFor(kind);
  }
}

function write(kind: PriceBookKind, items: PriceItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY(kind), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("price-book-change", { detail: { kind } }));
}

export function loadPriceBook(kind: PriceBookKind): PriceItem[] {
  return read(kind);
}

export function loadAllPriceBook(): { kind: PriceBookKind; item: PriceItem }[] {
  return [
    ...read("sales").map((item) => ({ kind: "sales" as const, item })),
    ...read("services").map((item) => ({ kind: "services" as const, item })),
  ];
}

export function usePriceBook(kind: PriceBookKind) {
  const [items, setItemsState] = useState<PriceItem[]>(() => read(kind));
  useEffect(() => {
    const onChange = (e: Event) => {
      const ev = e as CustomEvent<{ kind: PriceBookKind }>;
      if (ev.detail?.kind === kind) setItemsState(read(kind));
    };
    window.addEventListener("price-book-change", onChange as EventListener);
    window.addEventListener("storage", () => setItemsState(read(kind)));
    return () => window.removeEventListener("price-book-change", onChange as EventListener);
  }, [kind]);
  const setItems = (next: PriceItem[]) => {
    setItemsState(next);
    write(kind, next);
  };
  return [items, setItems] as const;
}

export function useAllPriceBook() {
  const [sales] = usePriceBook("sales");
  const [services] = usePriceBook("services");
  return [
    ...sales.map((item) => ({ kind: "sales" as const, item })),
    ...services.map((item) => ({ kind: "services" as const, item })),
  ];
}