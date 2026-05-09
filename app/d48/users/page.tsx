"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/app/lib/adminApi";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface ActivityRow {
  userId: string;
  date: string;
  type: "purchase" | "sale" | "listing";
}

interface UserWithActivity extends Profile {
  lastActivity: ActivityRow | null;
}

interface OrderRow {
  id: string;
  buyer_user_id: string | null;
  seller_user_id: string | null;
  created_at: string;
  status: string;
  item_type: string;
  total_amount: number;
  seller_payout: number;
}

interface RequestRow {
  id: string;
  user_id: string | null;
  created_at: string;
  status: string;
  item_type: string;
}

interface ClaimRow {
  id: string;
  claimer_id: string | null;
  created_at: string;
  status: string;
}

interface UserDetail {
  purchaseCount: number;
  totalSpent: number;
  saleCount: number;
  totalEarned: number;
  listingCount: number;
  listingsPending: number;
  listingsApproved: number;
  claimCount: number;
  purchases: OrderRow[];
  sales: OrderRow[];
  listings: RequestRow[];
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtRelative(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function UsersPage() {
  const [users, setUsers]         = useState<UserWithActivity[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<UserWithActivity | null>(null);
  const [detail, setDetail]       = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, ordersRes, requestsRes] = await Promise.all([
        adminApi.select<Profile>("profiles", { columns: "id, email, full_name, phone, created_at", orderBy: "created_at", orderAsc: false }),
        adminApi.select<OrderRow>("orders", { columns: "id, buyer_user_id, seller_user_id, created_at, status, item_type, total_amount, seller_payout", orderBy: "created_at", orderAsc: false }),
        adminApi.select<RequestRow>("camp_requests", { columns: "id, user_id, created_at, status, item_type", orderBy: "created_at", orderAsc: false }),
      ]);

      const profiles = profilesRes.data ?? [];
      const orders   = ordersRes.data ?? [];
      const requests = requestsRes.data ?? [];

      // Build last-activity map per userId
      const activityMap: Record<string, ActivityRow> = {};

      const consider = (userId: string | null, date: string, type: ActivityRow["type"]) => {
        if (!userId) return;
        const existing = activityMap[userId];
        if (!existing || date > existing.date) {
          activityMap[userId] = { userId, date, type };
        }
      };

      orders.forEach((o) => {
        consider(o.buyer_user_id, o.created_at, "purchase");
        consider(o.seller_user_id, o.created_at, "sale");
      });
      requests.forEach((r) => consider(r.user_id, r.created_at, "listing"));

      const enriched: UserWithActivity[] = profiles.map((p) => ({
        ...p,
        lastActivity: activityMap[p.id] ?? null,
      }));

      setUsers(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const loadDetail = useCallback(async (userId: string) => {
    setDetailLoading(true);
    setDetail(null);

    const [buyOrdersRes, sellOrdersRes, listingsRes, claimsRes] = await Promise.all([
      adminApi.select<OrderRow>("orders", {
        columns: "id, buyer_user_id, created_at, status, item_type, total_amount, seller_payout",
        filters: [{ col: "buyer_user_id", eq: userId }],
        orderBy: "created_at",
        orderAsc: false,
      }),
      adminApi.select<OrderRow>("orders", {
        columns: "id, seller_user_id, created_at, status, item_type, total_amount, seller_payout",
        filters: [{ col: "seller_user_id", eq: userId }],
        orderBy: "created_at",
        orderAsc: false,
      }),
      adminApi.select<RequestRow>("camp_requests", {
        columns: "id, user_id, created_at, status, item_type",
        filters: [{ col: "user_id", eq: userId }],
        orderBy: "created_at",
        orderAsc: false,
      }),
      adminApi.select<ClaimRow>("claims", {
        columns: "id, claimer_id, created_at, status",
        filters: [{ col: "claimer_id", eq: userId }],
        orderBy: "created_at",
        orderAsc: false,
      }),
    ]);

    const purchases = (buyOrdersRes.data ?? []).filter((o) => o.status !== "refunded" && o.status !== "cancelled");
    const sales     = (sellOrdersRes.data ?? []).filter((o) => o.status !== "refunded" && o.status !== "cancelled");
    const listings  = listingsRes.data ?? [];
    const claims    = (claimsRes.data ?? []).filter((c) => c.status !== "cancelled");

    setDetail({
      purchaseCount:    purchases.length,
      totalSpent:       purchases.reduce((s, o) => s + (o.total_amount ?? 0), 0),
      saleCount:        sales.length,
      totalEarned:      sales.reduce((s, o) => s + (o.seller_payout ?? 0), 0),
      listingCount:     listings.length,
      listingsPending:  listings.filter((r) => r.status === "pending").length,
      listingsApproved: listings.filter((r) => r.status === "approved").length,
      claimCount:       claims.length,
      purchases,
      sales,
      listings,
    });
    setDetailLoading(false);
  }, []);

  const handleSelect = (u: UserWithActivity) => {
    setSelected(u);
    loadDetail(u.id);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
  });

  const activityLabel: Record<ActivityRow["type"], string> = {
    purchase: "purchase",
    sale:     "sale",
    listing:  "listing",
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main table */}
      <div className={`flex-1 min-w-0 space-y-4 transition-all ${selected ? "lg:max-w-[60%]" : ""}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-white">Users</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${users.length} account${users.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 outline-none focus:border-gray-500 transition-colors w-64 placeholder:text-gray-600"
          />
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">{search ? "No users match." : "No users yet."}</div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    className={`cursor-pointer transition-colors ${
                      selected?.id === u.id
                        ? "bg-[#2d5016]/40 border-l-2 border-[#7fb069]"
                        : "hover:bg-gray-800/50"
                    } ${i < filtered.length - 1 ? "border-b border-gray-800/60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-gray-200 font-medium text-sm">{u.full_name ?? <span className="text-gray-600">—</span>}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      {u.phone ? (
                        <a
                          href={`tel:${u.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-gray-200 transition-colors"
                        >
                          {u.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                        </a>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.lastActivity ? (
                        <>
                          <span className="text-gray-400 text-xs">{fmtRelative(u.lastActivity.date)}</span>
                          <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                              u.lastActivity.type === "purchase"
                                ? "bg-blue-900/30 text-blue-400"
                                : u.lastActivity.type === "sale"
                                ? "bg-green-900/30 text-green-400"
                                : "bg-yellow-900/30 text-yellow-400"
                            }`}
                          >
                            {activityLabel[u.lastActivity.type]}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-700 text-xs">no activity</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-sm">{selected.full_name ?? "Unnamed"}</h2>
                <p className="text-gray-500 text-xs mt-0.5 break-all">{selected.email}</p>
                {selected.phone && (
                  <p className="text-gray-500 text-xs mt-0.5 font-mono">
                    {selected.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-1">Joined {fmt(selected.created_at)}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setDetail(null); }}
                className="text-gray-600 hover:text-gray-300 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="py-6 text-center text-gray-600 text-xs">Loading…</div>
            ) : detail ? (
              <div className="space-y-5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Purchases",   value: detail.purchaseCount,              sub: `$${detail.totalSpent.toFixed(2)} spent`,  color: "text-blue-400" },
                    { label: "Sales",       value: detail.saleCount,                  sub: `$${detail.totalEarned.toFixed(2)} earned`, color: "text-green-400" },
                    { label: "Listings",    value: `${detail.listingsApproved}/${detail.listingCount}`, sub: `${detail.listingsPending} pending`, color: "text-yellow-400" },
                    { label: "Claims",      value: detail.claimCount,                 sub: "free items claimed",                       color: "text-purple-400" },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="bg-gray-800/60 rounded-lg p-3">
                      <div className={`text-lg font-bold tabular ${color}`} style={{ fontFamily: "var(--font-mono)" }}>{value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Recent purchases */}
                {detail.purchases.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Purchases</p>
                    <div className="space-y-1.5">
                      {detail.purchases.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{getItemTypeLabel(o.item_type)}</span>
                          <span className="text-gray-500 font-mono">${o.total_amount.toFixed(2)}</span>
                        </div>
                      ))}
                      {detail.purchases.length > 5 && (
                        <p className="text-xs text-gray-700">+{detail.purchases.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent sales */}
                {detail.sales.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sales</p>
                    <div className="space-y-1.5">
                      {detail.sales.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{getItemTypeLabel(o.item_type)}</span>
                          <span className="text-green-600 font-mono">+${o.seller_payout.toFixed(2)}</span>
                        </div>
                      ))}
                      {detail.sales.length > 5 && (
                        <p className="text-xs text-gray-700">+{detail.sales.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Listings */}
                {detail.listings.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Listings</p>
                    <div className="space-y-1.5">
                      {detail.listings.slice(0, 5).map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{getItemTypeLabel(r.item_type)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            r.status === "approved" ? "bg-green-900/30 text-green-500"
                            : r.status === "rejected" ? "bg-red-900/30 text-red-500"
                            : "bg-yellow-900/30 text-yellow-500"
                          }`}>{r.status}</span>
                        </div>
                      ))}
                      {detail.listings.length > 5 && (
                        <p className="text-xs text-gray-700">+{detail.listings.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {detail.purchaseCount === 0 && detail.saleCount === 0 && detail.listingCount === 0 && (
                  <p className="text-xs text-gray-700 text-center py-2">No activity yet.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
