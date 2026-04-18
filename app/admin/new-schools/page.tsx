"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/app/lib/adminApi";
import type { NewSchoolRequest } from "@/app/lib/supabaseClient";

const statusColors: Record<string, string> = {
  pending:  "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
  approved: "bg-green-900/30 text-green-400 border border-green-800/50",
  rejected: "bg-red-900/30 text-red-400 border border-red-800/50",
};

const schoolTypeLabels: Record<string, string> = {
  high_school:   "High School",
  middle_school: "Middle School",
};

export default function NewSchoolsPage() {
  const [requests, setRequests]         = useState<NewSchoolRequest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await adminApi.select<NewSchoolRequest>("new_school_requests", {
      orderBy: "created_at",
      orderAsc: false,
    });
    setRequests(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approveRequest = async (req: NewSchoolRequest) => {
    setActionLoading(req.id);
    setActionError(null);
    const result = await adminApi.approveSchool(req.id, req.school_name, req.school_type, req.location);
    if (result.error) setActionError(result.error);
    await load();
    setActionLoading(null);
  };

  const rejectRequest = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    await adminApi.update("new_school_requests", id, { status: "rejected" });
    await load();
    setActionLoading(null);
  };

  const filtered = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>New School Requests</h1>
        <p className="text-gray-500 text-sm mt-0.5">When approved, a new school is automatically created on the site.</p>
      </div>

      {actionError && (
        <div className="px-4 py-3 rounded-lg border border-red-800/50 bg-red-900/20 text-red-400 text-sm">
          {actionError}
        </div>
      )}

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
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No school requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{req.school_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#4a90e2] bg-[#4a90e2]/10 px-2 py-0.5 rounded">
                        {schoolTypeLabels[req.school_type ?? ""] ?? req.school_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{req.location ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{req.requester_email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                    </td>
                    <td className="px-4 py-3 pr-4">
                      {req.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => approveRequest(req)} disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#1e3a5f] hover:bg-[#2e5a8f] transition-colors disabled:opacity-50">
                            {actionLoading === req.id ? "Creating…" : "Approve & Create"}
                          </button>
                          <button onClick={() => rejectRequest(req.id)} disabled={actionLoading === req.id}
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
