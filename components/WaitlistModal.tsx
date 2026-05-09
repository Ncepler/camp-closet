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
      body: JSON.stringify({ item_id: item.id, email, user_id: userData.user?.id ?? null }),
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(31,42,32,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-w-md w-full overflow-hidden animate-scale-in"
        style={{
          background: "#F5F1E8",
          borderRadius: "4px",
          border: "1px solid #D9D2C2",
          boxShadow: "0 24px 64px rgba(31,42,32,0.18)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #D9D2C2" }}
        >
          <div>
            <h2
              className="font-medium text-sm"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Join the waitlist
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>
              {getItemTypeLabel(item.item_type)} · Size {item.size}
            </p>
          </div>
          <button onClick={onClose} className="p-1 transition-opacity hover:opacity-60" style={{ color: "#4A5247" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {status === "success" ? (
            <div className="text-center py-8">
              <div
                className="w-10 h-10 flex items-center justify-center mx-auto mb-4"
                style={{ border: "1.5px solid #2D5A3D", borderRadius: "2px" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#2D5A3D" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3
                className="font-medium mb-2 text-sm"
                style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20" }}
              >
                You're on the list
              </h3>
              <p className="text-xs mb-6 max-w-xs mx-auto leading-relaxed" style={{ color: "#4A5247" }}>
                We'll email <strong>{email}</strong> as soon as this item is back in stock.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: "#4A5247" }}>
                This item is currently out of stock. Leave your email and we'll notify you the moment it's available.
              </p>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A5247" }}>
                  Email address <span style={{ color: "#8B3A2E" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #D9D2C2",
                    borderRadius: "4px",
                    background: "transparent",
                    outline: "none",
                    fontSize: "14px",
                    color: "#1F2A20",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                />
              </div>
              {error && (
                <p className="text-xs p-3" style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}>{error}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
                >
                  {status === "loading" ? "Saving…" : "Notify me"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
