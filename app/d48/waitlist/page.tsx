"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import type { WaitlistEntry, Item } from "@/app/lib/supabaseClient";

type EntryWithItem = WaitlistEntry & { item?: Item };

export default function WaitlistPage() {
  const [entries, setEntries]     = useState<EntryWithItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "pending" | "notified">("pending");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: wl } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false });
    if (!wl) { setLoading(false); return; }

    const itemIds = [...new Set(wl.map((e: WaitlistEntry) => e.item_id))];
    const { data: items } = await supabase.from("items").select("*").in("id", itemIds);
    const itemMap: Record<string, Item> = {};
    items?.forEach((i: Item) => { itemMap[i.id] = i; });

    setEntries(wl.map((e: WaitlistEntry) => ({ ...e, item: itemMap[e.item_id] })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter((e) => {
    if (filter === "all") return true;
    if (filter === "notified") return e.notified;
    return !e.notified;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Waitlist</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}</p>
      </div>

      <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["all", "pending", "notified"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading waitlist…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-500">No waitlist entries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">
                        {entry.item ? getItemTypeLabel(entry.item.item_type) : "Unknown Item"}
                      </div>
                      {entry.item && <div className="text-xs text-gray-500">Size {entry.item.size} · ${entry.item.price.toFixed(2)}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{entry.email}</td>
                    <td className="px-4 py-3">
                      {entry.notified ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/50">Notified</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-800/50">Waiting</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</td>
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
