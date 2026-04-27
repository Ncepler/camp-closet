"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { School, Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import { calcTotalImpact } from "@/app/lib/impact";
import { ItemCard } from "@/components/ItemCard";

const schoolTypeLabels: Record<string, string> = {
  high_school:   "High School",
  middle_school: "Middle School",
};

export default function SchoolPage() {
  const { slug } = useParams() as { slug: string };
  const [school, setSchool]     = useState<School | null>(null);
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [sortBy, setSortBy]     = useState("type");
  const [search, setSearch]     = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: schoolData } = await supabase
        .from("schools")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!schoolData) { setNotFound(true); setLoading(false); return; }
      setSchool(schoolData);

      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("school_id", schoolData.id)
        .order("item_type");
      setItems(itemData ?? []);
      setLoading(false);
    };
    load();
  }, [slug]);

  const filteredItems = items
    .filter((item) => {
      const matchType = filter === "all" || item.item_type === filter;
      const matchSearch =
        search === "" ||
        getItemTypeLabel(item.item_type).toLowerCase().includes(search.toLowerCase()) ||
        item.size.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc")  return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock")      return b.available_count - a.available_count;
      return a.item_type.localeCompare(b.item_type);
    });

  const usedTypes = [...new Set(items.map((i) => i.item_type))];

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">School not found</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t find a school with that name.</p>
          <Link href="/schools" className="px-5 py-2.5 rounded-md text-white font-medium text-sm bg-[#1e3a5f] hover:opacity-90 transition-opacity">
            Back to Schools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--school-bg)" }}>
      {/* Hero */}
      <div className="relative py-16 px-6" style={{ background: "#0f1e33" }}>
        {school?.main_image && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={school.main_image} alt={school?.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto">
          <Link href="/schools" className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-6 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Schools
          </Link>
          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-10 w-64 bg-white/20" />
              <div className="skeleton h-5 w-48 bg-white/20" />
            </div>
          ) : (
            <>
              {school?.school_type && (
                <span className="inline-block bg-white/10 border border-white/20 text-white/70 text-xs font-medium px-3 py-1 rounded mb-3">
                  {schoolTypeLabels[school.school_type]}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>
                {school?.name}
              </h1>
              {school?.location && (
                <p className="text-white/70 flex items-center gap-1.5 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {school.location}
                </p>
              )}
              {school?.description && (
                <p className="text-white/70 max-w-2xl leading-relaxed">{school.description}</p>
              )}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{items.length}</div>
                  <div className="text-white/60 text-xs mt-0.5">Item Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {items.reduce((s, i) => s + i.available_count, 0)}
                  </div>
                  <div className="text-white/60 text-xs mt-0.5">Available</div>
                </div>
                {(() => {
                  const impact = calcTotalImpact(
                    items.flatMap((i) => Array.from({ length: i.available_count }, () => ({ item_type: i.item_type })))
                  );
                  return impact.energy > 0 ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{impact.energy} kWh</div>
                      <div className="text-white/60 text-xs mt-0.5">energy in stock to save</div>
                    </div>
                  ) : null;
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-shrink-0">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4a90e2] w-36 sm:w-48"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button onClick={() => setFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === "all" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              All
            </button>
            {usedTypes.map((type) => (
              <button key={type} onClick={() => setFilter(type)}
                className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === type ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {getItemTypeLabel(type)}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-600">
            <option value="type">Sort: Type</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="stock">Most Available</option>
          </select>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                <div className="skeleton aspect-square" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-8 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {filter !== "all" || search ? "Try clearing your filters" : "This school has no items yet. Be the first to sell!"}
            </p>
            <Link href="/submit" className="px-5 py-2.5 rounded-md text-white font-medium text-sm inline-block transition-opacity hover:opacity-90" style={{ background: "#1e3a5f" }}>
              Sell an Item
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#4f5d75] mb-5">
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              {filter !== "all" && ` in ${getItemTypeLabel(filter)}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item, i) => (
                <ItemCard key={item.id} item={item} theme="school" animationDelay={i * 50} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
