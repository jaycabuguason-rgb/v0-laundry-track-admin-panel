"use client";

import { useState } from "react";
import { Bell, ChevronDown, User, Eye, X, KeyRound, LogOut, AlertTriangle, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialNotifications, type Notification } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Page } from "@/components/sidebar";
import type { AdminProfile } from "@/app/page";

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
  profile: "My Profile",
  "change-password": "Change Password",
  "settings-data-import": "Settings — Data Import",
};

const notifTypeColors: Record<Notification["type"], string> = {
  ready:     "bg-green-100 text-green-700",
  claim:     "bg-blue-100 text-blue-700",
  unclaimed: "bg-orange-100 text-orange-700",
  override:  "bg-red-100 text-red-700",
};

interface TopNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
  adminProfile: AdminProfile;
  onMenuToggle: () => void;
  onTransactionDetail?: (ticketId: string) => void;
}

export default function TopNav({ activePage, onNavigate, onSignOut, adminProfile, onMenuToggle, onTransactionDetail }: TopNavProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  // Filter badge: only show READY + UNCLAIMED notifications
  const badgeCount = notifications.filter((n) => n.type === "ready" || n.type === "unclaimed").length;

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const viewNotif = (notif: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTransactionDetail) {
      onTransactionDetail(notif.ticketId);
    } else if (notif.type === "ready" || notif.type === "unclaimed") {
      onNavigate("transactions");
    } else if (notif.type === "claim" || notif.type === "override") {
      onNavigate("claim-verification");
    }
    setNotifOpen(false);
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-3 md:px-6 shrink-0 gap-3">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — visible only on mobile/tablet */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-sm font-semibold text-foreground truncate">
          {pageTitles[activePage]}
        </h1>
      </div>

      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-md cursor-pointer hover:bg-accent transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {badgeCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                  {badgeCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 sm:w-80 p-0"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Notifications</p>
              <span className="text-[11px] text-muted-foreground">{notifications.length} unread</span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mb-1 ${notifTypeColors[notif.type]}`}>
                        {notif.type.toUpperCase()}
                      </span>
                      <p className="text-xs text-foreground leading-snug">{notif.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{notif.time}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] px-2 flex items-center gap-1"
                        onClick={(e) => viewNotif(notif, e)}
                      >
                        <Eye className="w-3 h-3" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] px-2 flex items-center gap-1 text-muted-foreground hover:text-destructive"
                        onClick={(e) => dismiss(notif.id, e)}
                      >
                        <X className="w-3 h-3" /> Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors active:scale-95 min-h-[44px]">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              {/* Name + email hidden on mobile */}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-none">{adminProfile.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[120px] truncate">{adminProfile.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold text-foreground truncate">{adminProfile.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{adminProfile.email}</p>
            </div>
            <DropdownMenuItem
              className="cursor-pointer mt-1"
              onClick={() => onNavigate("profile")}
            >
              <User className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onNavigate("change-password")}
            >
              <KeyRound className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => setSignOutOpen(true)}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle className="text-base">Sign Out</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pl-[52px]">
              Are you sure you want to sign out? You will be returned to the login page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setSignOutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                setSignOutOpen(false);
                onSignOut();
              }}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
