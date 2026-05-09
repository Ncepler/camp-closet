"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import { getImpact } from "@/app/lib/impact";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: unknown) => void;
      }) => { render: (container: string) => Promise<void> };
    };
  }
}

interface BuyModalProps {
  item: Item;
  onClose: () => void;
}

type ModalStep = "form" | "payment" | "capturing" | "success";

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  borderBottom: "1px solid #D9D2C2",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  background: "transparent",
  outline: "none",
  fontSize: "14px",
  color: "#1F2A20",
  borderRadius: "0",
};

export function BuyModal({ item, onClose }: BuyModalProps) {
  const router = useRouter();

  const [step, setStep]         = useState<ModalStep>("form");
  const [email, setEmail]       = useState("");
  const [isTestUser, setIsTestUser] = useState(false);
  const [userId, setUserId]     = useState<string | null>(null);
  const [address, setAddress]   = useState<Address>({ name: "", street: "", city: "", state: "", zip: "" });
  const [error, setError]       = useState("");
  const [orderId, setOrderId]   = useState<string | null>(null);

  const paypalLoaded  = useRef(false);
  const paypalMounted = useRef(false);

  const impact = getImpact(item.item_type);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
        setIsTestUser(data.user.email === "admintester@gmail.com");
      }
      if (data.user?.id) setUserId(data.user.id);
    });
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (step !== "payment") return;
    if (paypalMounted.current) return;

    const renderButton = () => {
      if (!window.paypal || paypalMounted.current) return;
      paypalMounted.current = true;

      window.paypal.Buttons({
        createOrder: async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: item.id }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          return data.order_id as string;
        },
        onApprove: async (data: { orderID: string }) => {
          setStep("capturing");
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paypal_order_id: data.orderID,
              item_id: item.id,
              buyer_user_id: userId,
              buyer_email: email,
              buyer_name: address.name,
              buyer_address: JSON.stringify(address),
            }),
          });
          const result = await res.json();
          if (result.success) {
            setOrderId(result.order_id);
            setStep("success");
          } else {
            setError(result.error ?? "Payment failed. Please contact support.");
            setStep("payment");
            paypalMounted.current = false;
          }
        },
        onError: () => {
          setError("PayPal encountered an error. Please try again.");
          paypalMounted.current = false;
        },
      }).render("#paypal-button-container").catch(() => {
        paypalMounted.current = false;
      });
    };

    if (window.paypal) {
      renderButton();
    } else if (!paypalLoaded.current) {
      paypalLoaded.current = true;
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      const env = process.env.NEXT_PUBLIC_PAYPAL_ENV ?? "sandbox";
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture${env === "sandbox" ? "&debug=true" : ""}`;
      script.onload = renderButton;
      script.onerror = () => setError("Failed to load PayPal. Check your connection and try again.");
      document.head.appendChild(script);
    }
  }, [step, item.id, userId, email, address]);

  const isAddressValid =
    address.name.trim() && address.street.trim() &&
    address.city.trim() && address.state.trim() && address.zip.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(31,42,32,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: "#F5F1E8",
          borderRadius: "4px",
          boxShadow: "0 24px 64px rgba(31,42,32,0.18), 0 4px 16px rgba(31,42,32,0.08)",
          border: "1px solid #D9D2C2",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid #D9D2C2" }}
        >
          <div>
            <h2
              className="font-medium text-sm"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              {step === "success" ? "Order confirmed" : "Complete your purchase"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>
              {getItemTypeLabel(item.item_type)} · Size {item.size} · {getConditionLabel(item.condition)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 transition-opacity hover:opacity-60"
            style={{ color: "#4A5247" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">

          {/* Success */}
          {step === "success" && (
            <div className="text-center py-6">
              <div
                className="w-10 h-10 flex items-center justify-center mx-auto mb-4"
                style={{ border: "1.5px solid #2D5A3D", borderRadius: "2px" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#2D5A3D" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3
                className="font-medium mb-1 text-base"
                style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 48, 'soft' 30" }}
              >
                Payment successful
              </h3>
              <p className="text-xs mb-5 leading-relaxed max-w-xs mx-auto" style={{ color: "#4A5247" }}>
                The seller has been notified and has 7 days to ship. You'll get an email
                with a USPS tracking number when it's on the way.
              </p>
              {impact && (
                <div
                  className="p-4 mb-5 text-left"
                  style={{ background: "#EDE6D3", border: "1px solid #D9D2C2", borderRadius: "4px" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8A8E83" }}>
                    Your purchase saved
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "water",  value: impact.waterDisplay  },
                      { label: "energy", value: impact.energyDisplay },
                      { label: "CO₂",    value: impact.co2Display    },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div
                          className="text-base font-medium tabular"
                          style={{ color: "#2D5A3D", fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                        >
                          {value}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                {orderId && (
                  <button
                    onClick={() => { onClose(); router.push(`/orders/${orderId}`); }}
                    className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
                  >
                    Track order
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Capturing */}
          {step === "capturing" && (
            <div className="text-center py-12">
              <div
                className="w-7 h-7 border-2 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: "#D9D2C2", borderTopColor: "#2D5A3D" }}
              />
              <p className="text-sm" style={{ color: "#4A5247" }}>Processing payment…</p>
            </div>
          )}

          {/* Form / Payment */}
          {(step === "form" || step === "payment") && (
            <>
              {/* Price summary */}
              <div
                className="p-4 mb-5"
                style={{ background: "#EDE6D3", border: "1px solid #D9D2C2", borderRadius: "4px" }}
              >
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#4A5247" }}>{getItemTypeLabel(item.item_type)}</span>
                  <span className="font-medium tabular" style={{ color: "#1F2A20", fontFamily: "var(--font-mono)" }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#4A5247" }}>Shipping</span>
                  <span style={{ color: "#8A8E83" }}>Included</span>
                </div>
                <div
                  className="pt-2 flex justify-between font-semibold text-sm"
                  style={{ borderTop: "1px solid #D9D2C2" }}
                >
                  <span style={{ color: "#1F2A20" }}>Total</span>
                  <span className="tabular" style={{ fontFamily: "var(--font-mono)", color: "#1F2A20" }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {step === "form" && (
                <>
                  <p className="text-xs mb-5 leading-relaxed" style={{ color: "#4A5247" }}>
                    Enter where you want this shipped. We pass it to the seller so they can send it —
                    it's not shown anywhere public.
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: "Full Name",       key: "name",   type: "text",  placeholder: "Jane Smith",  autoComplete: "name" },
                      { label: "Street Address",  key: "street", type: "text",  placeholder: "123 Main St", autoComplete: "street-address" },
                    ].map(({ label, key, type, placeholder, autoComplete }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1" style={{ color: "#4A5247" }}>{label}</label>
                        <input
                          type={type}
                          value={address[key as keyof Address]}
                          onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                          placeholder={placeholder}
                          autoComplete={autoComplete}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-6 gap-3">
                      <div className="col-span-3">
                        <label className="block text-xs font-medium mb-1" style={{ color: "#4A5247" }}>City</label>
                        <input type="text" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} placeholder="Boston" autoComplete="address-level2" style={inputStyle} />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium mb-1" style={{ color: "#4A5247" }}>State</label>
                        <input type="text" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} placeholder="MA" maxLength={2} autoComplete="address-level1" style={inputStyle} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1" style={{ color: "#4A5247" }}>ZIP</label>
                        <input type="text" value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} placeholder="02101" maxLength={10} autoComplete="postal-code" style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#4A5247" }}>Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={!!userId} style={{ ...inputStyle, color: userId ? "#8A8E83" : "#1F2A20" }} />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs mt-3 p-3" style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}>{error}</p>
                  )}

                  <div className="flex gap-3 mt-5">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium transition-colors" style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}>
                      Cancel
                    </button>
                    <button
                      onClick={() => { setError(""); setStep("payment"); }}
                      disabled={!isAddressValid || !email}
                      className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
                    >
                      Continue to payment
                    </button>
                  </div>
                </>
              )}

              {step === "payment" && (
                <>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: "#4A5247" }}>
                    Shipping to <strong>{address.name}</strong> at {address.street}, {address.city}, {address.state} {address.zip}.{" "}
                    <button onClick={() => { setStep("form"); paypalMounted.current = false; }} className="underline" style={{ color: "#2D5A3D" }}>
                      Change
                    </button>
                  </p>

                  {error && (
                    <p className="text-xs mb-4 p-3" style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}>{error}</p>
                  )}

                  {isTestUser ? (
                    <button
                      onClick={async () => {
                        setStep("capturing");
                        setError("");
                        const res = await fetch("/api/paypal/test-purchase", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ item_id: item.id, buyer_user_id: userId, buyer_email: email, buyer_name: address.name, buyer_address: JSON.stringify(address) }),
                        });
                        const result = await res.json();
                        if (result.success) { setOrderId(result.order_id); setStep("success"); }
                        else { setError(result.error ?? "Test purchase failed."); setStep("payment"); }
                      }}
                      className="w-full py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
                    >
                      Complete test purchase (no payment)
                    </button>
                  ) : (
                    <div id="paypal-button-container" className="min-h-[50px]" />
                  )}

                  <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: "#8A8E83" }}>
                    All sales are final. Full refund if the seller doesn't ship or the item is significantly different from the listing.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
