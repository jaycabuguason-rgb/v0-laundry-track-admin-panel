"use client";

import useSWR from "swr";
import {
  getTransactions,
  getLoyaltyMembers,
  getAuditLogs,
  getNotifications,
  getSetting,
  getProfile,
} from "@/lib/actions";

// ── Transactions ──────────────────────────────────────────────────────────────

export function useTransactions() {
  const { data, error, isLoading, mutate } = useSWR("transactions", getTransactions, {
    refreshInterval: 30_000,
  });
  return { transactions: data ?? [], error, isLoading, mutate };
}

// ── Loyalty Members ───────────────────────────────────────────────────────────

export function useLoyaltyMembers() {
  const { data, error, isLoading, mutate } = useSWR("loyalty_members", getLoyaltyMembers, {
    refreshInterval: 30_000,
  });
  return { loyaltyMembers: data ?? [], error, isLoading, mutate };
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export function useAuditLogs() {
  const { data, error, isLoading, mutate } = useSWR("audit_logs", getAuditLogs, {
    refreshInterval: 30_000,
  });
  return { auditLogs: data ?? [], error, isLoading, mutate };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR("notifications", getNotifications, {
    refreshInterval: 15_000,
  });
  return { notifications: data ?? [], error, isLoading, mutate };
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function useSetting(key: string) {
  const { data, error, isLoading, mutate } = useSWR(`setting:${key}`, () => getSetting(key));
  return { value: data, error, isLoading, mutate };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR("profile", getProfile);
  return { profile: data, error, isLoading, mutate };
}
