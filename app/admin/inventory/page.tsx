"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { adminApi } from "@/app/lib/adminApi";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import type { Item, Camp, School } from "@/app/lib/supabaseClient";

type ItemWithMeta = Item & { institution?: string; mode: "camp" | "school" };

export default function InventoryPage() {
  const [items, setItems]       = useState<ItemWithMeta[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "camp" | "school">("all");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue]     = useState<number>(0);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: camps }, { data: schools }, { data: allItems }] = await Promise.all([
      supabase.from("camps").select("id, name"),
      supabase.from("schools").select("id, name"),
      supabase.from("items").select("*").order("created_at", { ascending: false }),
    ]);

    const campMap: Record<string, string>   = {};
    const schoolMap: Record<string, string> = {};
    camps?.forEach((c: { id: string; name: string }) => { campMap[c.id] = c.name; });
    schools?.forEach((s: { id: string; name: string }) => { schoolMap[s.id] = s.name; });

    const withMeta: ItemWithMeta[] = (allItems ?? []).map((item: Item) => ({
      ...item,
      mode:        item.camp_id ? "camp" : "school",
      institution: item.camp_id ? campMap[item.camp_id] : schoolMap[item.school_id ?? ""],
    }));
    setItems(withMeta);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveStock = async (id: string) => {
    setSaving(true);
    await adminApi.update("items", id, { available_count: stockValue });
    setEditingStock(null);
    await load();
    setSaving(false);
  };

  const filtered = items.filter((item) => {
    const matchMode = modeFilter === "all" || item.mode === modeFilter;
    const matchSearch =
      search === "" ||
      getItemTypeLabel(item.item_type).toLowerCase().includes(search.toLowerCase()) ||
      (item.institution ?? "").toLowerCase().includes(search.toLowerCase()) ||
      item.size.toLowerCase().includes(search.toLowerCase());
    return matchMode && matchSearch;
  });

  const totalItems     = items.length;
  const totalAvailable = items.reduce((s, i) => s + i.available_count, 0);
  const outOfStock     = items.filter((i) => i.available_count === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} item type{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">{totalItems}</div>
            <div className="text-xs text-gray-500">Types</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-[#7fb069]">{totalAvailable}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-red-400">{outOfStock}</div>
            <div className="text-xs text-gray-500">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items, institution, size…"
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white outline-none focus:border-gray-600 transition w-64"
        />
        <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {(["all", "camp", "school"] as const).map((m) => (
            <button key={m} onClick={() => setModeFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${modeFilter === m ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {m === "all" ? "All" : m === "camp" ? "🏕️ Camps" : "🎓 Schools"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">No items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-right pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-base flex-shrink-0">👕</div>
                        )}
                        <span className="font-medium text-white">{getItemTypeLabel(item.item_type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300 text-xs">{item.institution}</div>
                      <div className="text-gray-600 text-xs">{item.mode === "camp" ? "🏕️" : "🎓"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{item.size}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{getConditionLabel(item.condition)}</td>
                    <td className="px-4 py-3 text-[#7fb069] font-medium text-sm">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {editingStock === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={stockValue}
                            onChange={(e) => setStockValue(Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs outline-none"
                          />
                          <button onClick={() => saveStock(item.id)} disabled={saving}
                            className="px-2 py-1 rounded bg-[#2d5016] text-white text-xs disabled:opacity-50">
                            {saving ? "…" : "✓"}
                          </button>
                          <button onClick={() => setEditingStock(null)}
                            className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-xs">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className={`text-sm font-semibold ${item.available_count === 0 ? "text-red-400" : "text-white"}`}>
                          {item.available_count}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 pr-4 text-right">
                      {editingStock !== item.id && (
                        <button
                          onClick={() => { setEditingStock(item.id); setStockValue(item.available_count); }}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800"
                        >
                          Edit Stock
                        </button>
                      )}
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
