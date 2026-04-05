"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  QrCode,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Tag,
  Building2,
  Database,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  WashingMachine,
} from "lucide-react";

export type Page =
  | "dashboard"
  | "transactions"
  | "claim-verification"
  | "reports"
  | "settings-pricing"
  | "settings-service-types"
  | "settings-business-profile"
  | "settings-backup"
  | "loyalty"
  | "profile"
  | "change-password";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions" as Page, label: "Transactions", icon: Receipt },
  { id: "claim-verification" as Page, label: "Claim Verification", icon: QrCode },
  { id: "reports" as Page, label: "Reports", icon: BarChart3 },
  { id: "loyalty" as Page, label: "Loyalty Members", icon: Star },
];

const settingsSubItems = [
  { id: "settings-pricing" as Page, label: "Pricing", icon: DollarSign },
  { id: "settings-service-types" as Page, label: "Service Types", icon: Tag },
  { id: "settings-business-profile" as Page, label: "Business Profile", icon: Building2 },
  { id: "settings-backup" as Page, label: "Backup & Restore", icon: Database },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(activePage.startsWith("settings"));

  const isSettingsActive = activePage.startsWith("settings");

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary shrink-0">
          <WashingMachine className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-base tracking-tight text-white">
            LaundryTrack
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
                  )}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}

          {/* Settings with sub-menu */}
          <li>
            <button
              onClick={() => {
                if (!collapsed) setSettingsOpen((prev) => !prev);
                else onNavigate("settings-pricing");
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isSettingsActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
              )}
            >
              <Settings className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Settings</span>
                  {settingsOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
            {!collapsed && settingsOpen && (
              <ul className="mt-1 ml-3 pl-3 border-l border-sidebar-border space-y-1">
                {settingsSubItems.map((sub) => {
                  const Icon = sub.icon;
                  const active = activePage === sub.id;
                  return (
                    <li key={sub.id}>
                      <button
                        onClick={() => onNavigate(sub.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                          active
                            ? "bg-primary/20 text-white"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-white"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{sub.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/60 transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
