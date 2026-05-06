"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp, Item } from "@/app/lib/supabaseClient";
import { ItemCard } from "@/components/ItemCard";
import { WaitlistModal } from "@/components/WaitlistModal";

const TYPE_SECTIONS = [
  { value: "tshirt",  label: "T-Shirt", price: 22 },
  { value: "hat",     label: "Hat",     price: 12 },
  { value: "hoodie",  label: "Hoodie",  price: 30 },
] as const;

export default function CampPage() {
  const { slug } = useParams() as { slug: string };
  const [camp, setCamp]         = useState<Camp | null>(null);
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [waitlistItem, setWaitlistItem] = useState<Item | null>(null);

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
        .order("item_type");
      setItems(itemData ?? []);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Camp not found</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t find a camp with that name.</p>
          <Link href="/camps" className="px-5 py-2.5 rounded-md text-white font-medium text-sm bg-[#2d5016] hover:opacity-90 transition-opacity">
            Back to Camps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8faf6" }}>
      {/* Hero */}
      <div className="relative py-16 px-6" style={{ background: "#1a3310" }}>
        {camp?.main_image && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={camp.main_image} alt={camp?.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto">
          <Link href="/camps" className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-6 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Camps
          </Link>
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 w-64 bg-white/20 rounded animate-pulse" />
              <div className="h-5 w-48 bg-white/20 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>
                {camp?.name}
              </h1>
              {camp?.location && (
                <p className="text-white/70 flex items-center gap-1.5 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {camp.location}
                </p>
              )}
              {camp?.description && (
                <p className="text-white/70 max-w-2xl leading-relaxed">{camp.description}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3 Type Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TYPE_SECTIONS.map((t) => (
              <div key={t.value} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="h-5 w-24 bg-gray-100 rounded animate-pulse mb-1" />
                  <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-16 h-16 rounded bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TYPE_SECTIONS.map((type) => {
              const typeItems = items.filter((i) => i.item_type === type.value);
              const available = typeItems.filter((i) => i.available_count > 0);
              const hasStock  = available.length > 0;

              return (
                <div key={type.value} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                  {/* Section header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
                        {type.label}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">${type.price} · shipping included</p>
                    </div>
                    {hasStock ? (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {available.reduce((s, i) => s + i.available_count, 0)} in stock
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                        Out of stock
                      </span>
                    )}
                  </div>

                  {hasStock ? (
                    /* Item cards */
                    <div className="p-4 grid gap-4 flex-1">
                      {available.map((item, i) => (
                        <ItemCard key={item.id} item={item} theme="camp" animationDelay={i * 60} />
                      ))}
                    </div>
                  ) : (
                    /* Out-of-stock skeleton placeholder */
                    <div className="p-5 flex-1 flex flex-col items-center justify-center gap-4">
                      <div className="w-full space-y-2 opacity-40">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded bg-gray-200 flex-shrink-0" />
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-3 w-3/4 bg-gray-200 rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                            <div className="h-6 w-full bg-gray-200 rounded mt-1" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        No {type.label.toLowerCase()}s available right now.
                      </p>
                      {typeItems.length > 0 ? (
                        <button
                          onClick={() => setWaitlistItem(typeItems[0])}
                          className="text-xs font-medium text-[#2d5016] border border-[#2d5016]/40 px-4 py-1.5 rounded hover:bg-[#2d5016]/5 transition-colors"
                        >
                          Join Waitlist
                        </button>
                      ) : (
                        <Link
                          href="/submit"
                          className="text-xs font-medium text-[#2d5016] border border-[#2d5016]/40 px-4 py-1.5 rounded hover:bg-[#2d5016]/5 transition-colors"
                        >
                          Sell one here
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sell CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-3">Have {camp?.name ?? "camp"} gear to sell?</p>
          <Link
            href="/submit"
            className="inline-block px-6 py-2.5 rounded-md text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ background: "#2d5016" }}
          >
            List an Item
          </Link>
        </div>
      </div>

      {waitlistItem && (
        <WaitlistModal
          item={waitlistItem}
          theme="camp"
          onClose={() => setWaitlistItem(null)}
        />
      )}
    </div>
  );
}
