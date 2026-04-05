"use client";

import { useState } from "react";
import Sidebar, { type Page } from "@/components/sidebar";
import TopNav from "@/components/topnav";
import DashboardPage from "@/components/pages/dashboard";
import TransactionsPage from "@/components/pages/transactions";
import ClaimVerificationPage from "@/components/pages/claim-verification";
import ReportsPage from "@/components/pages/reports";
import SettingsPage from "@/components/pages/settings";
import LoyaltyPage from "@/components/pages/loyalty";

export default function AppShell() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "transactions": return <TransactionsPage />;
      case "claim-verification": return <ClaimVerificationPage />;
      case "reports": return <ReportsPage />;
      case "settings-pricing":
      case "settings-service-types":
      case "settings-business-profile":
      case "settings-backup":
        return <SettingsPage page={activePage} />;
      case "loyalty": return <LoyaltyPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav activePage={activePage} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
