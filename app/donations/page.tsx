"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import { BRAND_EMAIL } from "@/lib/brand";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface DonationItem {
  id: string;
  created_at: string;
  camp_id: string | null;
  item_type: string;
  size: string;
  condition: string;
  image_url: string | null;
  seller_email: string;
  status: string;
}

interface CampRow { id: string; name: string; }

const conditionDot: Record<string, string> = {
  new:  "#2D5A3D",
  good: "#C8932F",
  fair: "#8A8E83",
};

export default function DonationsPage() {
  const [items, setItems]     = useState<DonationItem[]>([]);
  const [camps, setCamps]     = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: donations }, { data: campRows }] = await Promise.all([
        supabase
          .from("camp_requests")
          .select("id, created_at, camp_id, item_type, size, condition, image_url, seller_email, status")
          .eq("is_donation", true)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        supabase.from("camps").select("id, name"),
      ]);

      const campMap: Record<string, string> = {};
      (campRows as CampRow[] | null)?.forEach((c) => { campMap[c.id] = c.name; });

      setItems((donations as DonationItem[]) ?? []);
      setCamps(campMap);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Header */}
      <div className="px-6 py-14" style={{ borderBottom: "1px solid #D9D2C2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <Link
              href="/camps"
              className="inline-flex items-center gap-1.5 text-xs mb-6"
              style={{
                color: "#8A8E83",
                transition: "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Browse camps
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.06, ease: EASE_OUT }}
          >
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "#8A8E83", letterSpacing: "0.12em" }}>
              Free items
            </p>
            <h1
              className="mb-3"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 72, 'soft' 40",
                fontSize: "clamp(28px, 4vw, 44px)",
                color: "#1F2A20",
              }}
            >
              Donated gear
            </h1>
            <p className="text-sm max-w-md" style={{ color: "#8A8E83" }}>
              Families donating gear they&apos;ve outgrown. Free to claim — submit a request and we&apos;ll connect you.
              Every item is reviewed before it appears here.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-10" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ border: "1px solid #D9D2C2" }}>
                <div className="skeleton aspect-square" />
                <div className="p-3 space-y-2" style={{ borderTop: "1px solid #D9D2C2" }}>
                  <div className="skeleton h-4 w-3/4" style={{ borderRadius: "2px" }} />
                  <div className="skeleton h-3 w-1/2" style={{ borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="py-20"
            style={{ maxWidth: "400px" }}
          >
            <h3
              className="font-medium mb-2 text-base"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20" }}
            >
              No donations available right now
            </h3>
            <p className="text-sm mb-6" style={{ color: "#8A8E83" }}>
              Check back soon — new items are added regularly.
            </p>
            <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>
              <Link
                href="/camps"
                className="inline-block px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}
              >
                Browse camps
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-sm mb-6"
              style={{ color: "#8A8E83" }}
            >
              {items.length} item{items.length !== 1 ? "s" : ""} available
            </motion.p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.38, delay: i * 0.05, ease: EASE_OUT }}
                  whileTap={{ scale: 0.98 }}
                  className="overflow-hidden flex flex-col"
                  style={{
                    border: "1px solid #D9D2C2",
                    background: "#F5F1E8",
                    transition: "border-color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#8A8E83"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D9D2C2"; }}
                >
                  <div className="relative aspect-square overflow-hidden" style={{ background: "#EDE6D3" }}>
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={getItemTypeLabel(item.item_type)}
                        className="w-full h-full object-cover photo-warm"
                        style={{ transition: "transform 280ms cubic-bezier(0.23, 1, 0.32, 1)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs" style={{ color: "#8A8E83" }}>{getItemTypeLabel(item.item_type)}</span>
                      </div>
                    )}
                    <div
                      className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5"
                      style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "2px" }}
                    >
                      Free
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1" style={{ borderTop: "1px solid #D9D2C2" }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="font-medium text-sm"
                        style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                      >
                        {getItemTypeLabel(item.item_type)}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "#8A8E83" }}>
                      <span className="px-1.5 py-0.5" style={{ background: "#EDE6D3", color: "#4A5247", borderRadius: "2px" }}>
                        {item.size}
                      </span>
                      <span style={{ color: "#D9D2C2" }}>·</span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: conditionDot[item.condition] ?? "#8A8E83", display: "inline-block" }}
                        />
                        {getConditionLabel(item.condition)}
                      </span>
                    </div>
                    {item.camp_id && camps[item.camp_id] && (
                      <p className="text-xs mb-3 truncate" style={{ color: "#8A8E83" }}>
                        {camps[item.camp_id]}
                      </p>
                    )}
                    <div className="mt-auto">
                      <motion.a
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.1 }}
                        href={`mailto:${BRAND_EMAIL}?subject=Donation Claim - ${getItemTypeLabel(item.item_type)} (${item.size})&body=Hi, I'd like to claim the donated ${getItemTypeLabel(item.item_type)} (Size ${item.size}, ID: ${item.id}).`}
                        className="w-full block text-center py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
                      >
                        Request this item
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
