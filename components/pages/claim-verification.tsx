"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, ShieldAlert, AlertTriangle, Printer } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintReceiptModal } from "@/components/print-receipt-modal";
import { auditLogs as initialLogs, statusColors, type AuditLog, type Transaction, type PaymentStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ClaimVerificationPageProps {
  transactions: Transaction[];
  onUpdateTransaction: (ticketId: string, updates: Partial<Transaction>) => void;
}

export default function ClaimVerificationPage({ transactions, onUpdateTransaction }: ClaimVerificationPageProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Transaction | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [denyMode, setDenyMode] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentToggle, setPaymentToggle] = useState<PaymentStatus>("unpaid");
  const [reprintModalOpen, setReprintModalOpen] = useState(false);
  const [reprintTransaction, setReprintTransaction] = useState<Transaction | null>(null);

  // Update result when transactions change
  useEffect(() => {
    if (result) {
      const updated = transactions.find((t) => t.ticketId === result.ticketId);
      if (updated) {
        setResult(updated);
        setPaymentToggle(updated.paymentStatus);
      }
    }
  }, [transactions, result]);

  // Set payment toggle when result changes
  useEffect(() => {
    if (result) {
      setPaymentToggle(result.paymentStatus);
    }
  }, [result]);

  const handleSearch = () => {
    const found = transactions.find(
      (t) =>
        t.ticketId.toLowerCase() === query.toLowerCase() ||
        t.customerName.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setResult(found);
      setPaymentToggle(found.paymentStatus);
      setNotFound(false);
      addLog(found.ticketId, "Scanned", "Via Manual Search", found.paymentStatus, found.customerName);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const addLog = (ticketId: string, action: AuditLog["action"], notes: string, paymentStatus?: PaymentStatus, customerName?: string) => {
    const newLog: AuditLog = {
      id: String(Date.now()),
      dateTime: new Date().toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" }),
      ticketId,
      action,
      staff: "Admin",
      notes,
      paymentStatus,
      customerName,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClaim = (isQRScan = false) => {
    if (!result) return;
    
    // Update transaction status to Claimed AND payment status
    onUpdateTransaction(result.ticketId, { 
      status: "Claimed",
      paymentStatus: paymentToggle 
    });
    
    // Log the action
    const notes = isQRScan ? "Via QR Scan" : "Via Manual Search";
    addLog(result.ticketId, "Claimed", notes, paymentToggle, result.customerName);
    
    // Show success message
    const paymentLabel = paymentToggle === "paid" ? "Paid" : "Unpaid";
    setSuccessMessage(`${result.ticketId} claimed. Payment marked as ${paymentLabel}.`);
    
    // Clear after 3 seconds
    setTimeout(() => {
      setResult(null);
      setQuery("");
      setSuccessMessage("");
    }, 3000);
  };

  const handleDeny = () => {
    if (!result) return;
    setDenyMode(true);
  };

  const confirmDeny = () => {
    if (!result) return;
    addLog(result.ticketId, "Denied", denyReason || "No reason provided", result.paymentStatus, result.customerName);
    setDenyMode(false);
    setDenyReason("");
    setResult(null);
    setQuery("");
  };

  const handleReprintReceipt = () => {
    if (!result) return;
    // Create a copy with the current payment toggle selection
    const txnForPrint: Transaction = {
      ...result,
      paymentStatus: paymentToggle,
    };
    setReprintTransaction(txnForPrint);
    setReprintModalOpen(true);
  };

  const actionBadgeColor = (action: AuditLog["action"]) => {
    switch (action) {
      case "Claimed": return "bg-green-100 text-green-700";
      case "Denied": return "bg-red-100 text-red-700";
      case "Override": return "bg-orange-100 text-orange-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const isAlreadyClaimed = result?.status === "Claimed";
  const isNotReady = result && result.status !== "Ready" && result.status !== "Claimed";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Success Banner */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* QR + Manual — stack on mobile, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* QR Scanner */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner
              onScan={(ticketId) => {
                setQuery(ticketId);
                const found = transactions.find(
                  (t) => t.ticketId.toLowerCase() === ticketId.toLowerCase()
                );
                if (found) {
                  setResult(found);
                  setPaymentToggle(found.paymentStatus);
                  setNotFound(false);
                  addLog(found.ticketId, "Scanned", "Via QR Scan", found.paymentStatus, found.customerName);
                } else {
                  setResult(null);
                  setNotFound(true);
                }
              }}
            />
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
                  className="pl-9 h-10 md:h-9 text-sm"
                />
              </div>
              <Button size="sm" onClick={handleSearch} className="min-h-[44px] md:min-h-0 px-4">Search</Button>
            </div>

            {notFound && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600 text-center">
                No ticket found for &quot;{query}&quot;
              </div>
            )}

            {result && (
              <div className="rounded-lg border border-border p-3 md:p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Ticket ID",           value: result.ticketId,        span: false },
                    { label: "Customer",            value: result.customerName,    span: false },
                    { label: "Drop-off Date",       value: result.dropOffDate,     span: false },
                    { label: "Wash Type",           value: result.washType,        span: false },
                  ].map((r) => (
                    <div key={r.label} className={`bg-muted/30 rounded p-2.5${r.span ? " col-span-2" : ""}`}>
                      <p className="text-[11px] text-muted-foreground">{r.label}</p>
                      <p className="font-medium text-xs text-foreground mt-0.5">{r.value}</p>
                    </div>
                  ))}
                  <div className="bg-muted/30 rounded p-2.5">
                    <p className="text-[11px] text-muted-foreground">Total Fee</p>
                    <p className="font-medium text-xs text-foreground mt-0.5">₱{result.fee.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", statusColors[result.status])}>
                      {result.status}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">Payment:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[11px] font-bold uppercase",
                      result.paymentStatus === "paid" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {result.paymentStatus}
                    </span>
                  </div>

                  {/* Payment Status Toggle */}
                  {!isAlreadyClaimed && (
                    <div className="border border-border rounded-lg p-2.5 bg-muted/20">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Update Payment Status</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={paymentToggle === "unpaid" ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-8 text-xs",
                            paymentToggle === "unpaid" && "bg-red-500 hover:bg-red-600 text-white"
                          )}
                          onClick={() => setPaymentToggle("unpaid")}
                        >
                          Unpaid
                        </Button>
                        <Button
                          size="sm"
                          variant={paymentToggle === "paid" ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-8 text-xs",
                            paymentToggle === "paid" && "bg-green-500 hover:bg-green-600 text-white"
                          )}
                          onClick={() => setPaymentToggle("paid")}
                        >
                          Paid
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guard: Already Claimed */}
                {isAlreadyClaimed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-semibold">Already Claimed</p>
                      <p className="text-xs mt-0.5">This ticket has already been claimed.</p>
                    </div>
                  </div>
                )}

                {/* Guard: Not Ready */}
                {isNotReady && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-semibold">Not Ready for Pickup</p>
                      <p className="text-xs mt-0.5">Current status: {result.status}</p>
                    </div>
                  </div>
                )}

                {!denyMode ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {!isAlreadyClaimed && (
                        <Button
                          size="sm"
                          className={cn(
                            "flex items-center gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0 justify-center",
                            isNotReady 
                              ? "bg-orange-600 hover:bg-orange-700 text-white" 
                              : "bg-green-600 hover:bg-green-700 text-white"
                          )}
                          onClick={() => handleClaim(false)}
                        >
                          {isNotReady ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {isNotReady ? "⚠ Claim Anyway" : "✓ Confirm Claim & Save"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0 justify-center border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={handleReprintReceipt}
                      >
                        <Printer className="w-3.5 h-3.5" /> 🖨 Reprint Receipt
                      </Button>
                      {!isAlreadyClaimed && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-1.5 flex-1 sm:flex-none min-h-[44px] sm:min-h-0 justify-center"
                          onClick={handleDeny}
                        >
                          <XCircle className="w-3.5 h-3.5" /> ✗ Deny
                        </Button>
                      )}
                    </div>
                    {isAlreadyClaimed && (
                      <p className="text-xs text-muted-foreground text-center">
                        Ticket already claimed. Use Reprint Receipt to generate a copy.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Textarea
                      placeholder="Reason for denial (optional)..."
                      value={denyReason}
                      onChange={(e) => setDenyReason(e.target.value)}
                      className="text-sm resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="flex-1 min-h-[44px] sm:min-h-0 justify-center" 
                        onClick={confirmDeny}
                      >
                        Confirm Deny
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 min-h-[44px] sm:min-h-0 justify-center" 
                        onClick={() => setDenyMode(false)}
                      >
                        Cancel
                      </Button>
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
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-y border-border bg-muted/40">
                  {["Date / Time", "Ticket ID", "Customer", "Action", "Payment Status", "Staff", "Notes"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.dateTime}</td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">{log.ticketId}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.customerName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", actionBadgeColor(log.action))}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.paymentStatus ? (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-bold uppercase",
                          log.paymentStatus === "paid" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        )}>
                          {log.paymentStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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

      {/* Print Receipt Modal */}
      <PrintReceiptModal
        open={reprintModalOpen}
        onOpenChange={setReprintModalOpen}
        transaction={reprintTransaction}
      />
    </div>
  );
}
