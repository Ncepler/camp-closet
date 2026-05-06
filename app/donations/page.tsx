"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";

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

const conditionColors: Record<string, string> = {
  new:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  good: "bg-amber-50 text-amber-700 border border-amber-200",
  fair: "bg-orange-50 text-orange-700 border border-orange-200",
};

export default function DonationsPage() {
  const [items, setItems]   = useState<DonationItem[]>([]);
  const [camps, setCamps]   = useState<Record<string, string>>({});
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
    <div className="min-h-screen" style={{ background: "#f8faf6" }}>
      {/* Header */}
      <div className="py-14 px-6" style={{ background: "#2d5016" }}>
        <div className="max-w-5xl mx-auto">
          <Link href="/camps" className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-6 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Browse Camps
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Free Items</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
            Donated Gear
          </h1>
          <p className="text-white/60 text-sm max-w-md">
            Families donating gear they&apos;ve outgrown. Free to claim — just submit a request and we&apos;ll connect you.
            Every item is reviewed before it appears here.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No donations available right now</h3>
            <p className="text-gray-400 text-sm mb-6">Check back soon — new items are added regularly.</p>
            <Link
              href="/camps"
              className="px-5 py-2.5 rounded-md text-white font-medium text-sm inline-block transition-opacity hover:opacity-90"
              style={{ background: "#2d5016" }}
            >
              Browse Camps Instead
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {items.length} item{items.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={getItemTypeLabel(item.item_type)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-400">{getItemTypeLabel(item.item_type)}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${conditionColors[item.condition] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                        {getConditionLabel(item.condition)}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#2d5016] text-white">Free</span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{getItemTypeLabel(item.item_type)}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 mb-3">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Size {item.size}</span>
                      {item.camp_id && camps[item.camp_id] && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="truncate">{camps[item.camp_id].replace(/^camp\s+/i, "")}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-auto">
                      <a
                        href={`mailto:hello@campcloset.com?subject=Donation Claim - ${getItemTypeLabel(item.item_type)} (${item.size})&body=Hi, I'd like to claim the donated ${getItemTypeLabel(item.item_type)} (Size ${item.size}, ID: ${item.id}).`}
                        className="w-full block text-center py-2 rounded text-white text-xs font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "#2d5016" }}
                      >
                        Request This Item
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
