"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp } from "@/app/lib/supabaseClient";
import { RequestModal } from "@/components/RequestModal";

function CampCard({ camp, index }: { camp: Camp; index: number }) {
  return (
    <Link
      href={`/camps/${camp.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}
    >
      {/* Camp image / placeholder */}
      <div className="relative h-44 overflow-hidden" style={{ background: "#2d5016" }}>
        {camp.main_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={camp.main_image} alt={camp.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/30 text-sm font-medium">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
            {camp.name}
          </h3>
          {camp.location && (
            <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {camp.location}
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        {camp.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{camp.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(camp.created_at).getFullYear()}
          </span>
          <span className="text-xs font-medium text-[#2d5016] flex items-center gap-1">
            View Items
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CampsPage() {
  const [camps, setCamps]         = useState<Camp[]>([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    const fetchCamps = async () => {
      const { data } = await supabase
        .from("camps")
        .select("*")
        .order("name");
      setCamps(data ?? []);
      setLoading(false);
    };
    fetchCamps();
  }, []);

  const sortKey = (name: string) =>
    name.replace(/^camp\s+/i, "").toLowerCase();

  const filtered = camps
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.location ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-14 px-6 border-b border-gray-100" style={{ background: "#2d5016" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Marketplace</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
            Camp Clothing
          </h1>
          <p className="text-white/60 text-sm mb-8 max-w-md">
            Browse gear from {camps.length || "13"}+ summer camps. Buy used, save money, and give clothing another summer.
          </p>
          {/* Search */}
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search camps by name or location…"
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-[#7fb069] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                <div className="skeleton h-44" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No camps found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {search ? `No results for "${search}"` : "No camps in the database yet."}
            </p>
            <button
              onClick={() => setShowRequest(true)}
              className="px-5 py-2.5 rounded-md text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ background: "#2d5016" }}
            >
              Request a Camp
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {filtered.length} camp{filtered.length !== 1 ? "s" : ""}{search && ` for "${search}"`}
              </p>
              <button
                onClick={() => setShowRequest(true)}
                className="text-sm px-4 py-2 rounded border border-gray-200 text-[#2d5016] font-medium hover:bg-gray-50 transition-colors"
              >
                + Request a Camp
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((camp, i) => (
                <CampCard key={camp.id} camp={camp} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      {showRequest && (
        <RequestModal onClose={() => setShowRequest(false)} />
      )}
    </div>
  );
}
