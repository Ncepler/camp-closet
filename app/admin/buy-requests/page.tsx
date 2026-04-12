"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import type { BuyRequest, Item } from "@/app/lib/supabaseClient";

type RequestWithItem = BuyRequest & { item?: Item };

const statusColors: Record<string, string> = {
  pending:  "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
  approved: "bg-green-900/30 text-green-400 border border-green-800/50",
  rejected: "bg-red-900/30 text-red-400 border border-red-800/50",
};

export default function BuyRequestsPage() {
  const [requests, setRequests]       = useState<RequestWithItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: reqs } = await supabase
      .from("buy_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!reqs) { setLoading(false); return; }

    const itemIds = [...new Set(reqs.map((r: BuyRequest) => r.item_id))];
    const { data: items } = await supabase.from("items").select("*").in("id", itemIds);

    const itemMap: Record<string, Item> = {};
    items?.forEach((item: Item) => { itemMap[item.id] = item; });

    setRequests(reqs.map((r: BuyRequest) => ({ ...r, item: itemMap[r.item_id] })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoading(id);
    await supabase.from("buy_requests").update({
      status:      newStatus,
      approved_at: newStatus === "approved" ? new Date().toISOString() : null,
    }).eq("id", id);
    await load();
    setActionLoading(null);
  };

  const filtered = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Buy Requests</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500">No buy requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {req.item?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={req.item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">👕</div>
                        )}
                        <div>
                          <div className="font-medium text-white text-sm">{getItemTypeLabel(req.item?.item_type ?? "")}</div>
                          <div className="text-xs text-gray-500">Size {req.item?.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-xs">{req.buyer_email}</div>
                      {req.buyer_phone && <div className="text-xs text-gray-500">{req.buyer_phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#7fb069] font-medium">${req.item?.price?.toFixed(2) ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 pr-4">
                      {req.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => updateStatus(req.id, "approved")} disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2d5016] hover:bg-[#4a7c2c] transition-colors disabled:opacity-50">
                            {actionLoading === req.id ? "…" : "Approve"}
                          </button>
                          <button onClick={() => updateStatus(req.id, "rejected")} disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/40 transition-colors">
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
