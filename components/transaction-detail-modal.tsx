import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusColors, type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const basePrice = transaction.fee - (transaction.addOns.length > 0 ? 10 : 0); // Rough breakdown
  const addOnPrice = transaction.fee - basePrice;

  const statusTimeline = [
    { status: "Received", icon: "📦", active: true },
    { status: "Washing", icon: "🌊", active: ["Washing", "Drying", "Ready", "Claimed"].includes(transaction.status) },
    { status: "Drying", icon: "🌀", active: ["Drying", "Ready", "Claimed"].includes(transaction.status) },
    { status: "Ready", icon: "✓", active: ["Ready", "Claimed"].includes(transaction.status) },
    { status: "Claimed", icon: "🎉", active: transaction.status === "Claimed" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-base">Transaction Details</DialogTitle>
              <DialogDescription className="text-xs mt-1">{transaction.ticketId}</DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Ticket + Customer Info */}
          <div className="bg-muted/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ticket ID</span>
              <span className="text-sm font-mono font-semibold text-primary">{transaction.ticketId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Customer</span>
              <span className="text-sm font-medium text-foreground">{transaction.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-sm font-medium text-foreground">{transaction.phone || "—"}</span>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-muted/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Service Type</span>
              <span className="text-sm font-medium text-foreground">{transaction.washType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Weight</span>
              <span className="text-sm font-medium text-foreground">{transaction.weight} kg</span>
            </div>
            {transaction.addOns.length > 0 && (
              <div className="flex items-start justify-between pt-1">
                <span className="text-xs text-muted-foreground">Add-ons</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {transaction.addOns.map((ao) => (
                    <Badge key={ao} variant="outline" className="text-[10px] px-1.5 py-0.5">
                      {ao}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status & Timeline */}
          <div className="bg-muted/40 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Status</span>
              <Badge className={statusColors[transaction.status]}>{transaction.status}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Progress</p>
              <div className="flex items-center justify-between gap-1">
                {statusTimeline.map((step, idx) => (
                  <div key={step.status} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        step.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] text-center leading-tight",
                        step.active ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase">Fee Breakdown</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Base Service</span>
                <span className="font-medium text-foreground">₱{basePrice}</span>
              </div>
              {addOnPrice > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium text-foreground">+₱{addOnPrice}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs border-t border-primary/10 pt-1.5">
                <span className="font-semibold">Total</span>
                <span className="text-base font-bold text-primary">₱{transaction.fee}</span>
              </div>
            </div>
          </div>

          {/* Drop-off Date */}
          {transaction.washInstructions && (
            <div className="bg-muted/40 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">Wash Instructions</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{transaction.washInstructions}</p>
            </div>
          )}

          <div className="bg-muted/40 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Drop-off Date</span>
              <span className="text-sm font-medium text-foreground">{transaction.dropOffDate}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
