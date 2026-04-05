"use client";

import { useState } from "react";
import { QrCode, Search, CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auditLogs as initialLogs, transactions, statusColors, type AuditLog } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ClaimVerificationPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<(typeof transactions)[0] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [overrideMode, setOverrideMode] = useState(false);
  const [overridePass, setOverridePass] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const handleSearch = () => {
    const found = transactions.find(
      (t) =>
        t.ticketId.toLowerCase() === query.toLowerCase() ||
        t.customerName.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setResult(found);
      setNotFound(false);
      addLog(found.ticketId, "Scanned", "");
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const addLog = (ticketId: string, action: AuditLog["action"], notes: string) => {
    const newLog: AuditLog = {
      id: String(Date.now()),
      dateTime: new Date().toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" }),
      ticketId,
      action,
      staff: "Admin",
      notes,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClaim = () => {
    if (!result) return;
    addLog(result.ticketId, "Claimed", "");
    setResult(null);
    setQuery("");
  };

  const handleDeny = () => {
    if (!result) return;
    addLog(result.ticketId, "Denied", "Not authorized");
    setResult(null);
    setQuery("");
  };

  const handleOverride = () => {
    if (!result) return;
    if (overridePass !== "admin123") {
      alert("Incorrect password");
      return;
    }
    addLog(result.ticketId, "Override", overrideReason);
    setOverrideMode(false);
    setResult(null);
    setQuery("");
    setOverridePass("");
    setOverrideReason("");
  };

  const actionBadgeColor = (action: AuditLog["action"]) => {
    switch (action) {
      case "Claimed": return "bg-green-100 text-green-700";
      case "Denied": return "bg-red-100 text-red-700";
      case "Override": return "bg-orange-100 text-orange-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted/50 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Camera preview area</p>
              <p className="text-xs text-muted-foreground/70">Point QR code at camera to scan</p>
              <Button size="sm" variant="outline" className="mt-1">
                Start Camera
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Lookup */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Manual Lookup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ticket ID or customer name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button size="sm" onClick={handleSearch}>Search</Button>
            </div>

            {notFound && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600 text-center">
                No ticket found for &quot;{query}&quot;
              </div>
            )}

            {result && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Customer", value: result.customerName },
                    { label: "Ticket ID", value: result.ticketId },
                    { label: "Drop-off", value: result.dropOffDate },
                    { label: "Wash Type", value: result.washType },
                  ].map((r) => (
                    <div key={r.label} className="bg-muted/30 rounded p-2.5">
                      <p className="text-[11px] text-muted-foreground">{r.label}</p>
                      <p className="font-medium text-xs text-foreground mt-0.5">{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", statusColors[result.status])}>
                    {result.status}
                  </span>
                </div>

                {!overrideMode ? (
                  <div className="flex gap-2 flex-wrap pt-1">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                      onClick={handleClaim}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Claim
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1.5"
                      onClick={handleDeny}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Deny
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                      onClick={() => setOverrideMode(true)}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Override Release
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Input
                      type="password"
                      placeholder="Enter admin password..."
                      value={overridePass}
                      onChange={(e) => setOverridePass(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Reason for override..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleOverride}>
                        Confirm Override
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setOverrideMode(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Date / Time", "Ticket ID", "Action", "Staff", "Notes"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.dateTime}</td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">{log.ticketId}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", actionBadgeColor(log.action))}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{log.staff}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
