"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Order } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import { getImpact } from "@/app/lib/impact";

type RefundStep = "idle" | "form" | "submitting" | "submitted";

export default function OrderPage() {
  const { id } = useParams() as { id: string };
  const router  = useRouter();

  const [order, setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refundStep, setRefundStep] = useState<RefundStep>("idle");
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError]   = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push(`/auth?redirect=/orders/${id}`); return; }

      const res = await fetch("/api/buyer/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      const found = (data.orders ?? []).find((o: Order) => o.id === id);
      if (!found) { setNotFound(true); setLoading(false); return; }
      setOrder(found);
      setLoading(false);
    };
    load();
  }, [id, router]);

  const handleRefundRequest = async () => {
    if (!refundReason.trim() || !order) return;
    setRefundStep("submitting");
    setRefundError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setRefundError("Session expired. Please sign in again."); setRefundStep("form"); return; }

    // Use the admin API to update refund_status to 'requested'
    // (In production, this would go through a dedicated buyer API route with auth)
    const res = await fetch("/api/buyer/refund-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ order_id: order.id, reason: refundReason }),
    });
    const result = await res.json();
    if (result.success) {
      setRefundStep("submitted");
      setOrder((o) => o ? { ...o, refund_status: "requested" } : o);
    } else {
      setRefundError(result.error ?? "Failed to submit claim");
      setRefundStep("form");
    }
  };

  const impact = order ? getImpact(order.item_type) : null;

  // Can file a claim if delivered within 7 days (approximated by 14 days from ship date)
  const canFileClaim = order &&
    order.status !== "refunded" &&
    order.refund_status === "none" &&
    order.shipped_at &&
    (Date.now() - new Date(order.shipped_at).getTime()) < 14 * 24 * 60 * 60 * 1000;

  const statusSteps = [
    { key: "paid",      label: "Order placed",    done: true },
    { key: "shipped",   label: "Shipped",         done: !!order?.tracking_number },
    { key: "delivered", label: "Delivered",       done: order?.status === "delivered" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#2d5016] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t find this order on your account.</p>
          <Link href="/" className="px-5 py-2.5 rounded text-white font-medium text-sm bg-[#2d5016] hover:opacity-90 transition-opacity">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const address = order.buyer_address ? (() => {
    try { return JSON.parse(order.buyer_address!); } catch { return null; }
  })() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 text-sm mb-8 hover:text-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
            Order {order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">Placed {new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        {/* Status timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Shipping Status</h2>
          <div className="flex items-center gap-0">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.done ? "bg-[#2d5016] border-[#2d5016]" : "bg-white border-gray-200"
                  }`}>
                    {step.done ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-2 text-center leading-tight w-20">{step.label}</span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-5 ${step.done && statusSteps[i + 1].done ? "bg-[#2d5016]" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Tracking number */}
          {order.tracking_number && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">USPS Tracking</p>
              <a
                href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-[#2d5016] hover:underline"
              >
                {order.tracking_number}
              </a>
              {order.shipped_at && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Shipped {new Date(order.shipped_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {!order.tracking_number && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
              Awaiting tracking. Your seller has 5 business days to ship from the order date.
              Auto-refund applies if no tracking is entered in time.
            </div>
          )}
        </div>

        {/* Order details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{getItemTypeLabel(order.item_type)}</span>
              <span className="font-medium">${order.item_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${order.shipping_fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
              <span>Total paid</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {address && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shipping to</p>
              <p className="text-sm text-gray-700">{address.name}</p>
              <p className="text-sm text-gray-500">{address.street}, {address.city}, {address.state} {address.zip}</p>
            </div>
          )}
        </div>

        {/* Environmental impact */}
        {impact && (
          <div className="bg-[#1F4E33]/5 border border-[#1F4E33]/10 rounded-lg p-5 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1F4E33] mb-3">Your purchase saved</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-bold text-lg text-[#1F4E33]" style={{ fontFamily: "var(--font-fraunces)" }}>{impact.waterDisplay}</div>
                <div className="text-xs text-gray-500 mt-0.5">water</div>
              </div>
              <div>
                <div className="font-bold text-lg text-[#1F4E33]" style={{ fontFamily: "var(--font-fraunces)" }}>{impact.energyDisplay}</div>
                <div className="text-xs text-gray-500 mt-0.5">energy</div>
              </div>
              <div>
                <div className="font-bold text-lg text-[#1F4E33]" style={{ fontFamily: "var(--font-fraunces)" }}>{impact.co2Display}</div>
                <div className="text-xs text-gray-500 mt-0.5">CO2</div>
              </div>
            </div>
          </div>
        )}

        {/* Refund / claim section */}
        {order.refund_status === "requested" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Your refund claim is under review. Our team will respond within 1–2 business days.
          </div>
        )}

        {order.refund_status === "issued" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            Refund issued. Allow 3–5 business days to appear in your PayPal account.
          </div>
        )}

        {canFileClaim && refundStep === "idle" && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Problem with this order?</h2>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              If the item was not as described or never arrived, you may file a claim within 7 days of delivery.
              All sales are otherwise final.
            </p>
            <button
              onClick={() => setRefundStep("form")}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Report a problem
            </button>
          </div>
        )}

        {(refundStep === "form" || refundStep === "submitting") && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Report a Problem</h2>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Describe the issue <span className="text-red-500">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                placeholder="Item was stained / not the right size described / never arrived…"
              />
            </div>
            {refundError && (
              <p className="text-xs text-red-600 mb-3">{refundError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setRefundStep("idle")}
                className="flex-1 py-2 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundRequest}
                disabled={!refundReason.trim() || refundStep === "submitting"}
                className="flex-1 py-2 rounded text-white text-sm font-semibold bg-red-600 hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {refundStep === "submitting" ? "Submitting…" : "Submit Claim"}
              </button>
            </div>
          </div>
        )}

        {refundStep === "submitted" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            Claim submitted. We&apos;ll review it and respond within 1–2 business days.
          </div>
        )}
      </div>
    </div>
  );
}
