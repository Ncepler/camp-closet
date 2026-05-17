"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";

interface ClaimModalProps {
  item: Item;
  onClose: () => void;
}

type ModalState = "idle" | "submitting" | "rate_limited";

export function ClaimModal({ item, onClose }: ClaimModalProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [daysUntilReset, setDaysUntilReset] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    fetch("/api/items/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id }),
    })
      .then((r) => r.json())
      .then((d) => { if (typeof d.view_count === "number" && d.view_count > 0) setViewCount(d.view_count); })
      .catch(() => {});
  }, [item.id]);

  const handleClaim = async () => {
    if (!note.trim()) return;
    setModalState("submitting");
    setError("");
    try {
      const { data: { session } } = await import("@/app/lib/supabaseClient").then((m) => m.supabase.auth.getSession());
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ listing_id: item.id, claimer_note: note.trim() }),
      });
      const data = await res.json();

      if (data.error === "claim_rate_limit_exceeded") {
        setDaysUntilReset(data.days_until_reset ?? null);
        setModalState("rate_limited");
        return;
      }

      if (!data.success) {
        setError(data.error ?? "Something went wrong. Try again.");
        setModalState("idle");
        return;
      }

      onClose();
      router.push(`/claims/${data.claim_id}`);
    } catch {
      setError("Network error. Try again.");
      setModalState("idle");
    }
  };

  const isSubmitting = modalState === "submitting";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(31,42,32,0.5)" }}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto flex flex-col"
        style={{
          maxWidth: "480px",
          background: "#F5F1E8",
          border: "1px solid #D9D2C2",
          borderRadius: "4px",
        }}
      >
        {/* Item context strip */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #D9D2C2" }}>
          <p className="text-xs" style={{ color: "#8A8E83" }}>
            {getItemTypeLabel(item.item_type)} · Size {item.size} · {getConditionLabel(item.condition)}
          </p>
        </div>

        <div className="px-6 py-6">
          {modalState === "rate_limited" ? (
            /* ── Rate limit state ── */
            <div>
              <h2
                className="mb-4 leading-tight"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 72, 'soft' 40",
                  fontSize: "22px",
                  color: "#1F2A20",
                }}
              >
                You've reached your claim limit.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#4A5247" }}>
                You've claimed 2 items in the last 30 days.{" "}
                {daysUntilReset != null && daysUntilReset > 0
                  ? `Free claims reset in ${daysUntilReset} day${daysUntilReset !== 1 ? "s" : ""}.`
                  : "Your limit resets soon."}{" "}
                You can still buy items normally any time.
              </p>
              <button
                onClick={onClose}
                className="mt-6 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "#8A8E83" }}
              >
                Close
              </button>
            </div>
          ) : (
            /* ── Main claim state ── */
            <>
              <h2
                className="mb-2 leading-tight"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 72, 'soft' 40",
                  fontSize: "clamp(20px, 3vw, 26px)",
                  color: "#1F2A20",
                }}
              >
                Quick check before you claim.
              </h2>

              {viewCount !== null && (
                <p className="text-xs mb-5" style={{ color: "#8A8E83" }}>
                  {viewCount} other {viewCount === 1 ? "person has" : "people have"} viewed this item today.
                </p>
              )}

              <div className="space-y-4 text-sm leading-relaxed mb-6" style={{ color: "#4A5247" }}>
                <p>
                  Free items on Another Summer are donated by other camp parents. There's no application — we trust people to take what they need.
                </p>
                <p>
                  Before you claim this, take a second: would your family be okay buying this gear new or used at full price? If yes, please leave it for someone who'd struggle to. There's plenty here to buy that supports the platform too.
                </p>
              </div>

              {/* Required note */}
              <div className="mb-6">
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A5247" }}>
                  In a sentence — what's this for? <span style={{ color: "#8B3A2E" }}>*</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 280))}
                  placeholder={`e.g., "My daughter starts at Camp Echo Lake in July and we're tight this year."`}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #D9D2C2",
                    borderRadius: "4px",
                    background: "transparent",
                    outline: "none",
                    fontSize: "13px",
                    color: "#1F2A20",
                    resize: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                />
                <p className="text-xs mt-1" style={{ color: "#8A8E83" }}>
                  Required. The donor will see this.
                </p>
              </div>

              {error && (
                <p className="text-xs mb-4 p-3" style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}>
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-sm transition-opacity hover:opacity-70 disabled:opacity-40 text-left sm:text-center"
                  style={{ color: "#8A8E83" }}
                >
                  Leave it for someone else
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isSubmitting || !note.trim()}
                  className="px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 w-full sm:w-auto"
                  style={{ background: "#C8932F", color: "#F5F1E8", borderRadius: "4px", whiteSpace: "nowrap" }}
                >
                  {isSubmitting ? "Claiming…" : "Claim it"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
