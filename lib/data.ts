export type TransactionStatus = "Received" | "Washing" | "Drying" | "Ready" | "Claimed";

export interface Transaction {
  id: string;
  ticketId: string;
  customerName: string;
  phone: string;
  dropOffDate: string;
  washType: string;
  weight: number;
  fee: number;
  status: TransactionStatus;
  addOns: string[];
  washInstructions?: string;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  phone: string;
  stampCount: number;
  rewardsRedeemed: number;
  dateJoined: string;
  stampHistory: { date: string; stamps: number; ticket: string }[];
  rewardHistory: { date: string; reward: string }[];
  preferences: string;
}

export interface AuditLog {
  id: string;
  dateTime: string;
  ticketId: string;
  action: "Scanned" | "Claimed" | "Denied" | "Override";
  staff: string;
  notes: string;
}

export const transactions: Transaction[] = [
  { id: "1", ticketId: "TKT-0001", customerName: "Maria Santos", phone: "09171234567", dropOffDate: "2026-04-05", washType: "Regular", weight: 5.2, fee: 156, status: "Ready", addOns: ["Fabcon"], washInstructions: "Cold water only" },
  { id: "2", ticketId: "TKT-0002", customerName: "Jose Reyes", phone: "09281234567", dropOffDate: "2026-04-05", washType: "Express", weight: 3.8, fee: 228, status: "Washing", addOns: ["Fabcon", "Bleach"] },
  { id: "3", ticketId: "TKT-0003", customerName: "Ana Cruz", phone: "09351234567", dropOffDate: "2026-04-05", washType: "Delicate", weight: 2.1, fee: 105, status: "Drying", addOns: [] },
  { id: "4", ticketId: "TKT-0004", customerName: "Pedro Bautista", phone: "09461234567", dropOffDate: "2026-04-04", washType: "Regular", weight: 7.5, fee: 225, status: "Claimed", addOns: ["Fabcon"] },
  { id: "5", ticketId: "TKT-0005", customerName: "Rosa Dela Cruz", phone: "09571234567", dropOffDate: "2026-04-04", washType: "Express", weight: 4.0, fee: 240, status: "Ready", addOns: ["Bleach"] },
  { id: "6", ticketId: "TKT-0006", customerName: "Carlos Garcia", phone: "09681234567", dropOffDate: "2026-04-04", washType: "Regular", weight: 6.3, fee: 189, status: "Received", addOns: [] },
  { id: "7", ticketId: "TKT-0007", customerName: "Lita Mendoza", phone: "09791234567", dropOffDate: "2026-04-03", washType: "Delicate", weight: 1.8, fee: 90, status: "Claimed", addOns: ["Fabcon"] },
  { id: "8", ticketId: "TKT-0008", customerName: "Ramon Torres", phone: "09821234567", dropOffDate: "2026-04-03", washType: "Regular", weight: 8.1, fee: 243, status: "Ready", addOns: [] },
  { id: "9", ticketId: "TKT-0009", customerName: "Gloria Aquino", phone: "09931234567", dropOffDate: "2026-04-05", washType: "Express", weight: 3.5, fee: 210, status: "Washing", addOns: ["Fabcon", "Starch"] },
  { id: "10", ticketId: "TKT-0010", customerName: "Eduardo Lim", phone: "09041234567", dropOffDate: "2026-04-05", washType: "Regular", weight: 5.9, fee: 177, status: "Received", addOns: [] },
];

