"use client";

import { useState } from "react";
import { Search, Eye, Edit, Ban, Printer, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { transactions as initialTxns, statusColors, statusOrder, type Transaction, type TransactionStatus } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function TransactionsPage() {
  const [txns, setTxns] = useState(initialTxns);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [instructions, setInstructions] = useState("");

  const filtered = txns.filter((t) => {
    const matchSearch =
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
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
      {/* Filter bar */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOrder.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" defaultValue="2026-04-05" className="w-40 h-9 text-sm" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Ticket ID", "Customer Name", "Drop-off Date", "Weight (kg)", "Wash Type", "Fee", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">{txn.ticketId}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{txn.customerName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{txn.dropOffDate}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{txn.weight} kg</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{txn.washType}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">₱{txn.fee}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium", statusColors[txn.status])}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => openModal(txn)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => openModal(txn)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Void">
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Reprint">
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

      {/* Transaction Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Ticket Details — {selectedTxn?.ticketId}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedTxn && (
            <div className="space-y-5">
              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Customer", value: selectedTxn.customerName },
                  { label: "Phone", value: selectedTxn.phone },
                  { label: "Drop-off Date", value: selectedTxn.dropOffDate },
                  { label: "Wash Type", value: selectedTxn.washType },
                  { label: "Weight", value: `${selectedTxn.weight} kg` },
                  { label: "Fee", value: `₱${selectedTxn.fee}` },
                  { label: "Add-ons", value: selectedTxn.addOns.length ? selectedTxn.addOns.join(", ") : "None" },
                ].map((row) => (
                  <div key={row.label} className="bg-muted/30 rounded-md p-3">
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
                              isCompleted
                                ? "bg-primary border-primary text-white"
                                : isCurrent
                                ? "bg-primary border-primary text-white"
                                : "bg-background border-border text-muted-foreground"
                            )}
                          >
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className={cn("text-[9px] mt-1 text-center w-12 leading-tight", isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>
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
              <div className="flex gap-2 pt-1">
                {currentStepIndex < statusOrder.length - 1 && (
                  <Button size="sm" onClick={moveToNextStatus} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    Move to {statusOrder[currentStepIndex + 1]}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedTxn(null)}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
