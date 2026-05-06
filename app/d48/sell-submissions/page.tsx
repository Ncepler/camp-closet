"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { adminApi } from "@/app/lib/adminApi";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import type { CampRequest } from "@/app/lib/supabaseClient";

type RequestWithMeta = CampRequest & { institution: string };

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const statusColors: Record<string, string> = {
  pending:  "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
  approved: "bg-green-900/30 text-green-400 border border-green-800/50",
  rejected: "bg-red-900/30 text-red-400 border border-red-800/50",
};

export default function SellSubmissionsPage() {
  const [requests, setRequests]         = useState<RequestWithMeta[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal]     = useState<{ id: string; bulk?: boolean } | null>(null);
  const [rejectReason, setRejectReason]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [
      { data: campsData },
      { data: campReqs },
    ] = await Promise.all([
      supabase.from("camps").select("id, name"),
      adminApi.select<CampRequest>("camp_requests", {
        filters: [{ col: "is_donation", eq: false }],
        orderBy: "created_at",
        orderAsc: false,
      }),
    ]);

    const campMap: Record<string, string> = {};
    (campsData as { id: string; name: string }[] | null)?.forEach((c) => { campMap[c.id] = c.name; });

    const all: RequestWithMeta[] = (campReqs ?? []).map((r) => ({
      ...r,
      institution: campMap[r.camp_id ?? ""] ?? "Unknown Camp",
    }));

    setRequests(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoading(id);
    await adminApi.update("camp_requests", id, {
      status:      newStatus,
      approved_at: newStatus === "approved" ? new Date().toISOString() : null,
    });
    await load();
    setActionLoading(null);
  };

  const bulkAction = async (newStatus: "approved" | "rejected") => {
    setActionLoading("bulk");
    const selectedArr = Array.from(selected);
    for (const id of selectedArr) {
      await adminApi.update("camp_requests", id, {
        status:      newStatus,
        approved_at: newStatus === "approved" ? new Date().toISOString() : null,
      });
    }
    setSelected(new Set());
    await load();
    setActionLoading(null);
  };

  const handleReject = () => {
    if (!rejectModal) return;
    if (rejectModal.bulk) {
      bulkAction("rejected");
    } else {
      updateStatus(rejectModal.id, "rejected");
    }
    setRejectModal(null);
    setRejectReason("");
  };

  const filtered = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Sell Submissions</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} submission{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button onClick={() => bulkAction("approved")} disabled={actionLoading === "bulk"}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2d5016] hover:bg-[#4a7c2c] transition-colors disabled:opacity-50">
              Approve {selected.size}
            </button>
            <button onClick={() => { setRejectModal({ id: "bulk", bulk: true }); setRejectReason(""); }} disabled={actionLoading === "bulk"}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 transition-colors">
              Reject {selected.size}
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading submissions…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No submissions for these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pl-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.filter((r) => r.status === "pending").length && filtered.some((r) => r.status === "pending")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(new Set(filtered.filter((r) => r.status === "pending").map((r) => r.id)));
                        } else {
                          setSelected(new Set());
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((req) => (
                  <tr key={req.id} className={`hover:bg-gray-800/30 transition-colors ${selected.has(req.id) ? "bg-gray-800/50" : ""}`}>
                    <td className="pl-4 py-3">
                      {req.status === "pending" && (
                        <input type="checkbox" checked={selected.has(req.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(req.id); else next.delete(req.id);
                            setSelected(next);
                          }}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {req.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={req.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl flex-shrink-0 text-gray-600">—</div>
                        )}
                        <div>
                          <div className="font-medium text-white">{getItemTypeLabel(req.item_type)}</div>
                          <div className="text-xs text-gray-500">Size {req.size} · {getConditionLabel(req.condition)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{req.institution}</div>
                    </td>
                    <td className="px-4 py-3">
                      {req.seller_name && (
                        <div className="text-white text-xs font-medium">{req.seller_name}</div>
                      )}
                      <div className="text-gray-300 text-xs">{req.seller_email}</div>
                      {req.seller_phone && <div className="text-xs text-gray-500">{req.seller_phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 pr-4">
                      {req.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => updateStatus(req.id, "approved")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2d5016] hover:bg-[#4a7c2c] transition-colors disabled:opacity-50"
                          >
                            {actionLoading === req.id ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: req.id }); setRejectReason(""); }}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/40 transition-colors"
                          >
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
      {/* Rejection reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-lg mb-1">Reject listing</h2>
            <p className="text-gray-500 text-sm mb-4">
              Optionally add a reason — it will be included in the email sent to the seller.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Photo is too dark to verify condition — please resubmit with better lighting."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-900/30 border border-red-900/50 hover:bg-red-900/50 transition-colors"
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
