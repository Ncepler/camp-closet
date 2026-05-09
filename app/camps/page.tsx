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
      className="group block overflow-hidden animate-fade-in"
      style={{
        border: "1px solid #D9D2C2",
        animationDelay: `${index * 60}ms`,
        opacity: 0,
        animationFillMode: "forwards",
        borderRadius: "0px",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#8A8E83"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D9D2C2"; }}
    >
      {/* Camp image */}
      <div className="relative h-40 overflow-hidden" style={{ background: "#EDE6D3" }}>
        {camp.main_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={camp.main_image}
            alt={camp.name}
            className="w-full h-full object-cover transition-transform duration-200"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs" style={{ color: "#8A8E83" }}>No image</span>
          </div>
        )}
      </div>

      <div className="p-4" style={{ borderTop: "1px solid #D9D2C2", background: "#F5F1E8" }}>
        <h3
          className="font-medium text-sm leading-tight mb-1"
          style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
        >
          {camp.name}
        </h3>
        {camp.location && (
          <p className="text-xs mb-3" style={{ color: "#8A8E83" }}>{camp.location}</p>
        )}
        <span className="text-xs font-medium transition-opacity group-hover:opacity-70" style={{ color: "#2D5A3D" }}>
          Browse gear →
        </span>
      </div>
    </Link>
  );
}

export default function CampsPage() {
  const [camps, setCamps]             = useState<Camp[]>([]);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    supabase.from("camps").select("*").order("name").then(({ data }) => {
      setCamps(data ?? []);
      setLoading(false);
    });
  }, []);

  const sortKey = (name: string) => name.replace(/^camp\s+/i, "").toLowerCase();

  const filtered = camps
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.location ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Header */}
      <div className="px-6 py-14" style={{ borderBottom: "1px solid #D9D2C2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "#8A8E83", letterSpacing: "0.12em" }}>
            Marketplace
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
            Camp clothing, organized by camp
          </h1>
          <p className="text-sm mb-6 max-w-md" style={{ color: "#8A8E83" }}>
            Used gear from {camps.length > 0 ? `${camps.length}` : "13"}+ summer camps. Every item reviewed before it goes live.
          </p>

          {/* Search */}
          <div className="relative" style={{ maxWidth: "400px" }}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: "#8A8E83" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by camp name or location…"
              style={{
                width: "100%",
                paddingLeft: "36px",
                paddingRight: "16px",
                paddingTop: "10px",
                paddingBottom: "10px",
                border: "1px solid #D9D2C2",
                borderRadius: "4px",
                background: "transparent",
                outline: "none",
                fontSize: "14px",
                color: "#1F2A20",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-10" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ border: "1px solid #D9D2C2" }}>
                <div className="skeleton h-40" />
                <div className="p-4 space-y-2" style={{ borderTop: "1px solid #D9D2C2" }}>
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20" style={{ maxWidth: "400px" }}>
            <h3
              className="font-medium mb-2 text-base"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20" }}
            >
              No camps found
            </h3>
            <p className="text-sm mb-6" style={{ color: "#8A8E83" }}>
              {search ? `No results for "${search}". ` : ""}
              Don't see your camp? Request it.
            </p>
            <button
              onClick={() => setShowRequest(true)}
              className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
            >
              Request a camp
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "#8A8E83" }}>
                {filtered.length} camp{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}
              </p>
              <button
                onClick={() => setShowRequest(true)}
                className="text-sm font-medium px-4 py-2 transition-colors"
                style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                Request a camp
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

      {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
    </div>
  );
}
