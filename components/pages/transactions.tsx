"use client";

import { useState } from "react";
import { Search, Eye, Edit, Ban, Printer, ChevronRight, X, QrCode, CalendarIcon, Undo2, Redo2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactions as initialTxns, statusColors, statusOrder, type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm px-5 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200"
      onAnimationEnd={() => setTimeout(onDone, 2800)}
    >
      {message}
    </div>
  );
}

// ── History types ─────────────────────────────────────────────────────────────
type HistoryEntry = {
  prev: Transaction[];
  next: Transaction[];
  description: string;
};

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>(initialTxns);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  // Modals
  const [viewTxn, setViewTxn]         = useState<Transaction | null>(null);
  const [editTxn, setEditTxn]         = useState<Transaction | null>(null);
  const [editInstructions, setEditInstructions] = useState("");
  const [voidTxn, setVoidTxn]         = useState<Transaction | null>(null);
  const [voidReason, setVoidReason]   = useState("");
  const [reprintTxn, setReprintTxn]   = useState<Transaction | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // ── History helpers ──────────────────────────────────────────────────────
  const commit = (nextTxns: Transaction[], description: string) => {
    const entry: HistoryEntry = { prev: txns, next: nextTxns, description };
    const newHistory = [...history.slice(0, historyIdx + 1), entry].slice(-10);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    setTxns(nextTxns);
  };

  const undo = () => {
    if (historyIdx < 0) return;
    setTxns(history[historyIdx].prev);
    setHistoryIdx(historyIdx - 1);
    showToast("Last action undone");
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const next = historyIdx + 1;
    setTxns(history[next].next);
    setHistoryIdx(next);
    showToast("Action re-applied");
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const confirmVoid = () => {
    if (!voidTxn || !voidReason.trim()) return;
    const updated = txns.map((t) =>
      t.id === voidTxn.id ? { ...t, status: "Voided" as const } : t
    );
    commit(updated, `Void ${voidTxn.ticketId}`);
    showToast(`Ticket #${voidTxn.ticketId} has been voided`);
    setVoidTxn(null);
    setVoidReason("");
  };

  const moveToNextStatus = () => {
    if (!editTxn) return;
    const idx = statusOrder.indexOf(editTxn.status as (typeof statusOrder)[number]);
    if (idx < 0 || idx >= statusOrder.length - 1) return;
    const nextStatus = statusOrder[idx + 1];
    const updated = txns.map((t) =>
      t.id === editTxn.id ? { ...t, status: nextStatus, washInstructions: editInstructions || t.washInstructions } : t
    );
    commit(updated, `Status update ${editTxn.ticketId} → ${nextStatus}`);
    setEditTxn({ ...editTxn, status: nextStatus });
    showToast(`Ticket #${editTxn.ticketId} moved to ${nextStatus}`);
  };

  const saveInstructions = () => {
    if (!editTxn) return;
    const updated = txns.map((t) =>
      t.id === editTxn.id ? { ...t, washInstructions: editInstructions } : t
    );
    commit(updated, `Edit instructions ${editTxn.ticketId}`);
    showToast(`Ticket #${editTxn.ticketId} updated`);
    setEditTxn(null);
  };

  const openEdit = (txn: Transaction) => {
    setEditTxn(txn);
    setEditInstructions(txn.washInstructions || "");
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = txns.filter((t) => {
    const matchSearch =
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchDate = !filterDate || t.dropOffDate === format(filterDate, "yyyy-MM-dd");
    return matchSearch && matchStatus && matchDate;
  });

  const editStepIndex = editTxn ? statusOrder.indexOf(editTxn.status as (typeof statusOrder)[number]) : -1;
  const canUndo = historyIdx >= 0;
  const canRedo = historyIdx < history.length - 1;

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-lg p-3 md:p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 md:h-9 text-sm w-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40 h-10 md:h-9 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOrder.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
            <SelectItem value="Voided">Voided</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-44 h-10 md:h-9 text-sm justify-start gap-2 font-normal">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              {filterDate ? format(filterDate, "MMM d, yyyy") : "All dates"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={(d) => setFilterDate(d ?? undefined)}
              initialFocus
            />
            {filterDate && (
              <div className="p-2 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-xs h-7" onClick={() => setFilterDate(undefined)}>
                  Clear date filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Undo / Redo */}
        <div className="flex gap-1.5 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-10 md:h-9 px-3 gap-1.5 text-xs"
            disabled={!canUndo}
            onClick={undo}
            title="Undo last action"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 md:h-9 px-3 gap-1.5 text-xs"
            disabled={!canRedo}
            onClick={redo}
            title="Redo last undone action"
          >
            <Redo2 className="w-3.5 h-3.5" /> Redo
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Ticket ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Customer Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap hidden md:table-cell">Arrival Date & Time</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap hidden sm:table-cell">Weight</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap hidden md:table-cell">Wash Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Fee</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => {
                const isVoided = txn.status === "Voided";
                return (
                  <tr
                    key={txn.id}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      isVoided ? "bg-muted/30 opacity-50" : "hover:bg-muted/20"
                    )}
                  >
                    <td className={cn("px-4 py-3 text-xs font-mono font-semibold text-primary", isVoided && "line-through")}>{txn.ticketId}</td>
                    <td className={cn("px-4 py-3 text-xs font-medium text-foreground", isVoided && "line-through")}>{txn.customerName}</td>
                    <td className={cn("px-4 py-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell", isVoided && "line-through")}>{txn.arrivalDateTime}</td>
                    <td className={cn("px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell", isVoided && "line-through")}>{txn.weight} kg</td>
                    <td className={cn("px-4 py-3 text-xs text-muted-foreground hidden md:table-cell", isVoided && "line-through")}>{txn.washType}</td>
                    <td className={cn("px-4 py-3 text-xs font-medium text-foreground", isVoided && "line-through")}>₱{txn.fee}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap",
                        statusColors[txn.status]
                      )}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewTxn(txn)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" disabled={isVoided} onClick={() => openEdit(txn)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Void"
                          disabled={isVoided}
                          onClick={() => { setVoidTxn(txn); setVoidReason(""); }}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" title="Reprint" onClick={() => setReprintTxn(txn)}>
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW MODAL (read-only) ──────────────────────────────────────────── */}
      <Dialog open={!!viewTxn} onOpenChange={(open) => !open && setViewTxn(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details — {viewTxn?.ticketId}</DialogTitle>
            <DialogDescription>Read-only view of this transaction.</DialogDescription>
          </DialogHeader>
          {viewTxn && (
            <div className="space-y-5">
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Ticket ID",           value: viewTxn.ticketId,                                          span: false },
                  { label: "Customer Name",        value: viewTxn.customerName,                                      span: false },
                  { label: "Arrival Date & Time",  value: viewTxn.arrivalDateTime,                                   span: true  },
                  { label: "Weight (kg)",          value: `${viewTxn.weight} kg`,                                    span: false },
                  { label: "Wash Type",            value: viewTxn.washType,                                          span: false },
                  { label: "Add-ons",              value: viewTxn.addOns.length ? viewTxn.addOns.join(", ") : "None", span: false },
                  { label: "Total Fee",            value: `₱${viewTxn.fee}`,                                         span: false },
                  { label: "ETA",                  value: "Same day",                                                span: false },
                ].map((row) => (
                  <div key={row.label} className={cn("bg-muted/30 rounded-md p-2.5", row.span && "col-span-2")}>
                    <p className="text-[11px] text-muted-foreground">{row.label}</p>
                    <p className="font-medium text-foreground text-xs mt-0.5">{row.value}</p>
                  </div>
                ))}
                {/* Current Status */}
                <div className="col-span-2 bg-muted/30 rounded-md p-2.5">
                  <p className="text-[11px] text-muted-foreground mb-1">Current Status</p>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium", statusColors[viewTxn.status])}>
                    {viewTxn.status}
                  </span>
                </div>
                {/* Wash instructions read-only */}
                {viewTxn.washInstructions && (
                  <div className="col-span-2 bg-muted/30 rounded-md p-2.5">
                    <p className="text-[11px] text-muted-foreground">Wash Instructions</p>
                    <p className="font-medium text-foreground text-xs mt-0.5">{viewTxn.washInstructions}</p>
                  </div>
                )}
              </div>

              {/* Status stepper — read-only */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Status Progress</p>
                <div className="flex items-center">
                  {statusOrder.map((step, idx) => {
                    const stepIdx = statusOrder.indexOf(viewTxn.status as (typeof statusOrder)[number]);
                    const isCompleted = idx < stepIdx;
                    const isCurrent   = idx === stepIdx;
                    const isLast      = idx === statusOrder.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
                            isCompleted || isCurrent ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                          )}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className={cn("text-[9px] mt-1 text-center w-10 md:w-12 leading-tight", isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>
                            {step}
                          </span>
                        </div>
                        {!isLast && <div className={cn("flex-1 h-0.5 mb-4 mx-0.5", isCompleted ? "bg-primary" : "bg-border")} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2 py-2 bg-muted/30 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://laundrytrack.ph/ticket/${viewTxn.ticketId}`)}`}
                  alt={`QR for ${viewTxn.ticketId}`}
                  width={100}
                  height={100}
                  crossOrigin="anonymous"
                />
                <p className="text-[10px] text-muted-foreground font-mono">{viewTxn.ticketId}</p>
              </div>

              {/* View modal actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => { setReprintTxn(viewTxn); setViewTxn(null); }}>
                  <Printer className="w-3.5 h-3.5" /> Reprint QR
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" /> Reprint Claim Stub
                </Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setViewTxn(null)}>
                  <X className="w-3.5 h-3.5 mr-1" /> Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── EDIT MODAL ─────────────────────────────────────────────────────── */}
      <Dialog open={!!editTxn} onOpenChange={(open) => !open && setEditTxn(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket — {editTxn?.ticketId}</DialogTitle>
            <DialogDescription>Update status and wash instructions for this transaction.</DialogDescription>
          </DialogHeader>
          {editTxn && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Customer",  value: editTxn.customerName },
                  { label: "Wash Type", value: editTxn.washType },
                  { label: "Weight",    value: `${editTxn.weight} kg` },
                  { label: "Fee",       value: `₱${editTxn.fee}` },
                ].map((row) => (
                  <div key={row.label} className="bg-muted/30 rounded-md p-2.5">
                    <p className="text-[11px] text-muted-foreground">{row.label}</p>
                    <p className="font-medium text-foreground text-xs mt-0.5">{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Status stepper — interactive */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Status Progress</p>
                <div className="flex items-center">
                  {statusOrder.map((step, idx) => {
                    const isCompleted = idx < editStepIndex;
                    const isCurrent   = idx === editStepIndex;
                    const isLast      = idx === statusOrder.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
                            isCompleted || isCurrent ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                          )}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className={cn("text-[9px] mt-1 text-center w-10 md:w-12 leading-tight", isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>
                            {step}
                          </span>
                        </div>
                        {!isLast && <div className={cn("flex-1 h-0.5 mb-4 mx-0.5", isCompleted ? "bg-primary" : "bg-border")} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wash instructions */}
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Wash Instructions</label>
                <Textarea
                  placeholder="Add special wash instructions..."
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>

              {/* Edit actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {editStepIndex >= 0 && editStepIndex < statusOrder.length - 1 && (
                  <Button size="sm" onClick={moveToNextStatus} className="flex-1 gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    Move to {statusOrder[editStepIndex + 1]}
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={saveInstructions} className="flex-1">
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditTxn(null)} className="flex-1">
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── VOID CONFIRMATION MODAL ──────────────────────────────────────────── */}
      <Dialog open={!!voidTxn} onOpenChange={(open) => { if (!open) { setVoidTxn(null); setVoidReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle>Void Ticket</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to void Ticket #{voidTxn?.ticketId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Reason <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter reason for voiding..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="h-9 text-sm"
              />
              {voidReason.trim() === "" && (
                <p className="text-[11px] text-muted-foreground mt-1">A reason is required to void this ticket.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 cursor-pointer"
                disabled={!voidReason.trim()}
                onClick={confirmVoid}
              >
                Confirm Void
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={() => { setVoidTxn(null); setVoidReason(""); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── REPRINT / QR MODAL ───────────────────────────────────────────────── */}
      <Dialog open={!!reprintTxn} onOpenChange={(open) => !open && setReprintTxn(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Reprint Ticket
            </DialogTitle>
            <DialogDescription>
              Scan or print this QR code for ticket {reprintTxn?.ticketId}.
            </DialogDescription>
          </DialogHeader>
          {reprintTxn && (
            <div className="flex flex-col items-center gap-3 py-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://laundrytrack.ph/ticket/${reprintTxn.ticketId}`)}`}
                alt={`QR code for ${reprintTxn.ticketId}`}
                width={180}
                height={180}
                crossOrigin="anonymous"
              />
              <p className="text-sm font-mono font-semibold text-foreground">{reprintTxn.ticketId}</p>
              <p className="text-xs text-muted-foreground">{reprintTxn.customerName}</p>
              <div className="flex gap-2 mt-2 w-full">
                <Button size="sm" className="flex-1 flex items-center gap-1.5" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" /> Print
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setReprintTxn(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
