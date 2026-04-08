"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminProfile } from "@/app/page";

interface ProfilePageProps {
  adminProfile: AdminProfile;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
}

export default function ProfilePage({ adminProfile }: ProfilePageProps) {
  const initials = adminProfile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full max-w-2xl space-y-4 md:space-y-6">
      {/* Avatar card */}
      <Card className="border border-border shadow-none">
        <CardContent className="pt-6 pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold select-none">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border border-border shadow flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-base">{adminProfile.name}</p>
              <p className="text-sm text-muted-foreground">{adminProfile.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5">Admin</Badge>
                <span className="text-[11px] text-muted-foreground">LaundryTrack</span>
              </div>
            </div>
            <div className="ml-auto shrink-0">
              <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5 cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login credentials — live from Update Login Credentials */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Login Information</CardTitle>
          <CardDescription className="text-xs">
            These values reflect your current login credentials. Update them from Settings → Change Password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Full Name"     value={adminProfile.name} />
          <InfoRow label="Username"      value={adminProfile.username || "—"} />
          <InfoRow label="Email Address" value={adminProfile.email} />
          <InfoRow label="Phone Number"  value={adminProfile.phone || "—"} />
        </CardContent>
      </Card>

      {/* Read-only account details */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Account Details</CardTitle>
          <CardDescription className="text-xs">
            These fields are managed by the system and cannot be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Role"      value="Admin" />
          <InfoRow label="Shop Name" value="LaundryTrack" />
        </CardContent>
      </Card>
    </div>
  );
}
