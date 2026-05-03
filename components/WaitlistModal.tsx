"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";


interface WaitlistModalProps {
  item: Item;
  theme?: "camp";
  onClose: () => void;
}

export function WaitlistModal({ item, onClose }: WaitlistModalProps) {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError]   = useState("");

  const primaryColor = "#2d5016";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const { data: userData } = await supabase.auth.getUser();

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: item.id,
        email,
        user_id: userData.user?.id ?? null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setStatus("error");
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setStatus("success");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "var(--font-fraunces)" }}>
              Join the Waitlist
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {getItemTypeLabel(item.item_type)} · Size {item.size}
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

        <div className="p-5">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-lg border-2 flex items-center justify-center mx-auto mb-4" style={{ borderColor: primaryColor }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">You&apos;re on the list</h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                We&apos;ll email <strong>{email}</strong> as soon as this item is back in stock.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: primaryColor }}
              >
                Got it
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                This item is currently out of stock. Leave your email and we&apos;ll notify you the moment it&apos;s available.
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 py-2.5 rounded text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: primaryColor }}
                >
                  {status === "loading" ? "Saving…" : "Notify Me"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
