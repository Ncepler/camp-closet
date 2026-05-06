"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp } from "@/app/lib/supabaseClient";

function sortKey(name: string) {
  return name.replace(/^camp\s+/i, "").toLowerCase();
}

export default function CampsAdminPage() {
  const [camps, setCamps]   = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("camps").select("*");
    const sorted = (data ?? []).sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));
    setCamps(sorted);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = camps.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.location ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Camps</h1>
          <p className="text-gray-500 text-sm mt-0.5">{loading ? "Loading…" : `${camps.length} camp${camps.length !== 1 ? "s" : ""}`}</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or location…"
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white outline-none focus:border-gray-600 transition w-64 placeholder:text-gray-600"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading camps…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">{search ? "No camps match your search." : "No camps yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3 text-right pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {camp.main_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={camp.main_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: "#2d5016" }} />
                        )}
                        <span className="font-medium text-white">{camp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{camp.location ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{camp.slug}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(camp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 pr-4 text-right">
                      <Link
                        href={`/camps/${camp.slug}`}
                        target="_blank"
                        className="text-xs text-[#7fb069] hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
                      >
                        View Shop →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
