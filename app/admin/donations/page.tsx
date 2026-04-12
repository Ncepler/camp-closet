"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import type { CampRequest, SchoolRequest } from "@/app/lib/supabaseClient";

type DonationWithMeta = (CampRequest | SchoolRequest) & {
  institution?: string;
  mode: "camp" | "school";
};

const statusColors: Record<string, string> = {
  pending:  "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
  approved: "bg-green-900/30 text-green-400 border border-green-800/50",
  rejected: "bg-red-900/30 text-red-400 border border-red-800/50",
};

export default function DonationsPage() {
  const [donations, setDonations]   = useState<DonationWithMeta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: camps }, { data: schools }, { data: campDons }, { data: schoolDons }] = await Promise.all([
      supabase.from("camps").select("id, name"),
      supabase.from("schools").select("id, name"),
      supabase.from("camp_requests").select("*").eq("is_donation", true).order("created_at", { ascending: false }),
      supabase.from("school_requests").select("*").eq("is_donation", true).order("created_at", { ascending: false }),
    ]);

    const campMap: Record<string, string>   = {};
    const schoolMap: Record<string, string> = {};
    camps?.forEach((c: { id: string; name: string }) => { campMap[c.id] = c.name; });
    schools?.forEach((s: { id: string; name: string }) => { schoolMap[s.id] = s.name; });

    const all: DonationWithMeta[] = [
      ...(campDons ?? []).map((r: CampRequest) => ({ ...r, mode: "camp" as const, institution: campMap[r.camp_id ?? ""] ?? "Unknown" })),
      ...(schoolDons ?? []).map((r: SchoolRequest) => ({ ...r, mode: "school" as const, institution: schoolMap[r.school_id ?? ""] ?? "Unknown" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setDonations(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, mode: "camp" | "school", newStatus: "approved" | "rejected") => {
    setActionLoading(id);
    const table = mode === "camp" ? "camp_requests" : "school_requests";
    await supabase.from(table).update({ status: newStatus, approved_at: newStatus === "approved" ? new Date().toISOString() : null }).eq("id", id);
    await load();
    setActionLoading(null);
  };

  const filtered = donations.filter((d) => statusFilter === "all" || d.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Donations</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} donation{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading donations…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">💚</div>
            <p className="text-gray-500">No donations for these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((don) => (
                  <tr key={don.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {don.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={don.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">💚</div>
                        )}
                        <div>
                          <div className="font-medium text-white">{getItemTypeLabel(don.item_type)}</div>
                          <div className="text-xs text-gray-500">Size {don.size} · {getConditionLabel(don.condition)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{don.institution}</div>
                      <div className="text-xs text-gray-500">{don.mode === "camp" ? "🏕️" : "🎓"} {don.mode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-xs">{don.seller_email}</div>
                      {don.seller_phone && <div className="text-xs text-gray-500">{don.seller_phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[don.status]}`}>{don.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(don.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 pr-4">
                      {don.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => updateStatus(don.id, don.mode, "approved")} disabled={actionLoading === don.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2d5016] hover:bg-[#4a7c2c] transition-colors disabled:opacity-50">
                            {actionLoading === don.id ? "…" : "Approve"}
                          </button>
                          <button onClick={() => updateStatus(don.id, don.mode, "rejected")} disabled={actionLoading === don.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/40 transition-colors">
                            Reject
                          </button>
                        </div>
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
