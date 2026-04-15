"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user };
}

export async function signUp(email: string, password: string, fullName: string, username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      data: { full_name: fullName, username },
    },
  });
  if (error) return { error: error.message };
  return { user: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function resetPasswordEmail(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  // Re-authenticate with the current password first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Current password is incorrect." };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateEmail(currentPassword: string, newEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };
  // Re-authenticate before updating email
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Current password is incorrect." };
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateProfile(updates: { full_name?: string; phone_number?: string; username?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function getTransactions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function createTransaction(tx: {
  ticket_id: string;
  customer_name: string;
  phone_number?: string;
  member_id?: string;
  wash_type: string;
  weight_kg?: number;
  addons?: string[];
  special_instructions?: string;
  fee: number;
  status?: string;
  arrival_time?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("transactions").insert(tx).select().single();
  if (error) return { error: error.message };
  revalidatePath("/");
  return { data };
}

export async function updateTransactionStatus(id: string, status: string, voidReason?: string) {
  const supabase = await createClient();
  const updates: Record<string, string> = { status };
  if (voidReason) updates.void_reason = voidReason;
  const { error } = await supabase.from("transactions").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateTransactionPayment(id: string, payment_status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update({ payment_status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── Loyalty Members ───────────────────────────────────────────────────────────

export async function getLoyaltyMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*, stamp_history(*), reward_history(*)")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function createLoyaltyMember(member: {
  full_name: string;
  phone_number: string;
  preferences?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("loyalty_members").insert(member).select().single();
  if (error) return { error: error.message };
  revalidatePath("/");
  return { data };
}

export async function updateLoyaltyMember(id: string, updates: {
  full_name?: string;
  phone_number?: string;
  preferences?: string;
  stamp_count?: number;
  rewards_redeemed?: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("loyalty_members").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function addStamp(memberId: string, transactionId?: string) {
  const supabase = await createClient();
  // Insert stamp history record
  await supabase.from("stamp_history").insert({
    member_id: memberId,
    transaction_id: transactionId ?? null,
    stamps_added: 1,
  });
  // Increment stamp count
  const { data: member } = await supabase
    .from("loyalty_members")
    .select("stamp_count")
    .eq("id", memberId)
    .single();
  if (member) {
    await supabase
      .from("loyalty_members")
      .update({ stamp_count: member.stamp_count + 1 })
      .eq("id", memberId);
  }
  revalidatePath("/");
  return { success: true };
}

export async function redeemReward(memberId: string, rewardType: string) {
  const supabase = await createClient();
  await supabase.from("reward_history").insert({ member_id: memberId, reward_type: rewardType });
  const { data: member } = await supabase
    .from("loyalty_members")
    .select("rewards_redeemed")
    .eq("id", memberId)
    .single();
  if (member) {
    await supabase
      .from("loyalty_members")
      .update({ rewards_redeemed: member.rewards_redeemed + 1 })
      .eq("id", memberId);
  }
  revalidatePath("/");
  return { success: true };
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function getAuditLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function createAuditLog(log: {
  ticket_id: string;
  action: string;
  staff_name: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert(log);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function dismissNotification(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_dismissed: true }).eq("id", id);
  revalidatePath("/");
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSetting(key: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function upsertSetting(key: string, value: unknown) {
  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}
