"use client";

import { useState, useMemo, useCallback } from "react";
import { Download, FileText, CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  transactions,
  peakByHour, peakByDayOfWeek, peakByWeekOfMonth, peakByMonth, peakBySeason, peakByYear,
  serviceRevenueData,
  dayRevenueData, weekRevenueData, monthRevenueData,
  prevMonthRevenue,
  serviceRevenueByDay, serviceRevenueByWeek, serviceRevenueByMonth,
  type RevenuePoint,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const unclaimedItems = transactions.filter((t) => t.status === "Ready");

const summaryCards = [
  { label: "Total Transactions", value: transactions.length,                                                                          sub: "All time" },
  { label: "Total kg Processed", value: `${transactions.reduce((s, t) => s + t.weight, 0).toFixed(1)} kg`,                           sub: "All time" },
  { label: "Total Revenue",      value: `₱${transactions.reduce((s, t) => s + t.fee, 0).toLocaleString()}`,                          sub: "All time" },
  { label: "Unclaimed Count",    value: unclaimedItems.length,                                                                        sub: "Currently waiting" },
];

// ── Peak period options ──────────────────────────────────────────────────────
type PeakPeriod = "hour" | "day" | "week" | "month" | "season" | "year";

const peakOptions: { value: PeakPeriod; label: string }[] = [
  { value: "hour",   label: "Hour of Day" },
  { value: "day",    label: "Day of Week" },
  { value: "week",   label: "Week of Month" },
  { value: "month",  label: "Month of Year" },
  { value: "season", label: "Season" },
  { value: "year",   label: "Yearly" },
];

const peakDataMap: Record<PeakPeriod, { label: string; count: number }[]> = {
  hour:   peakByHour,
  day:    peakByDayOfWeek,
  week:   peakByWeekOfMonth,
  month:  peakByMonth,
  season: peakBySeason,
  year:   peakByYear,
};

const peakAxisLabel: Record<PeakPeriod, string> = {
  hour:   "Hour",
  day:    "Day",
  week:   "Week",
  month:  "Month",
  season: "Season",
  year:   "Year",
};

// ── Export options ────────────────────────────────────────────────────────────
const exportOptions = [
  { id: "transactions", label: "Transactions" },
  { id: "analytics",   label: "Analytics / Revenue Report" },
  { id: "customers",   label: "Customer List (Loyalty Members)" },
];

export default function ReportsPage() {
  const [revenueRange, setRevenueRange] = useState<"day" | "week" | "month">("week");

  // Day view state
  const [dayDate, setDayDate] = useState<Date>(new Date("2026-04-05"));

  // Week view state — anchor is the Monday of the selected week
  const [weekAnchor, setWeekAnchor] = useState<Date>(new Date("2026-03-30")); // Mon of Apr 5 week
  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(weekAnchor, { weekStartsOn: 1 });

  // Month view state
  const [monthAnchor, setMonthAnchor] = useState<Date>(new Date("2026-04-01"));


  // Derive chart data for the selected range
  const chartData: RevenuePoint[] = useMemo(() => {
    if (revenueRange === "day")   return dayRevenueData;
    if (revenueRange === "week")  return weekRevenueData;
    return monthRevenueData;
  }, [revenueRange]);

  const serviceTableData = useMemo(() => {
    if (revenueRange === "day")   return serviceRevenueByDay;
    if (revenueRange === "week")  return serviceRevenueByWeek;
    return serviceRevenueByMonth;
  }, [revenueRange]);

  // Summary totals
  const totalPaid   = chartData.reduce((s, d) => s + d.paid,   0);
  const totalUnpaid = chartData.reduce((s, d) => s + d.unpaid, 0);
  const totalRev    = totalPaid + totalUnpaid;
  const totalCount  = chartData.reduce((s, d) => s + d.count,  0);
  const avgOrder    = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;

  const bestPoint   = chartData.reduce<RevenuePoint | null>((best, d) => {
    const rev = d.paid + d.unpaid;
    return best === null || rev > best.paid + best.unpaid ? d : best;
  }, null);

  const avgDaily    = chartData.length > 0 ? Math.round(totalRev / chartData.filter((d) => d.paid + d.unpaid > 0).length || chartData.length) : 0;

  // Month-over-month
  const momDiff     = prevMonthRevenue > 0 ? ((totalRev - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
  const momPositive = momDiff >= 0;

  // Custom tooltip for revenue chart
  const RevenueTooltip = useCallback(({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    const paid   = payload.find((p) => p.name === "paid")?.value   ?? 0;
    const unpaid = payload.find((p) => p.name === "unpaid")?.value ?? 0;
    const total  = paid + unpaid;
    const count  = chartData.find((d) => d.label === label)?.count ?? 0;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2.5 text-xs space-y-1 min-w-[160px]">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-foreground font-bold">₱{total.toLocaleString()} <span className="font-normal text-muted-foreground">({count} txns)</span></p>
        <p className="text-green-600">Collected: ₱{paid.toLocaleString()}</p>
        <p className="text-red-500">Pending: ₱{unpaid.toLocaleString()}</p>
      </div>
    );
  }, [chartData]);

  // Per-row claim status for the Unclaimed Items tab
  const [claimStatuses, setClaimStatuses] = useState<Record<string, "unclaimed" | "claimed">>(
    () => Object.fromEntries(unclaimedItems.map((t) => [t.id, "unclaimed"]))
  );

  // Peak
  const [peakPeriod, setPeakPeriod] = useState<PeakPeriod>("hour");
  const peakData    = peakDataMap[peakPeriod];
  const busiest     = peakData.reduce((max, d) => d.count > max.count ? d : max, peakData[0]);
  const periodLabel = peakOptions.find((o) => o.value === peakPeriod)?.label ?? "";

  // Export
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportFromDate, setExportFromDate] = useState<Date>(new Date("2026-04-01"));
  const [exportToDate, setExportToDate]     = useState<Date>(new Date("2026-04-05"));
  const [exportFormat, setExportFormat]     = useState<"pdf" | "csv">("pdf");

  const exportFrom = format(exportFromDate, "yyyy-MM-dd");
  const exportTo   = format(exportToDate,   "yyyy-MM-dd");

  const allSelected  = selectedExports.length === exportOptions.length;
  const someSelected = selectedExports.length > 0 && !allSelected;

  const toggleExport = (id: string) => {
    setSelectedExports((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedExports(allSelected ? [] : exportOptions.map((o) => o.id));
  };

  // ── CSV data ────────────────────────────────────────────────────────────────
  const filteredTxns = transactions.filter((t) => {
    if (!exportFrom || !exportTo) return true;
    return t.dropOffDate >= exportFrom && t.dropOffDate <= exportTo;
  });

  // ── Native CSV export ────────────────────────────────────────────────────────
  const handleCsvExport = () => {
    const escape = (v: string | number) => {
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const rows: (string | number)[][] = [];
    if (selectedExports.includes("transactions")) {
      rows.push(["TRANSACTIONS"]);
      rows.push(["Ticket ID", "Customer", "Phone", "Drop-off", "Wash Type", "Weight (kg)", "Fee (PHP)", "Status"]);
      filteredTxns.forEach((t) =>
        rows.push([t.ticketId, t.customerName, t.phone, t.dropOffDate, t.washType, t.weight, t.fee, t.status])
      );
      rows.push([]);
    }
    if (selectedExports.includes("analytics")) {
      rows.push(["REVENUE BY SERVICE TYPE"]);
      rows.push(["Service", "Transactions", "Revenue (PHP)", "Avg per Order (PHP)"]);
      serviceRevenueData.forEach((r) =>
        rows.push([r.service, r.count, r.revenue, Math.round(r.revenue / r.count)])
      );
      rows.push([]);
    }
    if (selectedExports.includes("customers")) {
      rows.push(["CUSTOMER LIST"]);
      rows.push(["Name", "Phone", "Total Transactions", "Total Spent (PHP)"]);
      const seen = new Set<string>();
      filteredTxns.forEach((t) => {
        if (!seen.has(t.phone)) {
          seen.add(t.phone);
          const custTxns = filteredTxns.filter((x) => x.phone === t.phone);
          rows.push([t.customerName, t.phone, custTxns.length, custTxns.reduce((s, x) => s + x.fee, 0)]);
        }
      });
    }
    const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laundrytrack-report-${exportFrom}-${exportTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── @react-pdf/renderer PDF export ───────────────────────────────────────────
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handlePdfExport = async () => {
    if (pdfGenerating) return;
    setPdfGenerating(true);
    try {
      const { downloadReportPdf } = await import("@/components/report-pdf");
      await downloadReportPdf({
        exportFrom,
        exportTo,
        sections: selectedExports as ("transactions" | "analytics" | "customers")[],
        transactions: filteredTxns,
        serviceRevenue: serviceRevenueData,
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  const [summaryDate, setSummaryDate] = useState<Date>(new Date("2026-04-05"));

  return (
    <Tabs defaultValue="daily" className="space-y-4">
      {/* Tabs scroll horizontally on small screens */}
      <div className="overflow-x-auto pb-0.5">
        <TabsList className="bg-muted/40 h-9 w-max min-w-full">
          {[
            { value: "daily",     label: "Daily Summary" },
            { value: "revenue",   label: "Revenue Report" },
            { value: "unclaimed", label: "Unclaimed Items" },
            { value: "peak",      label: "Peak Analysis" },
            { value: "export",    label: "Export" },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs h-7 px-3 whitespace-nowrap">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* ── Daily Summary ──────────────────────────────────────────────────── */}
      <TabsContent value="daily" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              <CardTitle className="text-sm font-semibold">
                Transactions — {format(summaryDate, "MMMM d, yyyy")}
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-8 text-xs gap-1.5 px-2.5">
                    <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                    {format(summaryDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={summaryDate} onSelect={(d) => d && setSummaryDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="border-y border-border bg-muted/40">
                    {["Ticket ID", "Customer", "Arrival Date & Time", "Type", "Weight", "Fee", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter((t) => t.dropOffDate === format(summaryDate, "yyyy-MM-dd")).map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-xs font-mono text-primary">{t.ticketId}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-foreground">{t.customerName}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{t.arrivalDateTime}</td>
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
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Revenue Report ─────────────────────────────────────────────────── */}
      <TabsContent value="revenue" className="space-y-4">

        {/* Main chart card */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">

              {/* Left: title + paid/unpaid legend */}
              <div className="space-y-1.5">
                <CardTitle className="text-sm font-semibold">
                  {revenueRange === "day"
                    ? `Today's Revenue — ${format(dayDate, "MMMM d, yyyy")}`
                    : revenueRange === "week"
                    ? `This Week's Revenue — ${format(weekStart, "MMM d")}–${format(weekEnd, "MMM d, yyyy")}`
                    : `This Month's Revenue — ${format(monthAnchor, "MMMM yyyy")}`}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    <span className="text-green-700 font-medium">Collected (Paid): ₱{totalPaid.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    <span className="text-red-600 font-medium">Pending (Unpaid): ₱{totalUnpaid.toLocaleString()}</span>
                  </span>
                  <span className="font-bold text-foreground">Total: ₱{totalRev.toLocaleString()}</span>
                </div>
              </div>

              {/* Right: toggle + period picker */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Day/Week/Month toggle */}
                <div className="flex gap-1">
                  {(["day", "week", "month"] as const).map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={revenueRange === r ? "default" : "outline"}
                      className="h-7 text-xs capitalize"
                      onClick={() => setRevenueRange(r)}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Day picker */}
                {revenueRange === "day" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-7 text-xs gap-1.5 px-2.5">
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                        {format(dayDate, "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="single" selected={dayDate} onSelect={(d) => d && setDayDate(d)} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}

                {/* Week picker */}
                {revenueRange === "week" && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setWeekAnchor((w) => subWeeks(w, 1))}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-1 whitespace-nowrap">
                      {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
                    </span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setWeekAnchor((w) => addWeeks(w, 1))}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {/* Month picker */}
                {revenueRange === "month" && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setMonthAnchor((m) => subMonths(m, 1))}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-1 whitespace-nowrap">
                      {format(monthAnchor, "MMMM yyyy")}
                    </span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setMonthAnchor((m) => addMonths(m, 1))}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                barSize={revenueRange === "month" ? 14 : revenueRange === "week" ? 28 : 20}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={revenueRange === "month" ? 1 : 0}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₱${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="paid"   name="paid"   stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="unpaid" name="unpaid" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className={cn(
          "grid gap-3",
          revenueRange === "day"   && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
          revenueRange === "week"  && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
          revenueRange === "month" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-7",
        )}>
          {/* Cards common to all periods */}
          <Card className="border border-border shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">
                {revenueRange === "day" ? "Total Revenue Today" : revenueRange === "week" ? "Total Revenue This Week" : "Total Revenue This Month"}
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">₱{totalRev.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">
                {revenueRange === "day" ? "Transactions Today" : revenueRange === "week" ? "Transactions This Week" : "Transactions This Month"}
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">{totalCount}</p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Paid Transactions</p>
              <p className="text-lg font-bold text-green-600 mt-0.5">₱{totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Unpaid Transactions</p>
              <p className="text-lg font-bold text-red-500 mt-0.5">₱{totalUnpaid.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Day-specific */}
          {revenueRange === "day" && (
            <Card className="border border-border shadow-none">
              <CardContent className="p-4">
                <p className="text-[11px] text-muted-foreground">Avg. Order Value</p>
                <p className="text-lg font-bold text-foreground mt-0.5">₱{avgOrder.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          {/* Week-specific */}
          {revenueRange === "week" && (
            <>
              <Card className="border border-border shadow-none">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">Best Day</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{bestPoint?.label ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground">₱{bestPoint ? (bestPoint.paid + bestPoint.unpaid).toLocaleString() : 0}</p>
                </CardContent>
              </Card>
              <Card className="border border-border shadow-none">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">Avg. Daily Revenue</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">₱{avgDaily.toLocaleString()}</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Month-specific */}
          {revenueRange === "month" && (
            <>
              <Card className="border border-border shadow-none">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">Best Day</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {format(monthAnchor, "MMM")} {bestPoint?.label ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">₱{bestPoint ? (bestPoint.paid + bestPoint.unpaid).toLocaleString() : 0}</p>
                </CardContent>
              </Card>
              <Card className="border border-border shadow-none">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">Avg. Daily Revenue</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">₱{avgDaily.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border border-border shadow-none">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">vs. Last Month</p>
                  <p className={cn("text-lg font-bold mt-0.5 flex items-center gap-1", momPositive ? "text-green-600" : "text-red-500")}>
                    {momPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {momPositive ? "+" : ""}{momDiff.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">vs ₱{prevMonthRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Breakdown by Service Type */}
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
                {serviceTableData.map((r) => (
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

      {/* ── Unclaimed Items ────────────────────────────���────────────────────── */}
      <TabsContent value="unclaimed">
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Unclaimed Items ({unclaimedItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/40">
                    {["Ticket ID", "Customer Name", "Contact", "Arrival Date & Time", "Days Waiting", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unclaimedItems.map((t) => {
                    const daysWaiting = Math.floor((new Date("2026-04-05").getTime() - new Date(t.dropOffDate).getTime()) / 86400000);
                    const isClaimed = claimStatuses[t.id] === "claimed";
                    return (
                      <tr
                        key={t.id}
                        className={cn(
                          "border-b border-border last:border-0 transition-colors",
                          isClaimed ? "bg-muted/30 opacity-50" : "hover:bg-muted/20"
                        )}
                      >
                        <td className={cn("px-4 py-3 text-xs font-mono text-primary", isClaimed && "line-through")}>{t.ticketId}</td>
                        <td className={cn("px-4 py-3 text-xs font-medium text-foreground", isClaimed && "line-through")}>{t.customerName}</td>
                        <td className={cn("px-4 py-3 text-xs text-muted-foreground", isClaimed && "line-through")}>{t.phone}</td>
                        <td className={cn("px-4 py-3 text-xs text-muted-foreground whitespace-nowrap", isClaimed && "line-through")}>{t.arrivalDateTime}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs font-medium", isClaimed ? "text-muted-foreground line-through" : daysWaiting > 1 ? "text-orange-600" : "text-muted-foreground")}>
                            {daysWaiting} day{daysWaiting !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={claimStatuses[t.id]}
                            onValueChange={(v) =>
                              setClaimStatuses((prev) => ({ ...prev, [t.id]: v as "unclaimed" | "claimed" }))
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "h-7 w-32 text-[11px] font-medium border",
                                isClaimed
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unclaimed" className="text-xs text-orange-700">
                                Unclaimed
                              </SelectItem>
                              <SelectItem value="claimed" className="text-xs text-green-700">
                                Claimed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Peak Analysis ─────────────────────��────────────────────────────── */}
      <TabsContent value="peak" className="space-y-4">
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-semibold">Peak Analysis</CardTitle>
              <Select value={peakPeriod} onValueChange={(v) => setPeakPeriod(v as PeakPeriod)}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {peakOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pb-4 space-y-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={peakData} barSize={peakData.length > 12 ? 12 : 24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: peakData.length > 12 ? 9 : 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={peakData.length > 12 ? -35 : 0}
                  textAnchor={peakData.length > 12 ? "end" : "middle"}
                  height={peakData.length > 12 ? 40 : 24}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  formatter={(v: number) => [v, "Transactions"]}
                  labelFormatter={(l) => `${peakAxisLabel[peakPeriod]}: ${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 6 }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-4 py-2.5">
              Busiest {peakAxisLabel[peakPeriod].toLowerCase()}:{" "}
              <span className="font-semibold text-foreground">{busiest.label}</span>{" "}
              with{" "}
              <span className="font-semibold text-foreground">{busiest.count}</span> transactions
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Export ─────────────────────────────────────────────────────────── */}
      <TabsContent value="export">
        <Card className="border border-border shadow-none max-w-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Export Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* What to export */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Select Data to Export</p>
              <div className="rounded-md border border-border p-3 space-y-3">
                {/* Select All */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={allSelected}
                    data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                    onCheckedChange={toggleAll}
                    className="shrink-0"
                  />
                  <span className="text-xs font-semibold text-foreground">Select All</span>
                </label>
                <div className="h-px bg-border" />
                {exportOptions.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={selectedExports.includes(opt.id)}
                      onCheckedChange={() => toggleExport(opt.id)}
                      className="shrink-0"
                    />
                    <span className="text-xs text-foreground">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-9 justify-start text-xs font-normal gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {format(exportFromDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={exportFromDate} onSelect={(d) => d && setExportFromDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-9 justify-start text-xs font-normal gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {format(exportToDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={exportToDate} onSelect={(d) => d && setExportToDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Format selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Format</p>
              <div className="flex gap-4">
                {(["pdf", "csv"] as const).map((fmt) => (
                  <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value={fmt}
                      checked={exportFormat === fmt}
                      onChange={() => setExportFormat(fmt)}
                      className="accent-primary"
                    />
                    <span className="text-xs text-foreground uppercase font-medium">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export button */}
            <Button
              size="sm"
              disabled={selectedExports.length === 0 || pdfGenerating}
              className="flex items-center gap-1.5 w-full"
              onClick={exportFormat === "pdf" ? handlePdfExport : handleCsvExport}
            >
              {exportFormat === "pdf"
                ? <FileText className="w-3.5 h-3.5" />
                : <Download className="w-3.5 h-3.5" />}
              {pdfGenerating
                ? "Generating PDF…"
                : `Export as ${exportFormat.toUpperCase()}${selectedExports.length > 0 ? ` (${selectedExports.length} selected)` : ""}`}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
