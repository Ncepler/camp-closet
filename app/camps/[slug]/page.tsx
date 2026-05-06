"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp, Item } from "@/app/lib/supabaseClient";

const TYPE_SECTIONS = [
  { value: "tshirt", label: "T-Shirt", price: 22 },
  { value: "hat",    label: "Hat",     price: 12 },
  { value: "hoodie", label: "Hoodie",  price: 30 },
] as const;

export default function CampPage() {
  const { slug } = useParams() as { slug: string };
  const [camp, setCamp]       = useState<Camp | null>(null);
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
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

      {/* Type tiles */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TYPE_SECTIONS.map((t) => (
              <div key={t.value} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TYPE_SECTIONS.map((type) => {
              const typeItems  = items.filter((i) => i.item_type === type.value);
              const totalStock = typeItems.reduce((s, i) => s + i.available_count, 0);
              const hasStock   = totalStock > 0;
              const preview    = typeItems.find((i) => i.image_url);

              return (
                <Link
                  key={type.value}
                  href={`/camps/${slug}/${type.value}`}
                  className={`group bg-white rounded-lg border overflow-hidden flex items-center gap-4 p-4 transition-all ${
                    hasStock
                      ? "border-gray-200 hover:border-[#2d5016]/40 hover:shadow-md"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  {/* Small preview image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {preview?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview.image_url}
                        alt={type.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#f0f4ee" }}>
                        <span className="text-[10px] text-gray-400 font-medium">{type.label[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "var(--font-fraunces)" }}>
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">${type.price} · incl. shipping</div>
                    <div className={`text-xs font-medium mt-1 ${hasStock ? "text-emerald-600" : "text-gray-400"}`}>
                      {hasStock ? `${totalStock} in stock` : "None available"}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${hasStock ? "text-gray-400" : "text-gray-300"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
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
    </div>
  );
}
