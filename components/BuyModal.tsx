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

export function BuyModal({ item, onClose }: BuyModalProps) {
  const router = useRouter();
  const primaryColor = "#2d5016";

  const [step, setStep]       = useState<ModalStep>("form");
  const [email, setEmail]     = useState("");
  const [userId, setUserId]   = useState<string | null>(null);
  const [address, setAddress] = useState<Address>({ name: "", street: "", city: "", state: "", zip: "" });
  const [error, setError]     = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const paypalLoaded  = useRef(false);
  const paypalMounted = useRef(false);

  const impact = getImpact(item.item_type);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
      if (data.user?.id) setUserId(data.user.id);
    });
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Load and render PayPal button when on payment step
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
    address.name.trim() &&
    address.street.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.zip.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "var(--font-fraunces)" }}>
              {step === "success" ? "Order Confirmed" : "Complete Your Purchase"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {getItemTypeLabel(item.item_type)} · Size {item.size} · {getConditionLabel(item.condition)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">

          {/* Success state */}
          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-lg border-2 flex items-center justify-center mx-auto mb-4" style={{ borderColor: primaryColor }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-base" style={{ fontFamily: "var(--font-fraunces)" }}>
                Payment successful
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed max-w-xs mx-auto">
                The seller has been notified and has 7 days to ship. You&apos;ll get an email with a USPS tracking number when it&apos;s on the way.
              </p>
              {impact && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-5 text-left">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Your purchase saved
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-base font-bold" style={{ color: primaryColor, fontFamily: "var(--font-fraunces)" }}>
                        {impact.waterDisplay}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">water</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold" style={{ color: primaryColor, fontFamily: "var(--font-fraunces)" }}>
                        {impact.energyDisplay}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">energy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold" style={{ color: primaryColor, fontFamily: "var(--font-fraunces)" }}>
                        {impact.co2Display}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">CO2</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                {orderId && (
                  <button
                    onClick={() => { onClose(); router.push(`/orders/${orderId}`); }}
                    className="flex-1 py-2.5 rounded text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: primaryColor }}
                  >
                    Track Order
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Capturing state */}
          {step === "capturing" && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: primaryColor }} />
              <p className="text-sm text-gray-500">Processing payment…</p>
            </div>
          )}

          {/* Address form */}
          {(step === "form" || step === "payment") && (
            <>
              {/* Price breakdown */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{getItemTypeLabel(item.item_type)}</span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-500">Included</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              </div>

              {step === "form" && (
                <>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Enter where you want this shipped. We pass it to the seller so they can send it — it&apos;s not shown anywhere public.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={address.name}
                        onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
                          placeholder="Boston"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
                          placeholder="MA"
                          maxLength={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">ZIP</label>
                        <input
                          type="text"
                          value={address.zip}
                          onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
                          placeholder="02101"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors bg-gray-50"
                        readOnly={!!userId}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 mt-3">{error}</p>
                  )}

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setError(""); setStep("payment"); }}
                      disabled={!isAddressValid || !email}
                      className="flex-1 py-2.5 rounded text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: primaryColor }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </>
              )}

              {step === "payment" && (
                <>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Shipping to <strong>{address.name}</strong> at {address.street}, {address.city}, {address.state} {address.zip}.{" "}
                    <button onClick={() => { setStep("form"); paypalMounted.current = false; }} className="underline hover:text-gray-700">
                      Change
                    </button>
                  </p>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-4">{error}</p>
                  )}

                  <div id="paypal-button-container" className="min-h-[50px]" />

                  <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                    All sales are final. Full refund if the seller doesn&apos;t ship or the item is significantly different from the listing. Secured by PayPal.
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
