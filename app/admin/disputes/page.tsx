"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/app/lib/adminApi";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import type { Order } from "@/app/lib/supabaseClient";

const refundStatusColors: Record<string, string> = {
  none:      "bg-gray-800/40 text-gray-400 border border-gray-700/50",
  requested: "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
  approved:  "bg-green-900/30 text-green-400 border border-green-800/50",
  issued:    "bg-green-900/50 text-green-300 border border-green-700/50",
  rejected:  "bg-red-900/30 text-red-400 border border-red-800/50",
};

export default function DisputesPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"requested" | "all">("requested");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": typeof window !== "undefined" ? (sessionStorage.getItem("admin_key") ?? "") : "",
      },
      body: JSON.stringify({ op: "orders", refund_requested: true }),
    });
    const data = await res.json();
    setOrders(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const issueRefund = async (order: Order) => {
    if (!order.paypal_capture_id) {
      alert("No PayPal capture ID on this order — refund manually via PayPal dashboard.");
      return;
    }
    const confirmed = confirm(
      `Issue full refund of $${order.total_amount.toFixed(2)} to ${order.buyer_email}? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(order.id);
    const res = await fetch("/api/paypal/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": sessionStorage.getItem("admin_key") ?? "",
      },
      body: JSON.stringify({ order_id: order.id, reason: order.refund_reason }),
    });
    const data = await res.json();
    if (data.error) {
      alert(`Refund failed: ${data.error}`);
    } else {
      await load();
    }
    setActionLoading(null);
  };

  const rejectClaim = async (orderId: string) => {
    setActionLoading(orderId);
    await adminApi.update("orders", orderId, { refund_status: "rejected" });
    await load();
    setActionLoading(null);
  };

  const filtered = statusFilter === "requested"
    ? orders.filter((o) => o.refund_status === "requested")
    : orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Disputes & Refunds</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {filtered.length} dispute{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["requested", "all"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {s === "requested" ? "Needs Review" : "All"}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading disputes…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No disputes to review.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filtered.map((order) => {
              const address = order.buyer_address ? (() => {
                try { return JSON.parse(order.buyer_address!); } catch { return null; }
              })() : null;

              return (
                <div key={order.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{getItemTypeLabel(order.item_type)}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${refundStatusColors[order.refund_status]}`}>
                          {order.refund_status}
                        </span>
                        {order.seller_flagged && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-800/50">
                            seller flagged
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Order {order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${order.total_amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">total paid</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buyer</p>
                      <p className="text-sm text-gray-300">{order.buyer_email}</p>
                      {address && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {address.name} · {address.city}, {address.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Seller</p>
                      <p className="text-sm text-gray-300">{order.seller_email ?? "Unknown"}</p>
                      {order.tracking_number && (
                        <p className="text-xs text-gray-500 mt-0.5">Tracking: {order.tracking_number}</p>
                      )}
                    </div>
                  </div>

                  {order.refund_reason && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buyer&apos;s claim</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{order.refund_reason}</p>
                    </div>
                  )}

                  {order.refund_status === "requested" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => issueRefund(order)}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-700 hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === order.id ? "Processing…" : `Approve & Refund $${order.total_amount.toFixed(2)}`}
                      </button>
                      <button
                        onClick={() => rejectClaim(order.id)}
                        disabled={actionLoading === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 transition-colors"
                      >
                        Reject Claim
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
