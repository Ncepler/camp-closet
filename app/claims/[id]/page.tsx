"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";

interface ClaimWithItem {
  id: string;
  status: string;
  created_at: string;
  items: { item_type: string; size: string } | null;
}

export default function ClaimConfirmedPage() {
  const { id } = useParams() as { id: string };
  const [claim, setClaim] = useState<ClaimWithItem | null>(null);
  const [remainingClaims, setRemainingClaims] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: claimData } = await supabase
        .from("claims")
        .select("id, status, created_at, items(item_type, size)")
        .eq("id", id)
        .eq("claimer_id", user.id)
        .single();

      setClaim(claimData as ClaimWithItem | null);

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("claims")
        .select("*", { count: "exact", head: true })
        .eq("claimer_id", user.id)
        .gt("created_at", since)
        .neq("status", "cancelled");

      setRemainingClaims(Math.max(0, 2 - (count ?? 1)));
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F1E8" }}>
        <div className="w-5 h-5 border-2 border-[#D9D2C2] border-t-[#2D5A3D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F5F1E8" }}>
        <div style={{ maxWidth: "400px" }}>
          <h1 className="font-medium mb-2" style={{ fontFamily: "var(--font-fraunces)", fontSize: "24px", color: "#1F2A20" }}>
            Claim not found
          </h1>
          <Link href="/camps" className="text-sm" style={{ color: "#2D5A3D" }}>
            Browse the marketplace →
          </Link>
        </div>
      </div>
    );
  }

  const itemLabel = claim.items ? getItemTypeLabel(claim.items.item_type) : "Item";

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>
      <div className="px-6 py-20" style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div
          className="w-10 h-10 flex items-center justify-center mb-8"
          style={{ border: "1.5px solid #2D5A3D", borderRadius: "2px" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#2D5A3D" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1
          className="mb-4 leading-tight"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontVariationSettings: "'opsz' 96, 'soft' 50",
            fontSize: "clamp(32px, 5vw, 48px)",
            color: "#1F2A20",
          }}
        >
          Claimed.
        </h1>

        <p className="text-base leading-relaxed mb-10" style={{ color: "#4A5247", maxWidth: "440px" }}>
          {itemLabel} is on its way to you. The donor will ship within 3 days.
          We'll email when it's out.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/camps"
            className="px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
          >
            Browse the marketplace
          </Link>
          <Link
            href="/seller"
            className="px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}
          >
            My account
          </Link>
        </div>

        {remainingClaims !== null && (
          <p className="text-xs" style={{ color: "#8A8E83" }}>
            You have {remainingClaims} free {remainingClaims === 1 ? "claim" : "claims"} remaining this month.
          </p>
        )}
      </div>
    </div>
  );
}
