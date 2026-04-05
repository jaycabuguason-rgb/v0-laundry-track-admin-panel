"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Save, Upload, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type Page } from "@/components/sidebar";

// ─── Pricing ────────────────────────────────────────────────────────────────
function PricingSettings() {
  const [pricePerKg, setPricePerKg] = useState("30");
  const [milestone, setMilestone] = useState("7");
  const [addOns, setAddOns] = useState([
    { id: "1", name: "Fabcon", rate: "10" },
    { id: "2", name: "Express (+50%)", rate: "50" },
    { id: "3", name: "Bleach", rate: "15" },
    { id: "4", name: "Starch", rate: "20" },
  ]);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [saved, setSaved] = useState(false);

  const addAddon = () => {
    if (!newName || !newRate) return;
    setAddOns((prev) => [...prev, { id: Date.now().toString(), name: newName, rate: newRate }]);
    setNewName(""); setNewRate("");
  };

  return (
    <div className="space-y-5 max-w-xl">
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Base Pricing</CardTitle>
          <CardDescription className="text-xs">Set the base rate per kilogram of laundry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm w-32 shrink-0">Price per kg (₱)</Label>
            <Input value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} className="w-32 h-9 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm w-32 shrink-0">Loyalty Milestone</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Every</span>
              <Input value={milestone} onChange={(e) => setMilestone(e.target.value)} className="w-16 h-9 text-sm text-center" />
              <span className="text-sm text-muted-foreground">visits = free wash</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setAddOns((prev) => prev.filter((x) => x.id !== a.id))}>
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

      <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="flex items-center gap-1.5">
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );
}

// ─── Service Types ───────────────────────────────────────────────────────────
function ServiceTypesSettings() {
  const [services, setServices] = useState([
    { id: "1", name: "Regular", description: "Standard wash & dry", active: true },
    { id: "2", name: "Delicate", description: "Gentle cycle for delicate fabrics", active: true },
    { id: "3", name: "Express", description: "Same-day turnaround", active: true },
    { id: "4", name: "Bulk / Commercial", description: "For 10kg and above", active: false },
  ]);
  const [newService, setNewService] = useState("");

  return (
    <div className="space-y-4 max-w-lg">
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Service Types</CardTitle>
          <CardDescription className="text-xs">Manage available wash service categories.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-muted/30 rounded-md px-3 py-2.5">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              <Switch
                checked={s.active}
                onCheckedChange={(v) => setServices((prev) => prev.map((x) => x.id === s.id ? { ...x, active: v } : x))}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setServices((p) => p.filter((x) => x.id !== s.id))}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 mt-3 pt-1 border-t border-border">
            <Input placeholder="New service type..." value={newService} onChange={(e) => setNewService(e.target.value)} className="flex-1 h-9 text-sm" />
            <Button size="sm" onClick={() => { if (newService) { setServices((p) => [...p, { id: Date.now().toString(), name: newService, description: "", active: true }]); setNewService(""); } }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Business Profile ────────────────────────────────────────────────────────
function BusinessProfileSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-4 max-w-lg">
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
  const [autoBackup, setAutoBackup] = useState(true);
  const [schedule, setSchedule] = useState<"daily" | "weekly">("daily");

  return (
    <div className="space-y-4 max-w-lg">
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Manual Backup</CardTitle>
          <CardDescription className="text-xs">Download a snapshot of all system data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 bg-muted/30 rounded-md p-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">Last backup: <strong className="text-foreground">April 4, 2026, 11:00 PM</strong></span>
          </div>
          <Button size="sm" variant="outline" className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 rotate-180" /> Export Database Backup
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
            <p className="text-[11px] text-muted-foreground/60">.json, .sql files accepted</p>
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
