"use client";

import { useState } from "react";
import { Search, Eye, Edit, Ban, Printer, ChevronRight, X, QrCode, CalendarIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

export default function TransactionsPage() {
  const [txns, setTxns] = useState(initialTxns);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [instructions, setInstructions] = useState("");
  const [reprintTxn, setReprintTxn] = useState<Transaction | null>(null);

  const filtered = txns.filter((t) => {
    const matchSearch =
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchDate = !filterDate || t.dropOffDate === format(filterDate, "yyyy-MM-dd");
    return matchSearch && matchStatus && matchDate;
  });

  const currentStepIndex = selectedTxn ? statusOrder.indexOf(selectedTxn.status) : 0;

  const moveToNextStatus = () => {
    if (!selectedTxn) return;
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= statusOrder.length) return;
    const nextStatus = statusOrder[nextIdx];
    const updated = txns.map((t) =>
      t.id === selectedTxn.id ? { ...t, status: nextStatus, washInstructions: instructions || t.washInstructions } : t
    );
    setTxns(updated);
    setSelectedTxn({ ...selectedTxn, status: nextStatus });
  };

  const openModal = (txn: Transaction) => {
    setSelectedTxn(txn);
    setInstructions(txn.washInstructions || "");
  };

  return (
    <div className="space-y-4">
      {/* Filter bar — stacks on mobile */}
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
      </div>

      {/* Table — horizontally scrollable */}
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
              {filtered.map((txn) => (
                <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">{txn.ticketId}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{txn.customerName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">{txn.arrivalDateTime}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{txn.weight} kg</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{txn.washType}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">₱{txn.fee}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap", statusColors[txn.status])}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => openModal(txn)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openModal(txn)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Void">
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" title="Reprint" onClick={() => setReprintTxn(txn)}>
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* Transaction Modal — full screen on mobile */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details — {selectedTxn?.ticketId}</DialogTitle>
            <DialogDescription>
              View and update the status, wash instructions, and details for this transaction.
            </DialogDescription>
          </DialogHeader>

          {selectedTxn && (
            <div className="space-y-5">
              {/* Details */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm">
                {[
                  { label: "Customer",            value: selectedTxn.customerName },
                  { label: "Phone",               value: selectedTxn.phone },
                  { label: "Arrival Date & Time", value: selectedTxn.arrivalDateTime },
                  { label: "Wash Type",           value: selectedTxn.washType },
                  { label: "Weight",              value: `${selectedTxn.weight} kg` },
                  { label: "Fee",                 value: `₱${selectedTxn.fee}` },
                  { label: "Add-ons",             value: selectedTxn.addOns.length ? selectedTxn.addOns.join(", ") : "None" },
                ].map((row) => (
                  <div key={row.label} className={cn("bg-muted/30 rounded-md p-2.5 md:p-3", row.label === "Arrival Date & Time" && "col-span-2")}>
                    <p className="text-[11px] text-muted-foreground">{row.label}</p>
                    <p className="font-medium text-foreground text-xs mt-0.5">{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Status Stepper */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Status Progress</p>
                <div className="flex items-center">
                  {statusOrder.map((step, idx) => {
                    const stepIdx = statusOrder.indexOf(selectedTxn.status);
                    const isCompleted = idx < stepIdx;
                    const isCurrent = idx === stepIdx;
                    const isLast = idx === statusOrder.length - 1;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors",
                              isCompleted || isCurrent
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-background border-border text-muted-foreground"
                            )}
                          >
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className={cn("text-[9px] mt-1 text-center w-10 md:w-12 leading-tight", isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>
                            {step}
                          </span>
                        </div>
                        {!isLast && (
                          <div className={cn("flex-1 h-0.5 mb-4 mx-0.5 transition-colors", isCompleted ? "bg-primary" : "bg-border")} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2 py-2 bg-muted/30 rounded-lg">
                <QRCodeSVG
                  value={`https://laundrytrack.ph/ticket/${selectedTxn.ticketId}`}
                  size={100}
                  level="M"
                  includeMargin
                />
                <p className="text-[10px] text-muted-foreground font-mono">{selectedTxn.ticketId}</p>
              </div>

              {/* Wash instructions */}
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Wash Instructions</label>
                <Textarea
                  placeholder="Add special wash instructions..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {currentStepIndex < statusOrder.length - 1 && (
                  <Button size="sm" onClick={moveToNextStatus} className="flex items-center justify-center gap-1.5 w-full sm:w-auto min-h-[44px] sm:min-h-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                    Move to {statusOrder[currentStepIndex + 1]}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedTxn(null)} className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Reprint / QR Modal */}
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
              <QRCodeSVG
                value={`https://laundrytrack.ph/ticket/${reprintTxn.ticketId}`}
                size={180}
                level="H"
                includeMargin
              />
              <p className="text-sm font-mono font-semibold text-foreground">{reprintTxn.ticketId}</p>
              <p className="text-xs text-muted-foreground">{reprintTxn.customerName}</p>
              <div className="flex gap-2 mt-2 w-full">
                <Button
                  size="sm"
                  className="flex-1 flex items-center gap-1.5"
                  onClick={() => window.print()}
                >
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
