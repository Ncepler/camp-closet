"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";

interface WaitlistModalProps {
  item: Item;
  theme: "camp" | "school";
  onClose: () => void;
}

export function WaitlistModal({ item, theme, onClose }: WaitlistModalProps) {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError]   = useState("");

  const primaryColor = theme === "camp" ? "#2d5016" : "#1e3a5f";
  const accentColor  = theme === "camp" ? "#7fb069" : "#4a90e2";

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

    const { error: insertError } = await supabase.from("waitlist").insert({
      user_id:  userData.user?.id ?? null,
      item_id:  item.id,
      email,
      notified: false,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setStatus("success"); // Already on waitlist, treat as success
      } else {
        setStatus("error");
        setError(insertError.message);
      }
    } else {
      setStatus("success");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${accentColor}15)` }}
        >
          <div>
            <h2 className="font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
              Join the Waitlist
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {getItemTypeLabel(item.item_type)} · Size {item.size}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {status === "success" ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🔔</div>
              <h3 className="font-semibold text-gray-900 mb-2">You&apos;re on the list!</h3>
              <p className="text-sm text-gray-500 mb-5">
                We&apos;ll email <strong>{email}</strong> as soon as this item is back in stock.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                Got it
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                This item is currently out of stock. Leave your email and we&apos;ll notify you the moment it&apos;s available.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
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
