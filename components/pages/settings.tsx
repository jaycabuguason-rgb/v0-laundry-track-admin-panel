"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Edit, Save, Upload, Clock, Download, Loader2, CheckCircle2, Scale, ShoppingBasket, Package, X, Eye, EyeOff, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Page } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import {
  transactions,
  loyaltyMembers,
  auditLogs,
  serviceRevenueData,
  weeklyRevenueData,
} from "@/lib/data";
import {
  type ServiceType,
  type AddOn,
  type PricingType,
  type PricingMode,
  type PriceDisplayMode,
  type LoadTier,
  type BusinessProfile,
  DEFAULT_SERVICE_TYPES,
  DEFAULT_ADDONS,
  DEFAULT_LOAD_TIERS,
  loadServiceTypes,
  persistServiceTypes,
  loadAddOns,
  persistAddOns,
  loadPricingConfig,
  persistPricingConfig,
  loadBusinessProfile,
  persistBusinessProfile,
  loadLoyaltySettings,
  persistLoyaltySettings,
} from "@/lib/settings-store";

// ─── Pricing ────────────────────────────────────────────────────────────────

function PricingSettings() {
  // Base pricing — initialised from shared store
  const [pricingMode, setPricingMode]   = useState<PricingMode>(() => loadPricingConfig().pricingMode);
  const [pricePerKg, setPricePerKg]     = useState(() => loadPricingConfig().pricePerKg);
  const [minWeight, setMinWeight]       = useState(() => loadPricingConfig().minWeight);

  // Load tiers — initialised from shared store
  const [loadTiers, setLoadTiers] = useState<LoadTier[]>(() => loadPricingConfig().loadTiers);
  const [showAddTier, setShowAddTier]   = useState(false);
  const [newTierName, setNewTierName]   = useState("");
  const [newTierRange, setNewTierRange] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");

  // Add-ons — initialised from shared store
  const [addOns, setAddOns] = useState<AddOn[]>(() => loadAddOns());
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");

  // Price display mode — initialised from shared store
  const [priceDisplayMode, setPriceDisplayMode] = useState<PriceDisplayMode>(
    () => loadPricingConfig().priceDisplayMode ?? "show"
  );

  // Save state
  const [saved, setSaved] = useState(false);

  const addAddon = () => {
    if (!newName || !newRate) return;
    const next: AddOn[] = [...addOns, { id: Date.now().toString(), name: newName, rate: newRate }];
    setAddOns(next);
    persistAddOns(next);
    setNewName(""); setNewRate("");
  };

  const addTier = () => {
    if (!newTierName || !newTierPrice) return;
    setLoadTiers((prev) => [...prev, { id: Date.now().toString(), name: newTierName, range: newTierRange, price: newTierPrice }]);
    setNewTierName(""); setNewTierRange(""); setNewTierPrice("");
    setShowAddTier(false);
  };

  const showKg   = pricingMode === "per-kg"   || pricingMode === "both";
  const showLoad = pricingMode === "per-load" || pricingMode === "both";

  const MODES: { value: PricingMode; icon: React.ReactNode; label: string; sub: string }[] = [
    { value: "per-kg",   icon: <Scale className="w-4 h-4" />,          label: "Per Kilogram", sub: "Charge by weight"     },
    { value: "per-load", icon: <ShoppingBasket className="w-4 h-4" />, label: "Per Load",     sub: "Flat rate per load"   },
    { value: "both",     icon: <Package className="w-4 h-4" />,        label: "Both",         sub: "Staff selects at time of transaction" },
  ];

  return (
    <div className="relative flex flex-col min-h-full">
    <div className="space-y-5 w-full max-w-xl pb-24">

      {/* ── Base Pricing ─────────────────────────────────────────────────── */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Base Pricing</CardTitle>
          <CardDescription className="text-xs">Configure how laundry is charged to customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Pricing Mode toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(({ value, icon, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setPricingMode(value)}
                  className={[
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all cursor-pointer",
                    pricingMode === value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/20",
                  ].join(" ")}
                >
                  <div className={[
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    pricingMode === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  ].join(" ")}>
                    {icon}
                  </div>
                  <p className={["text-xs font-semibold leading-tight", pricingMode === value ? "text-primary" : "text-foreground"].join(" ")}>
                    {label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Per Kilogram fields */}
          {showKg && (
            <div className="space-y-3 pt-1">
              {pricingMode === "both" && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Per Kilogram</p>
              )}
              <div className="flex items-center gap-3">
                <Label className="text-sm w-36 shrink-0">Price per kg (₱)</Label>
                <Input
                  type="number"
                  min="0"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-28 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-sm w-36 shrink-0">Minimum weight (kg)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 3 kg minimum"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="w-28 h-9 text-sm"
                />
              </div>
            </div>
          )}

          {/* Per Load tier table */}
          {showLoad && (
            <div className="space-y-3 pt-1">
              {pricingMode === "both" && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Per Load Tiers</p>
              )}
              {pricingMode === "per-load" && (
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Load Pricing Tiers</Label>
              )}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Load Size</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Weight Range</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Price (₱)</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {loadTiers.map((tier) => (
                      <tr key={tier.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-2 text-sm font-medium text-foreground">{tier.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{tier.range}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">₱</span>
                            <Input
                              type="number"
                              min="0"
                              value={tier.price}
                              onChange={(e) =>
                                setLoadTiers((prev) =>
                                  prev.map((t) => t.id === tier.id ? { ...t, price: e.target.value } : t)
                                )
                              }
                              className="w-20 h-7 text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => setLoadTiers((prev) => prev.filter((t) => t.id !== tier.id))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add custom tier */}
              {showAddTier ? (
                <div className="bg-muted/30 rounded-lg border border-border p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">New Custom Tier</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">Tier Name</Label>
                      <Input placeholder="e.g. Extra Large" value={newTierName} onChange={(e) => setNewTierName(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">Weight Range</Label>
                      <Input placeholder="e.g. 10kg – 15kg" value={newTierRange} onChange={(e) => setNewTierRange(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">Price (₱)</Label>
                      <Input type="number" placeholder="e.g. 300" value={newTierPrice} onChange={(e) => setNewTierPrice(e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={addTier} disabled={!newTierName || !newTierPrice}>
                      Save Tier
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setShowAddTier(false); setNewTierName(""); setNewTierRange(""); setNewTierPrice(""); }}>
                      <X className="w-3 h-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setShowAddTier(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Custom Tier
                </Button>
              )}
            </div>
          )}

          {/* Both mode note */}
          {pricingMode === "both" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs text-blue-800">
              Staff will select the pricing type when creating a new transaction.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add-on Rates ─────────────────────────────────────────────────── */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add-on Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {addOns.map((a) => (
              <div key={a.id} className="flex items-center gap-2 bg-muted/30 rounded-md px-3 py-2">
                <span className="flex-1 text-sm text-foreground">{a.name}</span>
                <span className="text-sm text-muted-foreground">&#x20B1;{a.rate}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => {
                  const next = addOns.filter((x) => x.id !== a.id);
                  setAddOns(next);
                  persistAddOns(next);
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input placeholder="Add-on name" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 h-8 text-sm" />
            <Input placeholder="Rate ₱" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="w-20 h-8 text-sm" />
            <Button size="sm" variant="outline" onClick={addAddon} className="h-8">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Price Display Settings ───────────────────────────────────────── */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Price Display Settings</CardTitle>
          <CardDescription className="text-xs">Control how prices appear to staff during transaction entry.</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const DISPLAY_MODES: {
              value: PriceDisplayMode;
              icon: React.ReactNode;
              label: string;
              description: string;
            }[] = [
              {
                value: "show",
                icon: <Eye className="w-5 h-5" />,
                label: "Show Price",
                description: "Staff sees the price on each Wash Type and Load Size button, and the fee updates live as they fill out the form.",
              },
              {
                value: "free",
                icon: <Tag className="w-5 h-5" />,
                label: "No Price / Free",
                description: "All fees are set to ₱0. Useful for promo days or owner use. No prices are shown on buttons.",
              },
              {
                value: "hide",
                icon: <EyeOff className="w-5 h-5" />,
                label: "Hide Price",
                description: "Prices are kept but hidden from buttons and the live preview. Staff only sees the total on the final confirmation step.",
              },
            ];

            return (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {DISPLAY_MODES.map(({ value, icon, label, description }) => {
                  const active = priceDisplayMode === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setPriceDisplayMode(value)}
                      className={[
                        "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
                        active
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-background hover:border-primary/40 hover:bg-muted/20",
                      ].join(" ")}
                    >
                      <div className={[
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      ].join(" ")}>
                        {icon}
                      </div>
                      <div className="space-y-0.5">
                        <p className={["text-sm font-semibold leading-tight", active ? "text-primary" : "text-foreground"].join(" ")}>
                          {label}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
                      </div>
                      {active && (
                        <span className="mt-auto text-[10px] font-semibold uppercase tracking-wider text-primary">Active</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* bottom spacer so content isn't hidden behind sticky bar */}
      <div className="h-16" />
    </div>

    {/* ── Sticky Save Bar ──────────────────────────────────────────────────── */}
    <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-4 py-3 mt-6 flex items-center justify-between gap-3 shadow-[0_-2px_8px_0_rgba(0,0,0,0.08)]">
      {saved ? (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm animate-in fade-in slide-in-from-bottom-1">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Pricing settings saved!
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Changes are not saved until you click Save.</p>
      )}
      <Button
        size="sm"
        onClick={() => {
          persistPricingConfig({ pricePerKg, minWeight, pricingMode, loadTiers, priceDisplayMode });
          persistAddOns(addOns);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }}
        className="flex items-center gap-1.5 shrink-0"
      >
        <Save className="w-3.5 h-3.5" /> Save Changes
      </Button>
    </div>
    </div>
  );
}

// ─── Service Types ───────────────────────────────────────────────────────────

const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  "per-kg":    "Per kg",
  "per-load":  "Per load",
  "per-piece": "Per piece",
};

function ServiceTypesSettings() {
  const [services, setServices] = useState<ServiceType[]>(loadServiceTypes);

  // Helper: update state + persist in one call
  const updateServices = (next: ServiceType[]) => {
    setServices(next);
    persistServiceTypes(next);
  };

  // Add-new form
  const [newName, setNewName]               = useState("");
  const [newDesc, setNewDesc]               = useState("");
  const [newPrice, setNewPrice]             = useState("");
  const [newPricingType, setNewPricingType] = useState<PricingType>("per-kg");
  const [newShowInTxn, setNewShowInTxn]     = useState(true);
  const [newShowPrice, setNewShowPrice]     = useState(true);

  // Edit modal
  const [editTarget, setEditTarget]         = useState<ServiceType | null>(null);
  const [editName, setEditName]             = useState("");
  const [editDesc, setEditDesc]             = useState("");
  const [editPrice, setEditPrice]           = useState("");
  const [editPricingType, setEditPricingType] = useState<PricingType>("per-kg");
  const [editActive, setEditActive]         = useState(true);
  const [editShowPrice, setEditShowPrice]   = useState(true);

  // Toasts
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openEdit = (s: ServiceType) => {
    setEditTarget(s);
    setEditName(s.name);
    setEditDesc(s.description);
    setEditPrice(s.price);
    setEditPricingType(s.pricingType);
    setEditActive(s.active);
    setEditShowPrice(s.showPrice ?? true);
  };

  const saveEdit = () => {
    if (!editTarget) return;
    const next = services.map((s) =>
      s.id === editTarget.id
        ? { ...s, name: editName, description: editDesc, price: editPrice, pricingType: editPricingType, active: editActive, showPrice: editShowPrice }
        : s
    );
    updateServices(next);
    setEditTarget(null);
    showToast("Service type updated successfully!");
  };

  const handleAdd = () => {
    if (!newName.trim() || !newPrice.trim()) return;
    const next = [
      ...services,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        description: newDesc.trim(),
        price: newPrice.trim(),
        pricingType: newPricingType,
        active: newShowInTxn,
        showPrice: newShowPrice,
      },
    ];
    updateServices(next);
    setNewName(""); setNewDesc(""); setNewPrice(""); setNewPricingType("per-kg");
    setNewShowInTxn(true); setNewShowPrice(true);
    showToast("Service type added successfully!");
  };

  const handleSaveAll = () => {
    persistServiceTypes(services);
    showToast("All service types saved successfully!");
  };

  const canAdd = newName.trim().length > 0 && newPrice.trim().length > 0;

  return (
    <div className="space-y-4 w-full max-w-lg">
      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          {toast}
        </div>
      )}

      {/* Service type list */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Service Types</CardTitle>
          <CardDescription className="text-xs">Manage available wash service categories.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className={cn(
                "rounded-md px-3 py-2.5 space-y-2 transition-opacity duration-150",
                s.active ? "bg-muted/30" : "bg-muted/10 opacity-60"
              )}
            >
              {/* Top row: name + badges */}
              <div className="flex items-start gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                {s.active && (s.showPrice ?? true) && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">₱{s.price}</span>
                )}
                <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 border border-border">
                  {PRICING_TYPE_LABELS[s.pricingType] ?? s.pricingType}
                </span>
              </div>
              {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}

              {/* Bottom row: toggles + actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Toggle 1: Show in Transaction — turning OFF also forces showPrice OFF */}
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={s.active}
                    onCheckedChange={(v) =>
                      updateServices(services.map((x) =>
                        x.id === s.id
                          ? { ...x, active: v, showPrice: v ? (x.showPrice ?? true) : false }
                          : x
                      ))
                    }
                    className="scale-90"
                  />
                  <span className="text-[11px] text-muted-foreground font-medium">Show</span>
                </div>
                {/* Toggle 2: Show Price — disabled, dimmed, and has tooltip when Show is OFF */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 transition-opacity duration-150",
                    !s.active && "opacity-40 pointer-events-none cursor-not-allowed"
                  )}
                  title={!s.active ? "Enable Show first to configure Price" : undefined}
                >
                  <Switch
                    checked={(s.showPrice ?? true) && s.active}
                    onCheckedChange={(v) => updateServices(services.map((x) => x.id === s.id ? { ...x, showPrice: v } : x))}
                    disabled={!s.active}
                    className="scale-90"
                  />
                  <span className="text-[11px] text-muted-foreground font-medium">Price</span>
                </div>
                {/* Spacer */}
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => updateServices(services.filter((x) => x.id !== s.id))}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add new form */}
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Add New Service Type</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label className="text-[10px] text-muted-foreground mb-1 block">Service Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Heavy Duty Wash"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[10px] text-muted-foreground mb-1 block">Description</Label>
                <Input
                  placeholder="e.g. For heavily soiled items"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Price (₱) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 60"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Pricing Type</Label>
                <Select value={newPricingType} onValueChange={(v) => setNewPricingType(v as PricingType)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-kg">Per kg</SelectItem>
                    <SelectItem value="per-load">Per load</SelectItem>
                    <SelectItem value="per-piece">Per piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <Switch checked={newShowInTxn} onCheckedChange={setNewShowInTxn} />
                <Label className="text-xs text-muted-foreground">Show in Transaction</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newShowPrice} onCheckedChange={setNewShowPrice} />
                <Label className="text-xs text-muted-foreground">Show Price</Label>
              </div>
            </div>
            <Button size="sm" className="h-8 gap-1.5 mt-1" onClick={handleAdd} disabled={!canAdd}>
              <Plus className="w-3.5 h-3.5" /> Add Service Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save all */}
      <Button className="w-full gap-1.5" onClick={handleSaveAll}>
        <Save className="w-4 h-4" /> Save All Changes
      </Button>

      {/* Edit modal */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Service Type</DialogTitle>
            <DialogDescription className="sr-only">
              Edit the name, description, price, and settings for this service type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Service Name <span className="text-destructive">*</span></Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Description</Label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="text-sm resize-none"
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Price (₱) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Pricing Type</Label>
                <Select value={editPricingType} onValueChange={(v) => setEditPricingType(v as PricingType)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-kg">Per kg</SelectItem>
                    <SelectItem value="per-load">Per load</SelectItem>
                    <SelectItem value="per-piece">Per piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2.5">
                <Label className="text-sm">Show</Label>
                <Switch checked={editActive} onCheckedChange={setEditActive} />
              </div>
              <div className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2.5">
                <Label className="text-sm">Price</Label>
                <Switch checked={editShowPrice} onCheckedChange={setEditShowPrice} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1 gap-1.5"
                onClick={saveEdit}
                disabled={!editName.trim() || !editPrice.trim()}
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Business Profile ────────────────────────────────────────────────────────
function BusinessProfileSettings() {
  const [profile, setProfile] = useState<BusinessProfile>(() => loadBusinessProfile());
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<BusinessProfile>) => setProfile((p) => ({ ...p, ...patch }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Logo must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => update({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    persistBusinessProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4 w-full max-w-lg">
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          Business profile saved!
        </div>
      )}

      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Business Profile</CardTitle>
          <CardDescription className="text-xs">This information appears on receipts and the customer tracking page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Shop Name */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Shop Name</Label>
            <Input
              value={profile.shopName}
              onChange={(e) => update({ shopName: e.target.value })}
              className="h-9 text-sm"
              placeholder="e.g. Sunshine Laundry Shop"
            />
          </div>

          {/* Tagline */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Tagline / Subtitle</Label>
            <Input
              value={profile.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
              className="h-9 text-sm"
              placeholder="e.g. Powered by LaundryTrack"
            />
          </div>

          {/* Address */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Address</Label>
            <Input
              value={profile.address}
              onChange={(e) => update({ address: e.target.value })}
              className="h-9 text-sm"
              placeholder="e.g. 123 Magsaysay Ave, Manila"
            />
          </div>

          {/* Contact Number */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Contact Number</Label>
            <Input
              value={profile.contactNumber}
              onChange={(e) => update({ contactNumber: e.target.value })}
              className="h-9 text-sm"
              placeholder="e.g. (02) 8123-4567"
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Email</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => update({ email: e.target.value })}
              className="h-9 text-sm"
              placeholder="e.g. contact@laundrytrack.ph"
            />
          </div>

          {/* Shop Logo */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Shop Logo</Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoChange}
            />
            {profile.logoDataUrl ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.logoDataUrl}
                  alt="Shop logo preview"
                  className="w-16 h-16 rounded-lg object-contain border border-border bg-muted/30"
                />
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3" /> Change Logo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => update({ logoDataUrl: "" })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
                <p className="text-[11px] text-muted-foreground/60">PNG, JPG up to 2MB</p>
              </button>
            )}
          </div>

          {/* Receipt Footer Message */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Receipt Footer Message</Label>
            <Textarea
              value={profile.receiptFooter}
              onChange={(e) => update({ receiptFooter: e.target.value })}
              placeholder="e.g. Thank you for choosing Sunshine Laundry Shop!"
              className="text-sm resize-none"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5">
        <Save className="w-3.5 h-3.5" /> Save Profile
      </Button>
    </div>
  );
}

// ─── Backup & Restore ────────────────────────────────────────────────────────
function BackupSettings() {
  const [autoBackup, setAutoBackup]   = useState(true);
  const [schedule, setSchedule]       = useState<"daily" | "weekly">("daily");
  const [exporting, setExporting]     = useState(false);
  const [lastBackup, setLastBackup]   = useState<Date | null>(null);
  const [justExported, setJustExported] = useState(false);

  const formatBackupDate = (d: Date) =>
    d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    // Brief artificial delay so the loading state is visible
    await new Promise((r) => setTimeout(r, 800));

    const now = new Date();

    // Build full backup payload from all data sources
    const backup = {
      meta: {
        appName: "LaundryTrack",
        version: "1.0",
        exportedAt: now.toISOString(),
        exportedBy: "Admin",
      },
      settings: {
        pricing: {
          pricePerKg: 30,
          loyaltyMilestone: 7,
          addOns: [
            { name: "Fabcon",        rate: 10 },
            { name: "Express (+50%)", rate: 50 },
            { name: "Bleach",        rate: 15 },
            { name: "Starch",        rate: 20 },
          ],
        },
        serviceTypes: [
          { name: "Regular",         description: "Standard wash & dry",              active: true },
          { name: "Delicate",        description: "Gentle cycle for delicate fabrics", active: true },
          { name: "Express",         description: "Same-day turnaround",               active: true },
          { name: "Bulk / Commercial", description: "For 10kg and above",             active: false },
        ],
        businessProfile: {
          shopName:      "LaundryTrack",
          address:       "123 Magsaysay Ave, Brgy. Sta. Cruz, Manila",
          contactNumber: "(02) 8123-4567",
          email:         "contact@laundrytrack.ph",
        },
        backup: {
          autoBackup: true,
          schedule:   "daily",
        },
      },
      data: {
        transactions,
        loyaltyMembers,
        auditLogs,
        analytics: {
          serviceRevenue:  serviceRevenueData,
          weeklyRevenue:   weeklyRevenueData,
        },
      },
    };

    // Serialise and trigger download
    const json     = JSON.stringify(backup, null, 2);
    const blob     = new Blob([json], { type: "application/json" });
    const url      = URL.createObjectURL(blob);
    const pad      = (n: number) => String(n).padStart(2, "0");
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName = `LaundryTrack_Backup_${datePart}_${timePart}.json`;
    const a        = document.createElement("a");
    a.href         = url;
    a.download     = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastBackup(now);
    setExporting(false);
    setJustExported(true);
    setTimeout(() => setJustExported(false), 3000);
  };

  return (
    <div className="space-y-4 w-full max-w-lg">
      {/* Success toast */}
      {justExported && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          Backup exported successfully!
        </div>
      )}

      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Manual Backup</CardTitle>
          <CardDescription className="text-xs">Download a snapshot of all system data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 bg-muted/30 rounded-md p-3">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              Last backup:{" "}
              <strong className="text-foreground">
                {lastBackup ? formatBackupDate(lastBackup) : "April 4, 2026, 11:00 PM"}
              </strong>
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export Database Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Automatic Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Enable automatic backup</Label>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
          {autoBackup && (
            <div className="flex items-center gap-3">
              <Label className="text-sm w-20 shrink-0">Schedule</Label>
              <div className="flex gap-2">
                {(["daily", "weekly"] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={schedule === s ? "default" : "outline"}
                    className="h-7 text-xs capitalize"
                    onClick={() => setSchedule(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Restore from Backup</CardTitle>
          <CardDescription className="text-xs">Upload a previously exported backup file to restore data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Click to upload backup file</p>
            <p className="text-[11px] text-muted-foreground/60">.json files accepted</p>
          </div>
          <Button size="sm" variant="destructive" className="mt-3 flex items-center gap-1.5">
            Restore Database
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Loyalty Program Settings ─────────────────────────────────────────────────

interface LoyaltyProgramSettingsProps {
  loyaltyEnabled: boolean;
  onLoyaltyEnabledChange: (val: boolean) => void;
}

function LoyaltyProgramSettings({ loyaltyEnabled, onLoyaltyEnabledChange }: LoyaltyProgramSettingsProps) {
  const [enabled, setEnabled] = useState(loyaltyEnabled);
  const [washesPerReward, setWashesPerReward] = useState(
    () => loadLoyaltySettings().washesPerReward
  );
  const [rewardDescription, setRewardDescription] = useState(
    () => loadLoyaltySettings().rewardDescription
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    persistLoyaltySettings({ enabled, washesPerReward, rewardDescription });
    onLoyaltyEnabledChange(enabled);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4 w-full max-w-lg">
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          Loyalty program settings saved!
        </div>
      )}

      {/* Master toggle */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Enable Loyalty Program</Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When turned off, the Loyalty Member option will be hidden in New Transaction and the Loyalty Members menu will be disabled.
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Enable loyalty program"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reward config — only shown when enabled */}
      <Card className={cn("border border-border shadow-none transition-opacity", !enabled && "opacity-50 pointer-events-none")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Reward Configuration</CardTitle>
          <CardDescription className="text-xs">Configure how customers earn rewards based on their washes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loyalty Reward</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground shrink-0">Every</span>
              <Input
                type="number"
                min="1"
                value={washesPerReward}
                onChange={(e) => setWashesPerReward(e.target.value)}
                className="w-16 h-9 text-sm text-center"
              />
              <span className="text-sm text-muted-foreground shrink-0">washes =</span>
              <Input
                placeholder="e.g. Free wash, 50% discount, Free fabcon"
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                className="flex-1 min-w-40 h-9 text-sm"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Example: Every 10 washes = Free wash
            </p>
          </div>
        </CardContent>
      </Card>

      <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5">
        <Save className="w-3.5 h-3.5" /> Save Changes
      </Button>
    </div>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

interface SettingsPageProps {
  page: Page;
  loyaltyEnabled?: boolean;
  onLoyaltyEnabledChange?: (val: boolean) => void;
}

export default function SettingsPage({ page, loyaltyEnabled = true, onLoyaltyEnabledChange }: SettingsPageProps) {
  switch (page) {
    case "settings-pricing": return <PricingSettings />;
    case "settings-service-types": return <ServiceTypesSettings />;
    case "settings-business-profile": return <BusinessProfileSettings />;
    case "settings-loyalty": return (
      <LoyaltyProgramSettings
        loyaltyEnabled={loyaltyEnabled}
        onLoyaltyEnabledChange={onLoyaltyEnabledChange ?? (() => {})}
      />
    );
    case "settings-backup": return <BackupSettings />;
    default: return null;
  }
}
