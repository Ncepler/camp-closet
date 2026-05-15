"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import type { Order } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import { getImpact } from "@/app/lib/impact";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type RefundStep = "idle" | "form" | "submitting" | "submitted";

export default function OrderPage() {
  const { id } = useParams() as { id: string };
  const router  = useRouter();

  const [order, setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refundStep, setRefundStep]     = useState<RefundStep>("idle");
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

    const res = await fetch("/api/buyer/refund-request", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
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

  const canFileClaim = order &&
    order.status !== "refunded" &&
    order.refund_status === "none" &&
    order.shipped_at &&
    (Date.now() - new Date(order.shipped_at).getTime()) < 14 * 24 * 60 * 60 * 1000;

  const statusSteps = [
    { key: "paid",      label: "Order placed", done: true },
    { key: "shipped",   label: "Shipped",      done: !!order?.tracking_number },
    { key: "delivered", label: "Delivered",    done: order?.status === "delivered" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F1E8" }}>
        <div className="w-5 h-5 border-2 border-[#D9D2C2] border-t-[#2D5A3D] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F5F1E8" }}>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          style={{ maxWidth: "400px" }}
        >
          <h1
            className="font-medium mb-2"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "24px", color: "#1F2A20" }}
          >
            Order not found
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8A8E83" }}>
            We couldn&apos;t find this order on your account.
          </p>
          <Link href="/" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#2D5A3D" }}>
            ← Back to home
          </Link>
        </motion.div>
      </div>
    );
  }

  const address = order.buyer_address ? (() => {
    try { return JSON.parse(order.buyer_address!); } catch { return null; }
  })() : null;

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>
      <div className="px-6 py-12" style={{ maxWidth: "620px", margin: "0 auto" }}>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs mb-8 transition-opacity hover:opacity-70"
            style={{ color: "#8A8E83" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.06, ease: EASE_OUT }}
          className="mb-8"
        >
          <h1
            className="mb-1"
            style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 72, 'soft' 40", fontSize: "28px", color: "#1F2A20" }}
          >
            Order {order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm" style={{ color: "#8A8E83" }}>
            Placed {new Date(order.created_at).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Shipping status */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.12, ease: EASE_OUT }}
          className="mb-4 p-5"
          style={{ border: "1px solid #D9D2C2" }}
        >
          <h2 className="text-xs font-medium uppercase tracking-wider mb-5" style={{ color: "#8A8E83", letterSpacing: "0.1em" }}>
            Shipping status
          </h2>
          <div className="relative">
            <div className="absolute top-2.5 left-2.5 right-2.5 h-px" style={{ background: "#D9D2C2" }} />
            <div className="flex justify-between relative">
              {statusSteps.map((step, i) => (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.22 + i * 0.1, ease: EASE_OUT }}
                  className="flex flex-col items-center gap-3"
                  style={{ maxWidth: "80px" }}
                >
                  <div
                    className="w-5 h-5 flex items-center justify-center z-10"
                    style={{
                      background: step.done ? "#2D5A3D" : "#F5F1E8",
                      border: step.done ? "1.5px solid #2D5A3D" : "1.5px solid #D9D2C2",
                      borderRadius: "2px",
                      transition: "background 300ms cubic-bezier(0.23, 1, 0.32, 1), border-color 300ms",
                    }}
                  >
                    {step.done && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F5F1E8" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-center leading-tight" style={{ color: step.done ? "#1F2A20" : "#8A8E83" }}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid #D9D2C2" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>USPS Tracking</p>
              <a
                href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-opacity hover:opacity-70"
                style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D" }}
              >
                {order.tracking_number}
              </a>
              {order.shipped_at && (
                <p className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>
                  Shipped {new Date(order.shipped_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {!order.tracking_number && (
            <div className="mt-4 p-3 text-xs" style={{ background: "#FBF5E8", border: "1px solid #E6C97A", color: "#A67424", borderRadius: "4px" }}>
              Awaiting tracking. Your seller has 7 days to ship from the order date.
              Auto-refund applies if no tracking is entered in time.
            </div>
          )}
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.18, ease: EASE_OUT }}
          className="mb-4 p-5"
          style={{ border: "1px solid #D9D2C2" }}
        >
          <h2 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "#8A8E83", letterSpacing: "0.1em" }}>
            Order details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "#4A5247" }}>{getItemTypeLabel(order.item_type)}</span>
              <span className="font-medium tabular" style={{ fontFamily: "var(--font-mono)", color: "#1F2A20" }}>
                ${order.item_price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#4A5247" }}>Shipping</span>
              <span className="font-medium tabular" style={{ fontFamily: "var(--font-mono)", color: "#1F2A20" }}>
                ${order.shipping_fee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-3" style={{ borderTop: "1px solid #D9D2C2" }}>
              <span className="font-medium" style={{ color: "#1F2A20" }}>Total paid</span>
              <span className="font-medium tabular" style={{ fontFamily: "var(--font-mono)", color: "#1F2A20" }}>
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {address && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #D9D2C2" }}>
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>Shipping to</p>
              <p className="text-sm font-medium" style={{ color: "#1F2A20" }}>{address.name}</p>
              <p className="text-xs" style={{ color: "#4A5247" }}>{address.street}, {address.city}, {address.state} {address.zip}</p>
            </div>
          )}
        </motion.div>

        {/* Environmental impact */}
        {impact && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.24, ease: EASE_OUT }}
            className="mb-4 p-5"
            style={{ border: "1px solid #D9D2C2", background: "#EDE6D3" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "#8A8E83", letterSpacing: "0.08em" }}>
              Your purchase saved
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: impact.waterDisplay, label: "water" },
                { value: impact.energyDisplay, label: "energy" },
                { value: impact.co2Display, label: "CO₂" },
              ].map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.32 + i * 0.08, ease: EASE_OUT }}
                >
                  <div
                    className="text-xl font-medium mb-0.5 tabular"
                    style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D", fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </div>
                  <div className="text-xs" style={{ color: "#8A8E83" }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Refund status messages */}
        <AnimatePresence>
          {order.refund_status === "requested" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="mb-4 p-4 text-sm"
              style={{ background: "#FBF5E8", border: "1px solid #E6C97A", color: "#A67424", borderRadius: "4px" }}
            >
              Your refund claim is under review. Our team will respond within 1–2 business days.
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {order.refund_status === "issued" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="mb-4 p-4 text-sm"
              style={{ background: "#EDF4EE", border: "1px solid #A8C5A0", color: "#2D5A3D", borderRadius: "4px" }}
            >
              Refund issued. Allow 3–5 business days to appear in your PayPal account.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refund claim section */}
        <AnimatePresence mode="wait">
          {canFileClaim && refundStep === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.32, delay: 0.3, ease: EASE_OUT }}
              className="p-5"
              style={{ border: "1px solid #D9D2C2" }}
            >
              <h2 className="text-sm font-medium mb-1" style={{ color: "#1F2A20" }}>Problem with this order?</h2>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: "#8A8E83" }}>
                If the item was not as described or never arrived, you may file a claim within 7 days of delivery.
                All sales are otherwise final.
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.1 }}
                onClick={() => setRefundStep("form")}
                className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "#8B3A2E" }}
              >
                Report a problem
              </motion.button>
            </motion.div>
          )}

          {(refundStep === "form" || refundStep === "submitting") && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="p-5"
              style={{ border: "1px solid #D9D2C2" }}
            >
              <h2 className="text-sm font-medium mb-3" style={{ color: "#1F2A20" }}>Report a problem</h2>
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A5247" }}>
                  Describe the issue <span style={{ color: "#8B3A2E" }}>*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #D9D2C2",
                    borderRadius: "4px",
                    background: "transparent",
                    outline: "none",
                    fontSize: "14px",
                    color: "#1F2A20",
                    resize: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                  placeholder="Item was stained / not the size described / never arrived…"
                />
              </div>
              <AnimatePresence>
                {refundError && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs mb-3"
                    style={{ color: "#8B3A2E" }}
                  >
                    {refundError}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => setRefundStep("idle")}
                  className="flex-1 py-2.5 text-sm font-medium"
                  style={{
                    border: "1px solid #D9D2C2",
                    color: "#4A5247",
                    borderRadius: "4px",
                    transition: "background 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  onClick={handleRefundRequest}
                  disabled={!refundReason.trim() || refundStep === "submitting"}
                  className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: "#8B3A2E", color: "#F5F1E8", borderRadius: "4px" }}
                >
                  {refundStep === "submitting" ? "Submitting…" : "Submit claim"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {refundStep === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38, ease: EASE_OUT }}
              className="p-4 text-sm"
              style={{ background: "#EDF4EE", border: "1px solid #A8C5A0", color: "#2D5A3D", borderRadius: "4px" }}
            >
              Claim submitted. We&apos;ll review it and respond within 1–2 business days.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
