"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp, Item } from "@/app/lib/supabaseClient";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TYPE_SECTIONS = [
  { value: "tshirt", label: "T-Shirt", price: 22 },
  { value: "hat",    label: "Hat",     price: 12 },
  { value: "hoodie", label: "Hoodie",  price: 30 },
] as const;

const tileVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.09, ease: EASE_OUT },
  }),
};

export default function CampPage() {
  const { slug } = useParams() as { slug: string };
  const [camp, setCamp]         = useState<Camp | null>(null);
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: campData } = await supabase
        .from("camps")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!campData) { setNotFound(true); setLoading(false); return; }
      setCamp(campData);

      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("camp_id", campData.id);
      setItems(itemData ?? []);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (notFound) {
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
            Camp not found
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8A8E83" }}>
            We couldn&apos;t find a camp with that name.
          </p>
          <Link
            href="/camps"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#2D5A3D" }}
          >
            ← All camps
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Header */}
      <div className="px-6 py-14" style={{ borderBottom: "1px solid #D9D2C2" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
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
              All camps
            </Link>
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-10 w-64" style={{ borderRadius: "2px" }} />
              <div className="skeleton h-4 w-40" style={{ borderRadius: "2px" }} />
            </div>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.48, delay: 0.06, ease: EASE_OUT }}
                className="mb-2"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: "'opsz' 72, 'soft' 40",
                  fontSize: "clamp(28px, 4vw, 44px)",
                  color: "#1F2A20",
                }}
              >
                {camp?.name}
              </motion.h1>
              {camp?.location && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.16, ease: EASE_OUT }}
                  className="text-sm"
                  style={{ color: "#8A8E83" }}
                >
                  {camp.location}
                </motion.p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Type tiles */}
      <div className="px-6 py-10" style={{ maxWidth: "960px", margin: "0 auto" }}>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ border: "1px solid #D9D2C2", background: "#D9D2C2" }}>
            {TYPE_SECTIONS.map((t) => (
              <div key={t.value} className="p-6" style={{ background: "#F5F1E8" }}>
                <div className="skeleton h-5 w-20 mb-3" style={{ borderRadius: "2px" }} />
                <div className="skeleton h-4 w-24" style={{ borderRadius: "2px" }} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-px"
            style={{ border: "1px solid #D9D2C2", background: "#D9D2C2" }}
          >
            {TYPE_SECTIONS.map((type, i) => {
              const typeItems  = items.filter((it) => it.item_type === type.value);
              const totalStock = typeItems.reduce((s, it) => s + it.available_count, 0);
              const hasStock   = totalStock > 0;
              const preview    = typeItems.find((it) => it.image_url);

              return (
                <motion.div
                  key={type.value}
                  custom={i}
                  variants={tileVariants}
                  initial="hidden"
                  animate="visible"
                  whileTap={{ scale: 0.98 }}
                  style={{ transition: "none" }}
                >
                  <Link
                    href={`/camps/${slug}/${type.value}`}
                    className="group flex gap-4 p-6 h-full"
                    style={{
                      background: "#F5F1E8",
                      display: "flex",
                      transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F1E8"; }}
                  >
                    {/* Preview image */}
                    <div
                      className="w-14 h-14 overflow-hidden flex-shrink-0"
                      style={{ background: "#EDE6D3" }}
                    >
                      {preview?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview.image_url}
                          alt={type.label}
                          className="w-full h-full object-cover"
                          style={{ transition: "transform 280ms cubic-bezier(0.23, 1, 0.32, 1)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.07)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs" style={{ color: "#8A8E83" }}>{type.label[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium text-sm mb-1"
                        style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                      >
                        {type.label}
                      </div>
                      <div className="text-xs mb-1.5 tabular" style={{ color: "#8A8E83", fontFamily: "var(--font-mono)" }}>
                        ${type.price} · incl. shipping
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: hasStock ? "#2D5A3D" : "#8A8E83" }}
                      >
                        {hasStock ? `${totalStock} in stock` : "None available"}
                      </div>
                    </div>

                    <svg
                      className="w-4 h-4 flex-shrink-0 self-center group-hover:translate-x-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{
                        color: "#D9D2C2",
                        transition: "transform 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Sell CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38, ease: EASE_OUT }}
            className="mt-10 pt-8"
            style={{ borderTop: "1px solid #D9D2C2" }}
          >
            <p className="text-sm mb-3" style={{ color: "#8A8E83" }}>
              Have {camp?.name ?? "camp"} gear to sell?
            </p>
            <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
              <Link
                href="/submit"
                className="inline-block px-5 py-2.5 text-sm font-medium"
                style={{
                  border: "1px solid #D9D2C2",
                  color: "#4A5247",
                  borderRadius: "4px",
                  transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                List an item
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
