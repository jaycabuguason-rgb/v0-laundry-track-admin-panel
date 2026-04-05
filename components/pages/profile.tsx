"use client";

import { useState } from "react";
import { Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [form, setForm] = useState({
    fullName: "Admin User",
    email: "admin@laundrytrack.ph",
    phone: "+63 912 345 6789",
  });
  const [saved, setSaved] = useState(false);
  const [avatarInitials] = useState("AU");

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar card */}
      <Card className="border border-border shadow-none">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold select-none">
                {avatarInitials}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border border-border shadow flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-foreground">{form.fullName}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5">Admin</Badge>
                <span className="text-[11px] text-muted-foreground">LaundryTrack</span>
              </div>
            </div>
            <div className="ml-auto">
              <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable info */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Personal Information</CardTitle>
          <CardDescription className="text-xs">Update your name, email, and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs font-medium mb-1.5 block">Full Name</Label>
              <Input
                value={form.fullName}
                onChange={handleChange("fullName")}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Email Address</Label>
              <Input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Phone Number</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Read-only info */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Account Details</CardTitle>
          <CardDescription className="text-xs">These fields are managed by the system and cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Role</Label>
              <div className="h-9 flex items-center px-3 bg-muted/40 rounded-md border border-border text-sm text-muted-foreground">
                Admin
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Shop Name</Label>
              <div className="h-9 flex items-center px-3 bg-muted/40 rounded-md border border-border text-sm text-muted-foreground">
                LaundryTrack
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? "Changes Saved!" : "Save Changes"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5"
          onClick={() => setForm({ fullName: "Admin User", email: "admin@laundrytrack.ph", phone: "+63 912 345 6789" })}
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
        {saved && (
          <span className="text-xs text-green-600 font-medium">Profile updated successfully!</span>
        )}
      </div>
    </div>
  );
}
