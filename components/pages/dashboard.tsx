"use client";

import { useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Loader2,
  Users,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { transactions, peakHoursData, statusColors, loyaltyMembers, type Transaction } from "@/lib/data";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const todayTxns = transactions.filter((t) => t.dropOffDate === "2026-04-05");
const totalRevenue = todayTxns.reduce((s, t) => s + t.fee, 0);
const unclaimed = transactions.filter((t) => t.status === "Ready").length;
const activeOrders = transactions.filter(
  (t) => t.status === "Received" || t.status === "Washing" || t.status === "Drying"
).length;

const summaryCards = [
  {
    label: "Total Transactions Today",
    value: todayTxns.length,
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-50",
    change: "+3 from yesterday",
  },
  {
    label: "Total Revenue Today",
    value: `₱${totalRevenue.toLocaleString()}`,
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
    change: "+12% vs yesterday",
  },
  {
    label: "Unclaimed Items",
    value: unclaimed,
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-50",
    change: "Ready for pickup",
  },
  {
    label: "Active Orders",
    value: activeOrders,
    icon: Loader2,
    color: "text-purple-600",
    bg: "bg-purple-50",
    change: "In progress",
  },
];

export default function DashboardPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setDetailOpen(true);
  };

  return (
    <>
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards — 1 col mobile, 2 col sm, 4 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border border-border shadow-none">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium leading-tight">{card.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
                  </div>
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0 ml-3`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-3 px-4 md:px-5 pt-4 md:pt-5">
              <CardTitle className="text-sm font-semibold text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-y border-border bg-muted/40">
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 md:px-5 py-2.5">Ticket ID</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Customer</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Drop-off</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Type</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 pr-4 md:pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 6).map((txn) => (
                      <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 md:px-5 py-3 text-xs font-mono font-medium text-primary">{txn.ticketId}</td>
                        <td className="px-3 py-3 text-xs font-medium text-foreground">{txn.customerName}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{txn.dropOffDate}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">{txn.washType}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[txn.status]}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 pr-4 md:pr-5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:h-7 md:w-7"
                            onClick={() => openDetail(txn)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Peak Hours Chart */}
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-2 px-4 md:px-5 pt-4 md:pt-5">
              <CardTitle className="text-sm font-semibold text-foreground">Peak Hours Today</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-3 pb-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={peakHoursData} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={20} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                    cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Loyalty Members Card */}
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Loyalty Members</p>
                  <p className="text-2xl font-bold text-foreground">{loyaltyMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Active enrolled members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* Transaction Detail Modal */}
    <TransactionDetailModal
      open={detailOpen}
      onOpenChange={setDetailOpen}
      transaction={selectedTransaction}
    />
    </>
  );
}
