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
  pendingNewSchools: number;
  totalCamps: number;
  totalSchools: number;
  waitlistEntries: number;
}

function StatCard({ label, value, href, color, icon }: {
  label: string;
  value: number | string;
  href: string;
  color: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
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
    pendingNewCamps: 0, pendingNewSchools: 0,
    totalCamps: 0, totalSchools: 0, waitlistEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        pendingSell,
        pendingBuy,
        pendingDonations,
        pendingNewCamps,
        pendingNewSchools,
        { count: totalCamps },
        { count: totalSchools },
        { count: waitlistEntries },
      ] = await Promise.all([
        adminApi.count("camp_requests",   [{ col: "status", eq: "pending" }, { col: "is_donation", eq: false }]),
        adminApi.count("buy_requests",    [{ col: "status", eq: "pending" }]),
        adminApi.count("camp_requests",   [{ col: "status", eq: "pending" }, { col: "is_donation", eq: true }]),
        adminApi.count("new_camp_requests",  [{ col: "status", eq: "pending" }]),
        adminApi.count("new_school_requests",[{ col: "status", eq: "pending" }]),
        // camps/schools/waitlist have public read — can use anon client
        supabase.from("camps").select("*", { count: "exact", head: true }),
        supabase.from("schools").select("*", { count: "exact", head: true }),
        supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("notified", false),
      ]);

      setStats({
        pendingSell:       pendingSell.count   ?? 0,
        pendingBuy:        pendingBuy.count    ?? 0,
        pendingDonations:  pendingDonations.count ?? 0,
        pendingNewCamps:   pendingNewCamps.count  ?? 0,
        pendingNewSchools: pendingNewSchools.count ?? 0,
        totalCamps:        totalCamps  ?? 0,
        totalSchools:      totalSchools ?? 0,
        waitlistEntries:   waitlistEntries ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const totalPending = stats.pendingSell + stats.pendingBuy + stats.pendingDonations + stats.pendingNewCamps + stats.pendingNewSchools;

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
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <StatCard label="Sell Submissions" value={stats.pendingSell}    href="/admin/sell-submissions" color="#7fb069" icon="📦" />
          <StatCard label="Buy Requests"     value={stats.pendingBuy}     href="/admin/buy-requests"     color="#4a90e2" icon="🛒" />
          <StatCard label="Donations"        value={stats.pendingDonations} href="/admin/donations"      color="#f59e0b" icon="💚" />
          <StatCard label="New Camps"        value={stats.pendingNewCamps}  href="/admin/new-camps"      color="#7fb069" icon="🏕️" />
          <StatCard label="New Schools"      value={stats.pendingNewSchools} href="/admin/new-schools"   color="#4a90e2" icon="🎓" />
        </div>
      </div>

      {/* Overview */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Total Camps"   value={stats.totalCamps}     href="/admin/inventory" color="#7fb069" icon="🏕️" />
          <StatCard label="Total Schools" value={stats.totalSchools}   href="/admin/inventory" color="#4a90e2" icon="🎓" />
          <StatCard label="Waitlist"      value={stats.waitlistEntries} href="/admin/waitlist" color="#a78bfa" icon="🔔" />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/sell-submissions" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2d5016] hover:bg-[#4a7c2c] transition-colors">
            Review Submissions
          </Link>
          <Link href="/admin/buy-requests" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2e5a8f] transition-colors">
            Process Buy Requests
          </Link>
          <Link href="/admin/inventory" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
            View Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
