"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Order } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import { getImpact, calcTotalImpact } from "@/app/lib/impact";
import type { CampRequest, SchoolRequest } from "@/app/lib/supabaseClient";

type SellRequest = (CampRequest | SchoolRequest) & { mode: "camp" | "school"; institution?: string };

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M12 2C9 6.5 5 10.5 5 14.5 5 18.36 8.13 21.5 12 21.5c3.87 0 7-3.14 7-7C19 10.5 15 6.5 12 2Z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

export default function SellerDashboard() {
  const router = useRouter();
  const [session, setSession]       = useState<{ access_token: string } | null>(null);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<SellRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [shipError, setShipError]   = useState<Record<string, string>>({});
  const [shipSuccess, setShipSuccess] = useState<Record<string, boolean>>({});

  const load = useCallback(async (token: string, userId: string, email: string) => {
    setLoading(true);

    const [ordersRes, campReqs, schoolReqs, camps, schools] = await Promise.all([
      fetch("/api/seller/orders", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      supabase.from("camp_requests").select("*").or(`user_id.eq.${userId},seller_email.eq.${email}`).order("created_at", { ascending: false }),
      supabase.from("school_requests").select("*").or(`user_id.eq.${userId},seller_email.eq.${email}`).order("created_at", { ascending: false }),
      supabase.from("camps").select("id, name"),
      supabase.from("schools").select("id, name"),
    ]);

    setOrders(ordersRes.orders ?? []);

    const campMap: Record<string, string> = {};
    const schoolMap: Record<string, string> = {};
    camps.data?.forEach((c: { id: string; name: string }) => { campMap[c.id] = c.name; });
    schools.data?.forEach((s: { id: string; name: string }) => { schoolMap[s.id] = s.name; });

    const allSubmissions: SellRequest[] = [
      ...(campReqs.data ?? []).map((r: CampRequest) => ({
        ...r,
        mode: "camp" as const,
        institution: campMap[(r as CampRequest).camp_id ?? ""] ?? "Unknown Camp",
      })),
      ...(schoolReqs.data ?? []).map((r: SchoolRequest) => ({
        ...r,
        mode: "school" as const,
        institution: schoolMap[(r as SchoolRequest).school_id ?? ""] ?? "Unknown School",
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setSubmissions(allSubmissions);
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
    if (!tracking) return;
    if (!session) return;
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

  const statusColors: Record<string, string> = {
    paid:     "bg-yellow-50 text-yellow-700 border border-yellow-200",
    shipped:  "bg-green-50 text-green-700 border border-green-200",
    refunded: "bg-red-50 text-red-700 border border-red-200",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#2d5016] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
            Seller Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Track your shipments, manage listings, and see your impact.</p>
        </div>

        {/* Sustainability impact */}
        {approvedSubmissions.length > 0 && (
          <div className="bg-[#1F4E33] rounded-lg p-6 mb-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Your cumulative impact
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-2 text-blue-300"><WaterIcon /></div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>
                  {totalImpact.water.toLocaleString()}L
                </div>
                <div className="text-white/50 text-xs mt-0.5">water saved</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2 text-yellow-300"><BoltIcon /></div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>
                  {totalImpact.energy} kWh
                </div>
                <div className="text-white/50 text-xs mt-0.5">energy saved</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2 text-green-300"><LeafIcon /></div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>
                  {totalImpact.co2} kg
                </div>
                <div className="text-white/50 text-xs mt-0.5">CO2 avoided</div>
              </div>
            </div>
            <p className="text-white/40 text-xs text-center mt-4">
              Based on {approvedSubmissions.length} approved listing{approvedSubmissions.length !== 1 ? "s" : ""}.
              PayPal will deduct ~3% from each payout as their processing fee — your effective take is ~62% of item price.
            </p>
          </div>
        )}

        {/* Pending shipments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
            Pending Shipments
          </h2>
          {pendingShipments.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-sm">No pending shipments. You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingShipments.map((order) => {
                const address = order.buyer_address ? (() => {
                  try { return JSON.parse(order.buyer_address!); } catch { return null; }
                })() : null;

                const impact = getImpact(order.item_type);
                const deadline = new Date(order.created_at);
                deadline.setDate(deadline.getDate() + 7); // approx 5 business days

                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {getItemTypeLabel(order.item_type)} · Size {order.item_type}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Sold {new Date(order.created_at).toLocaleDateString()} · Ship by {deadline.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#2d5016] text-sm">
                          ${order.seller_payout.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">your payout</div>
                      </div>
                    </div>

                    {/* Shipping address */}
                    {address && (
                      <div className="bg-gray-50 border border-gray-100 rounded p-3 mb-4 text-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ship to</p>
                        <p className="text-gray-800 font-medium">{address.name}</p>
                        <p className="text-gray-600">{address.street}</p>
                        <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                      </div>
                    )}

                    {impact && (
                      <p className="text-xs text-[#2d5016] mb-4">
                        This sale saved {impact.energyDisplay} of energy and {impact.waterDisplay} of water.
                        Ship USPS Ground Advantage for best rates — free $100 insurance included.
                      </p>
                    )}

                    {/* Tracking entry */}
                    {shipSuccess[order.id] ? (
                      <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
                        Tracking saved. The buyer will be notified.
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingInputs[order.id] ?? ""}
                          onChange={(e) => setTrackingInputs((t) => ({ ...t, [order.id]: e.target.value }))}
                          placeholder="Enter USPS tracking number"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#2d5016] transition-colors"
                        />
                        <button
                          onClick={() => handleMarkShipped(order.id)}
                          disabled={!trackingInputs[order.id]?.trim() || submitting === order.id}
                          className="px-4 py-2 rounded text-white text-sm font-semibold bg-[#2d5016] hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          {submitting === order.id ? "Saving…" : "Mark Shipped"}
                        </button>
                      </div>
                    )}
                    {shipError[order.id] && (
                      <p className="text-xs text-red-600 mt-2">{shipError[order.id]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shipped orders */}
        {shippedOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
              Shipped Orders
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pr-4">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shippedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{getItemTypeLabel(order.item_type)}</div>
                        <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        {order.tracking_number ? (
                          <span className="text-xs font-mono text-gray-600">{order.tracking_number}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 pr-4 text-right font-semibold text-[#2d5016]">
                        ${order.seller_payout.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My submissions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
              My Listings
            </h2>
            <Link href="/submit" className="text-sm font-medium text-[#2d5016] hover:opacity-80 transition-opacity">
              + List an item
            </Link>
          </div>
          {submissions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-sm mb-4">You haven&apos;t listed anything yet.</p>
              <Link href="/submit" className="px-5 py-2.5 rounded text-white text-sm font-semibold bg-[#2d5016] hover:opacity-90 transition-opacity">
                List Your First Item
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub) => {
                    const impact = sub.status === "approved" ? getImpact(sub.item_type) : null;
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{getItemTypeLabel(sub.item_type)}</div>
                          <div className="text-xs text-gray-400">Size {sub.size} · {getConditionLabel(sub.condition)}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{sub.institution}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            sub.status === "approved"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : sub.status === "rejected"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {impact ? `${impact.energyDisplay} · ${impact.waterDisplay}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
