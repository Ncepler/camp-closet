"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp, Item } from "@/app/lib/supabaseClient";
import { ItemCard } from "@/components/ItemCard";

const TYPE_META: Record<string, { label: string; price: number }> = {
  tshirt: { label: "T-Shirts", price: 22 },
  hat:    { label: "Hats",     price: 12 },
  hoodie: { label: "Hoodies",  price: 30 },
};

export default function CampItemTypePage() {
  const { slug, item } = useParams() as { slug: string; item: string };

  const [camp, setCamp]         = useState<Camp | null>(null);
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const meta = TYPE_META[item];

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
        .eq("camp_id", campData.id)
        .eq("item_type", item)
        .order("available_count", { ascending: false });

      setItems(itemData ?? []);
      setLoading(false);
    };
    load();
  }, [slug, item]);

  if (notFound || (!loading && !meta)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F5F1E8" }}>
        <div style={{ maxWidth: "400px" }}>
          <h1 className="font-medium mb-2" style={{ fontFamily: "var(--font-fraunces)", fontSize: "24px", color: "#1F2A20" }}>
            Not found
          </h1>
          <Link href="/camps" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#2D5A3D" }}>
            ← Back to camps
          </Link>
        </div>
      </div>
    );
  }

  const totalStock = items.reduce((s, i) => s + i.available_count, 0);

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Header */}
      <div className="px-6 py-14" style={{ borderBottom: "1px solid #D9D2C2" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <Link
            href={`/camps/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70"
            style={{ color: "#8A8E83" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {loading ? "Back" : camp?.name}
          </Link>

          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-10 w-48" style={{ borderRadius: "2px" }} />
              <div className="skeleton h-4 w-32" style={{ borderRadius: "2px" }} />
            </div>
          ) : (
            <div className="flex items-end gap-5 flex-wrap">
              <div>
                <h1
                  className="mb-1"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontVariationSettings: "'opsz' 72, 'soft' 40",
                    fontSize: "clamp(28px, 4vw, 44px)",
                    color: "#1F2A20",
                  }}
                >
                  {meta?.label ?? item}
                </h1>
                {meta && (
                  <p className="text-sm tabular" style={{ color: "#8A8E83", fontFamily: "var(--font-mono)" }}>
                    ${meta.price} · shipping included
                  </p>
                )}
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 mb-1"
                style={{
                  color: totalStock > 0 ? "#2D5A3D" : "#8A8E83",
                  border: `1px solid ${totalStock > 0 ? "#A8C5A0" : "#D9D2C2"}`,
                  background: totalStock > 0 ? "#EDF4EE" : "#F5F1E8",
                  borderRadius: "2px",
                }}
              >
                {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items grid */}
      <div className="px-6 py-10" style={{ maxWidth: "1080px", margin: "0 auto" }}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ border: "1px solid #D9D2C2" }}>
                <div className="skeleton aspect-square" />
                <div className="p-3 space-y-2" style={{ borderTop: "1px solid #D9D2C2" }}>
                  <div className="skeleton h-4 w-3/4" style={{ borderRadius: "2px" }} />
                  <div className="skeleton h-3 w-1/2" style={{ borderRadius: "2px" }} />
                  <div className="skeleton h-8 w-full mt-2" style={{ borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20" style={{ maxWidth: "400px" }}>
            <h3
              className="font-medium mb-2 text-base"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20" }}
            >
              No {meta?.label.toLowerCase() ?? item} listed yet
            </h3>
            <p className="text-sm mb-6" style={{ color: "#8A8E83" }}>
              Be the first to sell one for {camp?.name}.
            </p>
            <Link
              href="/submit"
              className="inline-block px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
            >
              List an item
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: "#8A8E83" }}>
              {items.length} listing{items.length !== 1 ? "s" : ""} · {totalStock} available
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((it, i) => (
                <ItemCard key={it.id} item={it} theme="camp" animationDelay={i * 50} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
