"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/app/lib/adminApi";
import { supabase } from "@/app/lib/supabaseClient";

interface Stats {
  pendingSell: number;
  pendingBuy: number;
  pendingDonations: number;
  pendingNewCamps: number;
  totalCamps: number;
  waitlistEntries: number;
}

const PAYOUTS = [
  { item: "T-Shirt",  price: 22, paypal: 1.15, platform: 3.13, seller: 17.72 },
  { item: "Hat",      price: 12, paypal: 0.85, platform: 1.67, seller: 9.48  },
  { item: "Hoodie",   price: 30, paypal: 1.39, platform: 4.29, seller: 24.32 },
];

function StatCard({ label, value, href, color }: {
  label: string;
  value: number | string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
    >
      <div className="flex items-start justify-end mb-3">
        <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    pendingSell: 0, pendingBuy: 0, pendingDonations: 0,
    pendingNewCamps: 0, totalCamps: 0, waitlistEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        pendingSell,
        pendingBuy,
        pendingDonations,
        pendingNewCamps,
        { count: totalCamps },
        { count: waitlistEntries },
      ] = await Promise.all([
        adminApi.count("camp_requests",  [{ col: "status", eq: "pending" }, { col: "is_donation", eq: false }]),
        adminApi.count("buy_requests",   [{ col: "status", eq: "pending" }]),
        adminApi.count("camp_requests",  [{ col: "status", eq: "pending" }, { col: "is_donation", eq: true }]),
        adminApi.count("new_camp_requests", [{ col: "status", eq: "pending" }]),
        supabase.from("camps").select("*", { count: "exact", head: true }),
        supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("notified", false),
      ]);

      setStats({
        pendingSell:      pendingSell.count      ?? 0,
        pendingBuy:       pendingBuy.count       ?? 0,
        pendingDonations: pendingDonations.count ?? 0,
        pendingNewCamps:  pendingNewCamps.count  ?? 0,
        totalCamps:       totalCamps             ?? 0,
        waitlistEntries:  waitlistEntries        ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const totalPending = stats.pendingSell + stats.pendingBuy + stats.pendingDonations + stats.pendingNewCamps;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          {loading ? "Loading…" : totalPending > 0
            ? `${totalPending} item${totalPending !== 1 ? "s" : ""} need your attention`
            : "Everything is up to date"}
        </p>
      </div>

      {/* Pending actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pending Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Sell Submissions" value={stats.pendingSell}      href="/d48/sell-submissions" color="#7fb069" />
          <StatCard label="Buy Requests"     value={stats.pendingBuy}       href="/d48/buy-requests"     color="#4a90e2" />
          <StatCard label="Donations"        value={stats.pendingDonations} href="/d48/donations"        color="#f59e0b" />
          <StatCard label="New Camps"        value={stats.pendingNewCamps}  href="/d48/new-camps"        color="#7fb069" />
        </div>
      </div>

      {/* Overview */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Total Camps" value={stats.totalCamps}      href="/d48/camps"     color="#7fb069" />
          <StatCard label="Waitlist"    value={stats.waitlistEntries} href="/d48/waitlist"  color="#a78bfa" />
        </div>
      </div>

      {/* Payout breakdown */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payout Breakdown</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">PayPal Fee</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform 15%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller Gets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {PAYOUTS.map((p) => (
                <tr key={p.item}>
                  <td className="px-4 py-3 text-white font-medium">{p.item}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-red-400">-${p.paypal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-yellow-400">-${p.platform.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-[#7fb069] font-semibold">${p.seller.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            PayPal rate: 2.99% + $0.49 per transaction. Platform fee: 15% of item price.
            Seller net is before their shipping cost (~$4 hat, ~$5 tee, ~$7 hoodie via USPS).
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/d48/sell-submissions" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2d5016] hover:bg-[#4a7c2c] transition-colors">
            Review Submissions
          </Link>
          <Link href="/d48/buy-requests" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2e5a8f] transition-colors">
            Process Buy Requests
          </Link>
          <Link href="/d48/inventory" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
            View Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