export const loyaltyMembers: LoyaltyMember[] = [
  { id: "1", name: "Maria Santos", phone: "09171234567", stampCount: 12, rewardsRedeemed: 1, dateJoined: "2025-10-15", stampHistory: [{ date: "2026-04-05", stamps: 1, ticket: "TKT-0001" }, { date: "2026-03-20", stamps: 1, ticket: "TKT-0089" }], rewardHistory: [{ date: "2026-01-10", reward: "Free Wash" }], preferences: "Cold water, no bleach" },
  { id: "2", name: "Jose Reyes", phone: "09281234567", stampCount: 7, rewardsRedeemed: 0, dateJoined: "2025-11-02", stampHistory: [{ date: "2026-04-05", stamps: 1, ticket: "TKT-0002" }], rewardHistory: [], preferences: "Regular wash" },
  { id: "3", name: "Rosa Dela Cruz", phone: "09571234567", stampCount: 21, rewardsRedeemed: 3, dateJoined: "2025-08-20", stampHistory: [{ date: "2026-04-04", stamps: 1, ticket: "TKT-0005" }], rewardHistory: [{ date: "2026-03-01", reward: "Free Wash" }, { date: "2026-01-15", reward: "Free Fabcon" }], preferences: "Express only" },
  { id: "4", name: "Carlos Garcia", phone: "09681234567", stampCount: 4, rewardsRedeemed: 0, dateJoined: "2026-01-10", stampHistory: [{ date: "2026-04-04", stamps: 1, ticket: "TKT-0006" }], rewardHistory: [], preferences: "" },
  { id: "5", name: "Eduardo Lim", phone: "09041234567", stampCount: 9, rewardsRedeemed: 1, dateJoined: "2025-12-05", stampHistory: [], rewardHistory: [{ date: "2026-02-14", reward: "Free Wash" }], preferences: "Delicate care" },
];

export const auditLogs: AuditLog[] = [
  { id: "1", dateTime: "2026-04-05 10:32", ticketId: "TKT-0004", action: "Claimed", staff: "Admin", notes: "Normal claim" },
  { id: "2", dateTime: "2026-04-05 09:15", ticketId: "TKT-0007", action: "Scanned", staff: "Staff01", notes: "" },
  { id: "3", dateTime: "2026-04-04 16:45", ticketId: "TKT-0003", action: "Denied", staff: "Staff01", notes: "Wrong person" },
  { id: "4", dateTime: "2026-04-04 14:20", ticketId: "TKT-0002", action: "Override", staff: "Admin", notes: "Customer lost ticket, ID verified" },
  { id: "5", dateTime: "2026-04-04 11:05", ticketId: "TKT-0001", action: "Scanned", staff: "Staff02", notes: "" },
];

export const peakHoursData = [
  { hour: "7AM", count: 3 },
  { hour: "8AM", count: 8 },
  { hour: "9AM", count: 12 },
  { hour: "10AM", count: 18 },
  { hour: "11AM", count: 15 },
  { hour: "12PM", count: 10 },
  { hour: "1PM", count: 7 },
  { hour: "2PM", count: 9 },
  { hour: "3PM", count: 14 },
  { hour: "4PM", count: 16 },
  { hour: "5PM", count: 11 },
  { hour: "6PM", count: 6 },
];

export const weeklyRevenueData = [
  { day: "Mon", revenue: 1820 },
  { day: "Tue", revenue: 2340 },
  { day: "Wed", revenue: 1950 },
  { day: "Thu", revenue: 2780 },
  { day: "Fri", revenue: 3210 },
  { day: "Sat", revenue: 4150 },
  { day: "Sun", revenue: 2890 },
];

export const busyDayData = [
  { day: "Mon", count: 28 },
  { day: "Tue", count: 35 },
  { day: "Wed", count: 30 },
  { day: "Thu", count: 42 },
  { day: "Fri", count: 50 },
  { day: "Sat", count: 68 },
  { day: "Sun", count: 45 },
];

export const serviceRevenueData = [
  { service: "Regular", revenue: 8450, count: 42 },
  { service: "Express", revenue: 6720, count: 28 },
  { service: "Delicate", revenue: 3200, count: 16 },
];

export const statusColors: Record<TransactionStatus, string> = {
  Received: "bg-blue-100 text-blue-700",
  Washing: "bg-yellow-100 text-yellow-700",
  Drying: "bg-orange-100 text-orange-700",
  Ready: "bg-green-100 text-green-700",
  Claimed: "bg-gray-100 text-gray-600",
};

export const statusOrder: TransactionStatus[] = ["Received", "Washing", "Drying", "Ready", "Claimed"];
