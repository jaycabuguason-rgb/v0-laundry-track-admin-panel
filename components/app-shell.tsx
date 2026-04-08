"use client";

import { useState } from "react";
import Sidebar, { type Page } from "@/components/sidebar";
import TopNav from "@/components/topnav";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import { transactions, type Transaction } from "@/lib/data";
import DashboardPage from "@/components/pages/dashboard";
import TransactionsPage from "@/components/pages/transactions";
import ClaimVerificationPage from "@/components/pages/claim-verification";
import ReportsPage from "@/components/pages/reports";
import SettingsPage from "@/components/pages/settings";
import LoyaltyPage from "@/components/pages/loyalty";
import ProfilePage from "@/components/pages/profile";
import ChangePasswordPage from "@/components/pages/change-password";
import DataImportPage from "@/components/pages/data-import";
import type { AdminProfile } from "@/app/page";

interface AppShellProps {
  onSignOut: () => void;
  adminProfile: AdminProfile;
  onProfileUpdate: (updates: Partial<AdminProfile>) => void;
}

export default function AppShell({ onSignOut, adminProfile, onProfileUpdate }: AppShellProps) {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [txns, setTxns] = useState<Transaction[]>(transactions);

  const handleTransactionDetail = (ticketId: string) => {
    const txn = txns.find((t) => t.ticketId === ticketId) ?? null;
    setDetailTxn(txn);
    setDetailOpen(true);
  };

  const handleUpdateTransaction = (ticketId: string, updates: Partial<Transaction>) => {
    setTxns((prev) => prev.map((t) => t.ticketId === ticketId ? { ...t, ...updates } : t));
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage transactions={txns} />;
      case "transactions": return <TransactionsPage transactions={txns} />;
      case "claim-verification": return <ClaimVerificationPage transactions={txns} onUpdateTransaction={handleUpdateTransaction} />;
      case "reports": return <ReportsPage />;
      case "settings-pricing":
      case "settings-service-types":
      case "settings-business-profile":
      case "settings-backup":
        return <SettingsPage page={activePage} />;
      case "settings-data-import":
        return <DataImportPage onViewTransactions={() => handleNavigate("transactions")} />;
      case "loyalty": return <LoyaltyPage />;
      case "profile": return <ProfilePage adminProfile={adminProfile} />;
      case "change-password": return <ChangePasswordPage adminProfile={adminProfile} onProfileUpdate={onProfileUpdate} />;
      default: return <DashboardPage transactions={txns} />;
    }
  };

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless menu is open */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 lg:static lg:z-auto lg:flex
          transition-transform duration-300
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          activePage={activePage}
          onNavigate={handleNavigate}
          onSignOut={onSignOut}
          adminProfile={adminProfile}
          onMenuToggle={() => setMobileMenuOpen((v) => !v)}
          onTransactionDetail={handleTransactionDetail}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>

    <TransactionDetailModal
      open={detailOpen}
      onOpenChange={setDetailOpen}
      transaction={detailTxn}
    />
    </>
  );
}
