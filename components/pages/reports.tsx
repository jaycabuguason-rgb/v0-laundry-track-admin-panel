"use client";

import { useState } from "react";
import { Download, FileText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  weeklyRevenueData, peakHoursData, busyDayData, serviceRevenueData, transactions,
} from "@/lib/data";

const unclaimedItems = transactions.filter((t) => t.status === "Ready");

const summaryCards = [
  { label: "Total Transactions", value: transactions.length, sub: "All time" },
  { label: "Total kg Processed", value: `${transactions.reduce((s, t) => s + t.weight, 0).toFixed(1)} kg`, sub: "All time" },
  { label: "Total Revenue", value: `₱${transactions.reduce((s, t) => s + t.fee, 0).toLocaleString()}`, sub: "All time" },
  { label: "Unclaimed Count", value: unclaimedItems.length, sub: "Currently waiting" },
];

export default function ReportsPage() {
  const [revenueRange, setRevenueRange] = useState<"day" | "week" | "month">("week");

  return (
    <Tabs defaultValue="daily" className="space-y-4">
      <TabsList className="bg-muted/40 h-9">
        {[
          { value: "daily", label: "Daily Summary" },
          { value: "revenue", label: "Revenue Report" },
          { value: "unclaimed", label: "Unclaimed Items" },
          { value: "peak", label: "Peak Hours" },
          { value: "export", label: "Export" },
        ].map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="text-xs h-7 px-3">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Daily Summary */}
      <TabsContent value="daily" className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((c) => (
            <Card key={c.label} className="border border-border shadow-none">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Transactions — April 5, 2026</CardTitle>
              <Input type="date" defaultValue="2026-04-05" className="w-40 h-8 text-xs" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Ticket ID", "Customer", "Type", "Weight", "Fee", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.filter((t) => t.dropOffDate === "2026-04-05").map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-xs font-mono text-primary">{t.ticketId}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-foreground">{t.customerName}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.washType}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.weight} kg</td>
                    <td className="px-4 py-2.5 text-xs font-medium">₱{t.fee}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Revenue Report */}
      <TabsContent value="revenue" className="space-y-4">
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-semibold">Revenue Over Time</CardTitle>
              <div className="flex gap-1">
                {(["day", "week", "month"] as const).map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    variant={revenueRange === r ? "default" : "outline"}
                    className="h-7 text-xs capitalize"
                    onClick={() => setRevenueRange(r)}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyRevenueData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip formatter={(v: number) => [`₱${v}`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Breakdown by Service Type</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Service Type", "Transactions", "Revenue", "Avg. per Order"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {serviceRevenueData.map((r) => (
                  <tr key={r.service} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{r.service}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.count}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-green-700">₱{r.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">₱{Math.round(r.revenue / r.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Unclaimed Items */}
      <TabsContent value="unclaimed">
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Unclaimed Items ({unclaimedItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Ticket ID", "Customer Name", "Contact", "Drop-off Date", "Days Waiting", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unclaimedItems.map((t) => {
                  const daysWaiting = Math.floor((new Date("2026-04-05").getTime() - new Date(t.dropOffDate).getTime()) / 86400000);
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-xs font-mono text-primary">{t.ticketId}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{t.customerName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.phone}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.dropOffDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${daysWaiting > 1 ? "text-orange-600" : "text-muted-foreground"}`}>
                          {daysWaiting} day{daysWaiting !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" className="h-7 text-xs flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Contact
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Peak Hours */}
      <TabsContent value="peak" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Transactions per Hour</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={peakHoursData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Busiest Day of Week</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={busyDayData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="count" fill="#60a5fa" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Export */}
      <TabsContent value="export">
        <Card className="border border-border shadow-none max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Export Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">From Date</label>
                <Input type="date" defaultValue="2026-04-01" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">To Date</label>
                <Input type="date" defaultValue="2026-04-05" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">Report Type</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>All Transactions</option>
                <option>Revenue Report</option>
                <option>Unclaimed Items</option>
                <option>Loyalty Report</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button size="sm" className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Export as PDF
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}


