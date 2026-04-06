/**
 * Central data-access layer for all Supabase queries.
 * All functions return typed results and handle errors gracefully.
 */
import { createClient } from "@/lib/supabase/client";
import type { Transaction, LoyaltyMember } from "@/lib/data";

// ─── Type mappers ─────────────────────────────────────────────────────────────

export function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as string,
    customerName: row.customer_name as string,
    phone: (row.phone_number as string) ?? "",
    dropOffDate: ((row.arrival_time as string) ?? "").split("T")[0],
    arrivalDateTime: (row.arrival_time as string) ?? "",
    washType: row.wash_type as string,
    weight: Number(row.weight_kg),
    fee: Number(row.fee),
    status: row.status as Transaction["status"],
    addOns: (row.addons as string[]) ?? [],
    washInstructions: (row.special_instructions as string) ?? "",
    voidReason: (row.void_reason as string) ?? undefined,
  };
}

export function mapLoyaltyMember(row: Record<string, unknown>): LoyaltyMember {
  return {
    id: row.id as string,
    name: row.full_name as string,
    phone: row.phone_number as string,
    stampCount: Number(row.stamp_count),
    rewardsRedeemed: Number(row.rewards_redeemed),
    dateJoined: ((row.date_joined as string) ?? "").split("T")[0],
  };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[db] fetchTransactions:", error.message); return []; }
  return (data ?? []).map(mapTransaction);
}

export async function insertTransaction(
  txn: Omit<Transaction, "id" | "ticketId"> & { ticketId?: string }
): Promise<Transaction | null> {
  const supabase = createClient();

  // Generate ticket ID client-side if not provided
  const ticketId = txn.ticketId ?? `TKT-${Date.now()}`;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      ticket_id: ticketId,
      customer_name: txn.customerName,
      phone_number: txn.phone,
      arrival_time: txn.arrivalDateTime ? new Date(txn.arrivalDateTime).toISOString() : new Date().toISOString(),
      wash_type: txn.washType,
      weight_kg: txn.weight,
      fee: txn.fee,
      status: txn.status ?? "Received",
      addons: txn.addOns ?? [],
      special_instructions: txn.washInstructions ?? "",
    })
    .select()
    .single();

  if (error) { console.error("[db] insertTransaction:", error.message); return null; }
  return mapTransaction(data as Record<string, unknown>);
}

export async function updateTransactionStatus(
  id: string,
  status: Transaction["status"],
  washInstructions?: string
): Promise<boolean> {
  const supabase = createClient();
  const updatePayload: Record<string, unknown> = { status };
  if (washInstructions !== undefined) updatePayload.special_instructions = washInstructions;

  const { error } = await supabase
    .from("transactions")
    .update(updatePayload)
    .eq("id", id);

  if (error) { console.error("[db] updateTransactionStatus:", error.message); return false; }
  return true;
}

export async function voidTransaction(id: string, reason: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("transactions")
    .update({ status: "Voided", void_reason: reason })
    .eq("id", id);
  if (error) { console.error("[db] voidTransaction:", error.message); return false; }
  return true;
}

// ─── Loyalty Members ──────────────────────────────────────────────────────────

export async function fetchLoyaltyMembers(): Promise<LoyaltyMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*")
    .order("date_joined", { ascending: false });
  if (error) { console.error("[db] fetchLoyaltyMembers:", error.message); return []; }
  return (data ?? []).map(mapLoyaltyMember);
}

export async function insertLoyaltyMember(
  member: Omit<LoyaltyMember, "id" | "dateJoined" | "rewardsRedeemed">
): Promise<LoyaltyMember | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loyalty_members")
    .insert({
      full_name: member.name,
      phone_number: member.phone,
      stamp_count: member.stampCount ?? 0,
      rewards_redeemed: 0,
    })
    .select()
    .single();
  if (error) { console.error("[db] insertLoyaltyMember:", error.message); return null; }
  return mapLoyaltyMember(data as Record<string, unknown>);
}

export async function updateLoyaltyMemberStamps(
  id: string,
  stampCount: number,
  rewardsRedeemed?: number
): Promise<boolean> {
  const supabase = createClient();
  const payload: Record<string, unknown> = { stamp_count: stampCount };
  if (rewardsRedeemed !== undefined) payload.rewards_redeemed = rewardsRedeemed;
  const { error } = await supabase.from("loyalty_members").update(payload).eq("id", id);
  if (error) { console.error("[db] updateLoyaltyMemberStamps:", error.message); return false; }
  return true;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function insertAuditLog(entry: {
  action: string;
  ticketId?: string;
  staffName?: string;
  notes?: string;
}): Promise<void> {
  const supabase = createClient();
  await supabase.from("audit_logs").insert({
    action: entry.action,
    ticket_id: entry.ticketId ?? null,
    staff_name: entry.staffName ?? "Admin",
    notes: entry.notes ?? null,
  });
}

// ─── Service Types ────────────────────────────────────────────────────────────

export async function fetchServiceTypes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) { console.error("[db] fetchServiceTypes:", error.message); return []; }
  return data ?? [];
}

export async function upsertServiceType(service: {
  id?: string;
  name: string;
  description: string;
  price: number;
  pricingType: string;
  isActive: boolean;
}) {
  const supabase = createClient();
  const payload = {
    name: service.name,
    description: service.description,
    price: service.price,
    pricing_type: service.pricingType,
    is_active: service.isActive,
  };
  if (service.id) {
    const { error } = await supabase.from("service_types").update(payload).eq("id", service.id);
    if (error) console.error("[db] upsertServiceType update:", error.message);
  } else {
    const { error } = await supabase.from("service_types").insert(payload);
    if (error) console.error("[db] upsertServiceType insert:", error.message);
  }
}

export async function deleteServiceType(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("service_types").delete().eq("id", id);
  if (error) console.error("[db] deleteServiceType:", error.message);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function fetchSetting(key: string) {
  const supabase = createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

export async function upsertSetting(key: string, value: unknown) {
  const supabase = createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) console.error("[db] upsertSetting:", error.message);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false });
  if (error) { console.error("[db] fetchNotifications:", error.message); return []; }
  return data ?? [];
}

export async function dismissNotification(id: string) {
  const supabase = createClient();
  await supabase.from("notifications").update({ is_dismissed: true }).eq("id", id);
}
