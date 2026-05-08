import { createFileRoute } from "@tanstack/react-router";
import { PriceBook, type PriceItem } from "@/components/price-book";

export const Route = createFileRoute("/sales-catalog")({ component: SalesCatalog });

const CATEGORIES = [
  "Air Conditioners",
  "Heat Pumps",
  "Furnaces",
  "Mini Splits",
  "Indoor Air Quality",
  "Thermostats",
  "Install Packages",
];

const ITEMS: PriceItem[] = [
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

function SalesCatalog() {
  return (
    <PriceBook
      title="Sales Price Book"
    description="Equipment, install packages, and accessories sold to customers."
      kind="sales"
      categories={CATEGORIES}
      initialItems={ITEMS}
    />
  );
}