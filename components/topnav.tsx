"use client";

import { Bell, ChevronDown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Page } from "@/components/sidebar";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  "claim-verification": "Claim Verification",
  reports: "Reports",
  "settings-pricing": "Settings — Pricing",
  "settings-service-types": "Settings — Service Types",
  "settings-business-profile": "Settings — Business Profile",
  "settings-backup": "Settings — Backup & Restore",
  loyalty: "Loyalty Members",
};

interface TopNavProps {
  activePage: Page;
}

export default function TopNav({ activePage }: TopNavProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-foreground">
        {pageTitles[activePage]}
      </h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-accent transition-colors">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-0">
            3
          </Badge>
        </button>

        {/* Admin profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-accent transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-none">Admin</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">admin@laundrytrack.ph</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Change Password</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
