"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Save, Upload, Clock, Download, Loader2, CheckCircle2, Scale, ShoppingBasket, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Page } from "@/components/sidebar";
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
  type LoadTier,
  DEFAULT_SERVICE_TYPES,
  DEFAULT_ADDONS,
  DEFAULT_LOAD_TIERS,
  loadServiceTypes,
  persistServiceTypes,
  loadAddOns,
  persistAddOns,
  loadPricingConfig,
  persistPricingConfig,
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

  // Loyalty
  const [milestone, setMilestone]           = useState("7");
  const [customMilestone, setCustomMilestone] = useState("10");
  const [customReward, setCustomReward]     = useState("");

  // Add-ons — initialised from shared store
  const [addOns, setAddOns] = useState<AddOn[]>(() => loadAddOns());
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");

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
    <>
    <div className="space-y-5 w-full max-w-xl">

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

      {/* ── Loyalty Milestone ────────────────────────────────────────────── */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Loyalty Rewards</CardTitle>
          <CardDescription className="text-xs">Configure visit milestones and what customers earn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reward 1 — free wash */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward 1 — Stamp Card</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">Every</span>
              <Input
                type="number"
                min="1"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                className="w-16 h-9 text-sm text-center"
              />
              <span className="text-sm text-muted-foreground shrink-0">visits = free wash</span>
            </div>
          </div>

          {/* Reward 2 — custom */}
          <div className="space-y-2 pt-1 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward 2 — Custom Milestone</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground shrink-0">Every</span>
              <Input
                type="number"
                min="1"
                value={customMilestone}
                onChange={(e) => setCustomMilestone(e.target.value)}
                className="w-16 h-9 text-sm text-center"
              />
              <span className="text-sm text-muted-foreground shrink-0">visits =</span>
              <Input
                placeholder="e.g. free load, 50% discount, free fabcon"
                value={customReward}
                onChange={(e) => setCustomReward(e.target.value)}
                className="flex-1 min-w-48 h-9 text-sm"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">Leave blank to disable the custom milestone reward.</p>
          </div>
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
                <span className="text-sm text-muted-foreground">₱{a.rate}</span>
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

      {/* bottom spacer so content isn't hidden behind sticky bar */}
      <div className="h-16" />
    </div>

    {/* ── Sticky Save Bar ──────────────────────────────────────────────────── */}
    <div className="sticky bottom-0 z-10 bg-background border-t border-border px-0 py-3 mt-0 flex items-center justify-between gap-3">
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
          persistPricingConfig({ pricePerKg, minWeight, pricingMode, loadTiers });
          persistAddOns(addOns);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }}
        className="flex items-center gap-1.5 shrink-0"
      >
        <Save className="w-3.5 h-3.5" /> Save Changes
      </Button>
    </div>
    </>
  );
}

// ─── Service Types ───────────────────────────────────────────────────────────

const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  "per-kg":    "Per kg",
  "per-load":  "Per load",
  "flat-rate": "Flat rate",
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

  // Edit modal
  const [editTarget, setEditTarget]         = useState<ServiceType | null>(null);
  const [editName, setEditName]             = useState("");
  const [editDesc, setEditDesc]             = useState("");
  const [editPrice, setEditPrice]           = useState("");
  const [editPricingType, setEditPricingType] = useState<PricingType>("per-kg");
  const [editActive, setEditActive]         = useState(true);

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
  };

  const saveEdit = () => {
    if (!editTarget) return;
    const next = services.map((s) =>
      s.id === editTarget.id
        ? { ...s, name: editName, description: editDesc, price: editPrice, pricingType: editPricingType, active: editActive }
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
      { id: Date.now().toString(), name: newName.trim(), description: newDesc.trim(), price: newPrice.trim(), pricingType: newPricingType, active: true },
    ];
    updateServices(next);
    setNewName(""); setNewDesc(""); setNewPrice(""); setNewPricingType("per-kg");
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
            <div key={s.id} className="flex items-center gap-3 bg-muted/30 rounded-md px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <span className="text-xs font-semibold text-primary">₱{s.price}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {PRICING_TYPE_LABELS[s.pricingType]}
                  </span>
                </div>
                {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
              </div>
              <Switch
                checked={s.active}
                onCheckedChange={(v) => updateServices(services.map((x) => x.id === s.id ? { ...x, active: v } : x))}
              />
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
                    <SelectItem value="flat-rate">Flat rate</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="flat-rate">Flat rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2.5">
              <Label className="text-sm">Active</Label>
              <Switch checked={editActive} onCheckedChange={setEditActive} />
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
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-4 w-full max-w-lg">
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Business Profile</CardTitle>
          <CardDescription className="text-xs">This information appears on receipts and the customer tracking page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Shop Name</Label>
            <Input defaultValue="LaundryTrack" className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Address</Label>
            <Input defaultValue="123 Magsaysay Ave, Brgy. Sta. Cruz, Manila" className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Contact Number</Label>
            <Input defaultValue="(02) 8123-4567" className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Email</Label>
            <Input defaultValue="contact@laundrytrack.ph" className="h-9 text-sm" type="email" />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Shop Logo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
              <p className="text-[11px] text-muted-foreground/60">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="flex items-center gap-1.5">
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Profile"}
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

// ─── Export ──────────────────────────────────────────────────────────────────
export default function SettingsPage({ page }: { page: Page }) {
  switch (page) {
    case "settings-pricing": return <PricingSettings />;
    case "settings-service-types": return <ServiceTypesSettings />;
    case "settings-business-profile": return <BusinessProfileSettings />;
    case "settings-backup": return <BackupSettings />;
    default: return null;
  }
}
