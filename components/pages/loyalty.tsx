"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loyaltyMembers as seedMembers, type LoyaltyMember } from "@/lib/data";
import { fetchLoyaltyMembers } from "@/lib/supabase/db";

function StampDots({ count, max = 21 }: { count: number; max?: number }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2 max-w-xs">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border ${i < count ? "bg-yellow-400 border-yellow-500" : "bg-muted border-border"}`}
        />
      ))}
    </div>
  );
}

export default function LoyaltyPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LoyaltyMember | null>(null);
  const [members, setMembers] = useState<LoyaltyMember[]>(seedMembers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyMembers().then((rows) => {
      if (rows.length > 0) setMembers(rows);
      setLoading(false);
    });
  }, []);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  if (selected) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Members
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Card */}
          <Card className="border border-border shadow-none">
            <CardContent className="p-5 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
                <Star className="w-7 h-7 text-yellow-500" />
              </div>
              <h2 className="font-semibold text-base text-foreground">{selected.name}</h2>
              <p className="text-xs text-muted-foreground">{selected.phone}</p>
              <p className="text-xs text-muted-foreground">Joined: {selected.dateJoined}</p>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Total Stamps</p>
                <p className="text-3xl font-bold text-foreground">{selected.stampCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rewards Redeemed</p>
                <p className="text-xl font-bold text-yellow-600">{selected.rewardsRedeemed}</p>
              </div>
              {selected.preferences && (
                <div className="text-left bg-muted/30 rounded p-2 mt-1">
                  <p className="text-[11px] text-muted-foreground">Preferences</p>
                  <p className="text-xs text-foreground mt-0.5">{selected.preferences}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stamp History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 py-3">
                  <StampDots count={selected.stampCount} />
                  <p className="text-xs text-muted-foreground mt-2">
                    {7 - (selected.stampCount % 7)} stamps until next free wash
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border bg-muted/40">
                      {["Date", "Ticket", "Stamps"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.stampHistory.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-6 text-xs text-muted-foreground">No stamp history</td></tr>
                    ) : (
                      selected.stampHistory.map((s, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.date}</td>
                          <td className="px-4 py-2.5 text-xs font-mono text-primary">{s.ticket}</td>
                          <td className="px-4 py-2.5 text-xs font-medium">+{s.stamps}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Reward History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border bg-muted/40">
                      {["Date", "Reward"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.rewardHistory.length === 0 ? (
                      <tr><td colSpan={2} className="text-center py-6 text-xs text-muted-foreground">No rewards redeemed yet</td></tr>
                    ) : (
                      selected.rewardHistory.map((r, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.date}</td>
                          <td className="px-4 py-2.5 text-xs font-medium text-green-700">{r.reward}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Button size="sm" variant="outline">Filter</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {[
          { label: "Total Members", value: members.length },
          { label: "Avg. Stamps", value: members.length ? Math.round(members.reduce((s, m) => s + m.stampCount, 0) / members.length) : 0 },
          { label: "Total Rewards", value: members.reduce((s, m) => s + m.rewardsRedeemed, 0) },
        ].map((c) => (
          <Card key={c.label} className="border border-border shadow-none">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Table */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Name", "Phone", "Stamps", "Rewards Redeemed", "Date Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-foreground">{m.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-foreground">{m.stampCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.rewardsRedeemed}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.dateJoined}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(m)}>
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-muted-foreground">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
