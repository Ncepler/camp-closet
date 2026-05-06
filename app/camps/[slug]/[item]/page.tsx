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

  const [camp, setCamp]       = useState<Camp | null>(null);
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const meta = TYPE_META[item];

  useEffect(() => {
    const load = async () => {
      // Step 1: slug → camp
      const { data: campData } = await supabase
        .from("camps")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!campData) { setNotFound(true); setLoading(false); return; }
      setCamp(campData);

      // Step 2: camp + item_type → items
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not found</h1>
          <Link href="/camps" className="text-sm text-[#2d5016] hover:underline">Back to Camps</Link>
        </div>
      </div>
    );
  }

  const totalStock = items.reduce((s, i) => s + i.available_count, 0);

  return (
    <div className="min-h-screen" style={{ background: "#f8faf6" }}>
      {/* Header */}
      <div className="relative py-14 px-6" style={{ background: "#1a3310" }}>
        {camp?.main_image && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={camp.main_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto">
          <Link
            href={`/camps/${slug}`}
            className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-6 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {loading ? "Back" : camp?.name}
          </Link>

          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
                {meta?.label ?? item}
              </h1>
              {meta && (
                <p className="text-white/60 text-sm">${meta.price} · shipping included</p>
              )}
            </div>
            {!loading && (
              <span className={`mb-1 text-sm font-medium px-3 py-1 rounded-full ${
                totalStock > 0
                  ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800/60"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }`}>
                {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  <div className="h-8 w-full bg-gray-100 rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No {meta?.label.toLowerCase() ?? item} listed yet</h3>
            <p className="text-gray-400 text-sm mb-6">Be the first to sell one for {camp?.name}.</p>
            <Link
              href="/submit"
              className="px-5 py-2.5 rounded-md text-white font-medium text-sm inline-block transition-opacity hover:opacity-90"
              style={{ background: "#2d5016" }}
            >
              Sell an Item
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
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
