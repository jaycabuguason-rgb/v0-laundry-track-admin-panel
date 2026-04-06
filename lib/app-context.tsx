"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  transactions as defaultTxns,
  loyaltyMembers as defaultMembers,
  initialNotifications,
  type Transaction,
  type LoyaltyMember,
  type Notification,
} from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingSettings {
  pricePerKg: string;
  minWeight: string;
  milestone: string;
  customMilestone: string;
  customReward: string;
}

const defaultPricingSettings: PricingSettings = {
  pricePerKg: "30",
  minWeight: "",
  milestone: "7",
  customMilestone: "10",
  customReward: "",
};

interface AppContextValue {
  // Transactions
  transactions: Transaction[];
  setTransactions: (txns: Transaction[]) => void;
  addTransaction: (partial: Omit<Transaction, "id" | "ticketId">) => Transaction;
  updateTransaction: (id: string, changes: Partial<Transaction>) => void;

  // Loyalty Members
  members: LoyaltyMember[];
  setMembers: (members: LoyaltyMember[]) => void;
  addMember: (member: Omit<LoyaltyMember, "id">) => LoyaltyMember;
  updateMember: (id: string, changes: Partial<LoyaltyMember>) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Omit<Notification, "id">) => void;
  dismissNotification: (id: string) => void;

  // Pricing settings
  pricingSettings: PricingSettings;
  setPricingSettings: (s: PricingSettings) => void;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

const LS_TRANSACTIONS  = "laundrytrack_transactions";
const LS_MEMBERS       = "laundrytrack_members";
const LS_NOTIFICATIONS = "laundrytrack_notifications";
const LS_SETTINGS      = "laundrytrack_settings";

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTxnsRaw]       = useState<Transaction[]>(() => lsGet(LS_TRANSACTIONS, defaultTxns));
  const [members, setMembersRaw]         = useState<LoyaltyMember[]>(() => lsGet(LS_MEMBERS, defaultMembers));
  const [notifications, setNotifsRaw]    = useState<Notification[]>(() => lsGet(LS_NOTIFICATIONS, initialNotifications));
  const [pricingSettings, setPricingRaw] = useState<PricingSettings>(() => lsGet(LS_SETTINGS, defaultPricingSettings));

  // Keep track of next id for transactions and members
  const nextTxnId   = useRef(transactions.length + 1);
  const nextMemberId = useRef(members.length + 1);

  // ── Transactions ────────────────────────────────────────────────────────────
  const setTransactions = useCallback((txns: Transaction[]) => {
    setTxnsRaw(txns);
    lsSet(LS_TRANSACTIONS, txns);
  }, []);

  const addTransaction = useCallback((partial: Omit<Transaction, "id" | "ticketId">): Transaction => {
    const newId     = String(nextTxnId.current++);
    const newTicket = `TKT-${newId.padStart(4, "0")}`;
    const newTxn: Transaction = { id: newId, ticketId: newTicket, ...partial };
    setTxnsRaw((prev) => {
      const next = [newTxn, ...prev];
      lsSet(LS_TRANSACTIONS, next);
      return next;
    });
    return newTxn;
  }, []);

  const updateTransaction = useCallback((id: string, changes: Partial<Transaction>) => {
    setTxnsRaw((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, ...changes } : t);
      lsSet(LS_TRANSACTIONS, next);
      return next;
    });
  }, []);

  // ── Members ─────────────────────────────────────────────────────────────────
  const setMembers = useCallback((m: LoyaltyMember[]) => {
    setMembersRaw(m);
    lsSet(LS_MEMBERS, m);
  }, []);

  const addMember = useCallback((member: Omit<LoyaltyMember, "id">): LoyaltyMember => {
    const newMember: LoyaltyMember = { id: String(nextMemberId.current++), ...member };
    setMembersRaw((prev) => {
      const next = [newMember, ...prev];
      lsSet(LS_MEMBERS, next);
      return next;
    });
    return newMember;
  }, []);

  const updateMember = useCallback((id: string, changes: Partial<LoyaltyMember>) => {
    setMembersRaw((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, ...changes } : m);
      lsSet(LS_MEMBERS, next);
      return next;
    });
  }, []);

  // ── Notifications ────────────────────────────────────────────────────────────
  const setNotifications = useCallback((notifs: Notification[]) => {
    setNotifsRaw(notifs);
    lsSet(LS_NOTIFICATIONS, notifs);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, "id">) => {
    const newNotif: Notification = { id: `n-${Date.now()}`, ...notif };
    setNotifsRaw((prev) => {
      const next = [newNotif, ...prev];
      lsSet(LS_NOTIFICATIONS, next);
      return next;
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifsRaw((prev) => {
      const next = prev.filter((n) => n.id !== id);
      lsSet(LS_NOTIFICATIONS, next);
      return next;
    });
  }, []);

  // ── Pricing ──────────────────────────────────────────────────────────────────
  const setPricingSettings = useCallback((s: PricingSettings) => {
    setPricingRaw(s);
    lsSet(LS_SETTINGS, s);
  }, []);

  // Sync nextTxnId when transactions change externally (e.g. data import)
  useEffect(() => {
    const maxId = transactions.reduce((max, t) => {
      const n = parseInt(t.id, 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    nextTxnId.current = maxId + 1;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AppContextValue = {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    members,
    setMembers,
    addMember,
    updateMember,
    notifications,
    setNotifications,
    addNotification,
    dismissNotification,
    pricingSettings,
    setPricingSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
