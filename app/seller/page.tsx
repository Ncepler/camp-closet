"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import type { Order } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import { getImpact, calcTotalImpact } from "@/app/lib/impact";
import type { CampRequest } from "@/app/lib/supabaseClient";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type SellRequest = CampRequest & { institution: string };

const statusStyle: Record<string, React.CSSProperties> = {
  paid:     { color: "#C8932F", border: "1px solid #E6C97A", background: "#FBF5E8" },
  shipped:  { color: "#2D5A3D", border: "1px solid #A8C5A0", background: "#EDF4EE" },
  refunded: { color: "#8B3A2E", border: "1px solid #D9B9B4", background: "#F9F0EE" },
  approved: { color: "#2D5A3D", border: "1px solid #A8C5A0", background: "#EDF4EE" },
  pending:  { color: "#C8932F", border: "1px solid #E6C97A", background: "#FBF5E8" },
  rejected: { color: "#8B3A2E", border: "1px solid #D9B9B4", background: "#F9F0EE" },
};

export default function SellerDashboard() {
  const router = useRouter();
  const [session, setSession]               = useState<{ access_token: string } | null>(null);
  const [orders, setOrders]                 = useState<Order[]>([]);
  const [submissions, setSubmissions]       = useState<SellRequest[]>([]);
  const [loading, setLoading]               = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting]         = useState<string | null>(null);
  const [shipError, setShipError]           = useState<Record<string, string>>({});
  const [shipSuccess, setShipSuccess]       = useState<Record<string, boolean>>({});
  const [claimCount, setClaimCount]         = useState<number>(0);
  const [claimResetDays, setClaimResetDays] = useState<number | null>(null);

  const load = useCallback(async (token: string, userId: string, email: string) => {
    setLoading(true);

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [ordersRes, campReqs, camps, claimsRes, oldestClaimRes] = await Promise.all([
      fetch("/api/seller/orders", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      supabase.from("camp_requests").select("*").or(`user_id.eq.${userId},seller_email.eq.${email}`).order("created_at", { ascending: false }),
      supabase.from("camps").select("id, name"),
      supabase.from("claims").select("*", { count: "exact", head: true }).eq("claimer_id", userId).gt("created_at", since30d).neq("status", "cancelled"),
      supabase.from("claims").select("created_at").eq("claimer_id", userId).neq("status", "cancelled").gt("created_at", since30d).order("created_at", { ascending: true }).limit(1),
    ]);

    setOrders(ordersRes.orders ?? []);

    const campMap: Record<string, string> = {};
    camps.data?.forEach((c: { id: string; name: string }) => { campMap[c.id] = c.name; });

    const allSubmissions: SellRequest[] = (campReqs.data ?? []).map((r: CampRequest) => ({
      ...r,
      institution: campMap[r.camp_id ?? ""] ?? "Unknown Camp",
    }));

    setSubmissions(allSubmissions);

    const count = claimsRes.count ?? 0;
    setClaimCount(count);
    if (count >= 2 && oldestClaimRes.data?.[0]) {
      const resetAt = new Date(oldestClaimRes.data[0].created_at).getTime() + 30 * 24 * 60 * 60 * 1000;
      setClaimResetDays(Math.max(1, Math.ceil((resetAt - Date.now()) / (24 * 60 * 60 * 1000))));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth?redirect=/seller"); return; }
      setSession(data.session);
      const user = data.session.user;
      load(data.session.access_token, user.id, user.email ?? "");
    });
  }, [router, load]);

  const handleMarkShipped = async (orderId: string) => {
    const tracking = trackingInputs[orderId]?.trim();
    if (!tracking || !session) return;
    setSubmitting(orderId);
    setShipError((e) => ({ ...e, [orderId]: "" }));

    const res = await fetch("/api/seller/ship", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ order_id: orderId, tracking_number: tracking }),
    });
    const data = await res.json();
    if (data.success) {
      setShipSuccess((s) => ({ ...s, [orderId]: true }));
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, tracking_number: tracking, shipped_at: new Date().toISOString(), status: "shipped" } : o)
      );
    } else {
      setShipError((e) => ({ ...e, [orderId]: data.error ?? "Failed to save tracking" }));
    }
    setSubmitting(null);
  };

  const approvedSubmissions = submissions.filter((s) => s.status === "approved" && !s.is_donation);
  const totalImpact = calcTotalImpact(approvedSubmissions.map((s) => ({ item_type: s.item_type })));

  const pendingShipments = orders.filter((o) => o.status === "paid" && !o.tracking_number);
  const shippedOrders    = orders.filter((o) => o.status === "shipped" || o.tracking_number);
  const soldImpact       = calcTotalImpact(orders.map((o) => ({ item_type: o.item_type })));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F1E8" }}>
        <div className="w-5 h-5 border-2 border-[#D9D2C2] border-t-[#2D5A3D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>
      <div className="px-6 py-12" style={{ maxWidth: "880px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="mb-10 pb-8"
          style={{ borderBottom: "1px solid #D9D2C2" }}
        >
          <h1
            className="mb-1"
            style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 72, 'soft' 40", fontSize: "32px", color: "#1F2A20" }}
          >
            Seller dashboard
          </h1>
          <p className="text-sm" style={{ color: "#8A8E83" }}>
            Track shipments, manage listings, and see your impact.
          </p>
          <p className="text-xs mt-3" style={{ color: "#8A8E83" }}>
            Free claims this month: {claimCount} of 2.
            {claimCount >= 2 && claimResetDays !== null && (
              <span> Resets in {claimResetDays} {claimResetDays === 1 ? "day" : "days"}.</span>
            )}
          </p>
        </motion.div>

        {/* Sustainability impact */}
        {approvedSubmissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, delay: 0.08, ease: EASE_OUT }}
            className="mb-10 p-6"
            style={{ border: "1px solid #D9D2C2", background: "#EDE6D3" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-5" style={{ color: "#8A8E83", letterSpacing: "0.1em" }}>
              Your cumulative impact
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: `${totalImpact.water.toLocaleString()} L`, label: "water saved", color: "#2D5A3D" },
                { value: `${totalImpact.energy} kWh`, label: "energy saved", color: "#C8932F" },
                { value: `${totalImpact.co2} kg`, label: "CO₂ avoided", color: "#2D5A3D" },
              ].map(({ value, label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.18 + i * 0.08, ease: EASE_OUT }}
                >
                  <div
                    className="text-xl font-medium mb-0.5 tabular"
                    style={{ fontFamily: "var(--font-mono)", color, fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </div>
                  <div className="text-xs" style={{ color: "#8A8E83" }}>{label}</div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs mt-4" style={{ color: "#8A8E83" }}>
              Based on {approvedSubmissions.length} approved listing{approvedSubmissions.length !== 1 ? "s" : ""}.
            </p>
          </motion.div>
        )}

        {/* Pending shipments */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14, ease: EASE_OUT }}
          className="mb-10"
        >
          <h2
            className="font-medium mb-5"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
          >
            Pending shipments
          </h2>
          {pendingShipments.length === 0 ? (
            <div className="p-8 text-center" style={{ border: "1px solid #D9D2C2" }}>
              <p className="text-sm" style={{ color: "#8A8E83" }}>No pending shipments. You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingShipments.map((order, i) => {
                const address = order.buyer_address ? (() => {
                  try { return JSON.parse(order.buyer_address!); } catch { return null; }
                })() : null;

                const impact   = getImpact(order.item_type);
                const deadline = new Date(order.created_at);
                deadline.setDate(deadline.getDate() + 7);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.38, delay: i * 0.07, ease: EASE_OUT }}
                    className="p-5"
                    style={{ border: "1px solid #D9D2C2", background: "#F5F1E8" }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="font-medium text-sm" style={{ color: "#1F2A20" }}>
                          {getItemTypeLabel(order.item_type)}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>
                          Sold {new Date(order.created_at).toLocaleDateString()} · Ship by {deadline.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm tabular" style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D" }}>
                          ${order.seller_payout.toFixed(2)}
                        </div>
                        <div className="text-xs" style={{ color: "#8A8E83" }}>your payout</div>
                      </div>
                    </div>

                    {address && (
                      <div className="p-3 mb-4" style={{ background: "#EDE6D3", border: "1px solid #D9D2C2" }}>
                        <p className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>
                          Ship to
                        </p>
                        <p className="text-sm font-medium" style={{ color: "#1F2A20" }}>{address.name}</p>
                        <p className="text-xs" style={{ color: "#4A5247" }}>{address.street}</p>
                        <p className="text-xs" style={{ color: "#4A5247" }}>{address.city}, {address.state} {address.zip}</p>
                      </div>
                    )}

                    {impact && (
                      <p className="text-xs mb-4" style={{ color: "#4A5247" }}>
                        This sale saves {impact.energyDisplay} of energy.
                        Ship USPS Ground Advantage — cheapest option, free $100 insurance.
                      </p>
                    )}

                    <AnimatePresence mode="wait">
                      {shipSuccess[order.id] ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: EASE_OUT }}
                          className="text-xs p-3"
                          style={{ color: "#2D5A3D", background: "#EDF4EE", border: "1px solid #A8C5A0", borderRadius: "4px" }}
                        >
                          Tracking saved. The buyer will be notified.
                        </motion.div>
                      ) : (
                        <motion.div key="form" className="flex gap-2">
                          <input
                            type="text"
                            value={trackingInputs[order.id] ?? ""}
                            onChange={(e) => setTrackingInputs((t) => ({ ...t, [order.id]: e.target.value }))}
                            placeholder="Enter USPS tracking number"
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "1px solid #D9D2C2",
                              borderRadius: "4px",
                              background: "transparent",
                              outline: "none",
                              fontSize: "13px",
                              color: "#1F2A20",
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                          />
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            transition={{ duration: 0.1 }}
                            onClick={() => handleMarkShipped(order.id)}
                            disabled={!trackingInputs[order.id]?.trim() || submitting === order.id}
                            className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                            style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px", whiteSpace: "nowrap" }}
                          >
                            {submitting === order.id ? "Saving…" : "Mark shipped"}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {shipError[order.id] && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs mt-2"
                          style={{ color: "#8B3A2E" }}
                        >
                          {shipError[order.id]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Shipped orders */}
        {shippedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT }}
            className="mb-10"
          >
            <h2
              className="font-medium mb-5"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Shipped orders
            </h2>
            {orders.length > 0 && (
              <div className="mb-5 p-5" style={{ border: "1px solid #D9D2C2", background: "#EDE6D3" }}>
                <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "#8A8E83", letterSpacing: "0.1em" }}>
                  Impact from your sales
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: `${soldImpact.water.toLocaleString()} L`, label: "water saved", color: "#2D5A3D" },
                    { value: `${soldImpact.energy} kWh`, label: "energy saved", color: "#C8932F" },
                    { value: `${soldImpact.co2} kg`, label: "CO₂ avoided", color: "#2D5A3D" },
                  ].map(({ value, label, color }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.28 + i * 0.07, ease: EASE_OUT }}
                    >
                      <div className="text-xl font-medium mb-0.5 tabular" style={{ fontFamily: "var(--font-mono)", color, fontVariantNumeric: "tabular-nums" }}>
                        {value}
                      </div>
                      <div className="text-xs" style={{ color: "#8A8E83" }}>{label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ border: "1px solid #D9D2C2", overflow: "hidden" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #D9D2C2", background: "#EDE6D3" }}>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Tracking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {shippedOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.05, ease: EASE_OUT }}
                      style={{ borderBottom: i < shippedOrders.length - 1 ? "1px solid #D9D2C2" : "none" }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm" style={{ color: "#1F2A20" }}>{getItemTypeLabel(order.item_type)}</div>
                        <div className="text-xs" style={{ color: "#8A8E83" }}>{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        {order.tracking_number ? (
                          <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "#4A5247" }}>{order.tracking_number}</span>
                        ) : (
                          <span className="text-xs" style={{ color: "#D9D2C2" }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-0.5"
                          style={{ borderRadius: "2px", ...(statusStyle[order.status] ?? { color: "#8A8E83", border: "1px solid #D9D2C2" }) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium tabular" style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D" }}>
                          ${order.seller_payout.toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* My listings */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24, ease: EASE_OUT }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-medium"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "18px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              My listings
            </h2>
            <Link
              href="/submit"
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "#2D5A3D" }}
            >
              + List an item
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div className="p-8 text-center" style={{ border: "1px solid #D9D2C2" }}>
              <p className="text-sm mb-4" style={{ color: "#8A8E83" }}>You haven&apos;t listed anything yet.</p>
              <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>
                <Link
                  href="/submit"
                  className="inline-block px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
                >
                  List your first item
                </Link>
              </motion.div>
            </div>
          ) : (
            <div style={{ border: "1px solid #D9D2C2", overflow: "hidden" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #D9D2C2", background: "#EDE6D3" }}>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Camp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => {
                    const impact = sub.status === "approved" ? getImpact(sub.item_type) : null;
                    return (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.32 + i * 0.05, ease: EASE_OUT }}
                        style={{ borderBottom: i < submissions.length - 1 ? "1px solid #D9D2C2" : "none" }}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm" style={{ color: "#1F2A20" }}>{getItemTypeLabel(sub.item_type)}</div>
                          <div className="text-xs" style={{ color: "#8A8E83" }}>Size {sub.size} · {getConditionLabel(sub.condition)}</div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#4A5247" }}>{sub.institution}</td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-medium px-2 py-0.5"
                            style={{ borderRadius: "2px", ...(statusStyle[sub.status] ?? { color: "#8A8E83", border: "1px solid #D9D2C2" }) }}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#4A5247" }}>
                          {impact ? `${impact.energyDisplay} · ${impact.waterDisplay}` : "—"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
