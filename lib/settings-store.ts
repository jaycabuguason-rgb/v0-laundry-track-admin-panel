"use client";

// ─── Shared types ────────────────────────────────────────────────────────────

export type PricingType = "per-kg" | "per-load" | "flat-rate";

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: string;        // price per unit (kg or load)
  pricingType: PricingType;
  active: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  rate: string;         // flat ₱ added per transaction
}

export interface PricingConfig {
  pricePerKg: string;
  minWeight: string;
}

// ─── localStorage keys ───────────────────────────────────────────────────────

export const LS_SERVICE_TYPES  = "laundrytrack_service_types";
export const LS_ADDONS         = "laundrytrack_addons";
export const LS_PRICING_CONFIG = "laundrytrack_pricing_config";

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_SERVICE_TYPES: ServiceType[] = [
  { id: "1", name: "Regular",           description: "Standard wash & dry",               price: "30",  pricingType: "per-kg",   active: true  },
  { id: "2", name: "Delicate",          description: "Gentle cycle for delicate fabrics",  price: "40",  pricingType: "per-kg",   active: true  },
  { id: "3", name: "Express",           description: "Same-day turnaround",                price: "50",  pricingType: "per-kg",   active: true  },
  { id: "4", name: "Bulk / Commercial", description: "For 10kg and above",                 price: "250", pricingType: "per-load", active: false },
];

export const DEFAULT_ADDONS: AddOn[] = [
  { id: "1", name: "Fabcon",         rate: "10" },
  { id: "2", name: "Express (+50%)", rate: "50" },
  { id: "3", name: "Bleach",         rate: "15" },
  { id: "4", name: "Starch",         rate: "20" },
];

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  pricePerKg: "30",
  minWeight:  "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function persist<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ─── Public read helpers (non-hook, for use inside wizard on mount) ──────────

export function loadServiceTypes(): ServiceType[] {
  return load(LS_SERVICE_TYPES, DEFAULT_SERVICE_TYPES);
}

export function persistServiceTypes(list: ServiceType[]): void {
  persist(LS_SERVICE_TYPES, list);
}

export function loadAddOns(): AddOn[] {
  return load(LS_ADDONS, DEFAULT_ADDONS);
}

export function persistAddOns(list: AddOn[]): void {
  persist(LS_ADDONS, list);
}

export function loadPricingConfig(): PricingConfig {
  return load(LS_PRICING_CONFIG, DEFAULT_PRICING_CONFIG);
}

export function persistPricingConfig(cfg: PricingConfig): void {
  persist(LS_PRICING_CONFIG, cfg);
}
