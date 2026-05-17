"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/app/lib/adminApi";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";
import type { Order } from "@/app/lib/supabaseClient";

const TEMPLATES = [
  {
    id: "checking_in",
    label: "Checking in",
    subject: "Quick check-in on your Another Summer order",
    body: "Hi,\n\nJust checking in — it looks like your order hasn't shipped yet and we want to make sure everything is on track. Do you have an update on when it might go out?\n\nIf there's anything going on, let us know and we'll help sort it out.\n\n— Another Summer",
  },
  {
    id: "reminder_7day",
    label: "7-day reminder",
    subject: "Reminder: 7-day shipping deadline — Another Summer",
    body: "Hi,\n\nJust a reminder that sellers have 7 days to ship after a purchase, and it looks like we're getting close to that window for your order.\n\nPlease ship as soon as possible and enter your tracking number at anothersummer.com/seller. If you need more time or have a question, just reply here.\n\n— Another Summer",
  },
  {
    id: "in_transit_delay",
    label: "In transit delay",
    subject: "Your Another Summer package — update?",
    body: "Hi,\n\nWe noticed your package has been in transit for a while and wanted to check in. Has it arrived? If there's an issue with the delivery, let us know and we'll look into it.\n\n— Another Summer",
  },
  {
    id: "refund_warning",
    label: "Refund warning",
    subject: "Action needed: Another Summer order at risk of refund",
    body: "Hi,\n\nWe haven't received a tracking number for your order and the shipping deadline has passed. If you don't ship and add tracking soon, we'll need to issue a refund to the buyer.\n\nPlease ship your item and enter the USPS tracking number at anothersummer.com/seller right away. If something has come up, reply here and we'll work with you.\n\n— Another Summer",
  },
  {
    id: "all_good",
    label: "All good / FYI",
    subject: "Your Another Summer order — all set",
    body: "Hi,\n\nJust wanted to confirm everything looks good on our end. Thanks for being part of Another Summer!\n\n— Another Summer",
  },
];

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function gmailLink(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ShippingPage() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].id);
  const [copied, setCopied]             = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "shipped">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await adminApi.select<Order>("orders", {
      orderBy: "created_at",
      orderAsc: true,
    });
    const active = (data ?? []).filter((o) => o.status === "paid" || o.status === "shipped");
    setOrders(active);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const template = TEMPLATES.find((t) => t.id === activeTemplate) ?? TEMPLATES[0];
  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const copyTemplate = (id: string) => {
    const t = TEMPLATES.find((t) => t.id === id);
    if (!t) return;
    navigator.clipboard.writeText(t.body).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>
          Shipping
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {filtered.length} active order{filtered.length !== 1 ? "s" : ""} · paid and in-transit
        </p>
      </div>

      {/* Message templates */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick message templates</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTemplate === t.id
                  ? "bg-[#2d5016]/80 text-[#7fb069] border border-[#4a7c2c]/60"
                  : "text-gray-400 bg-gray-800 hover:text-gray-200 hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active template preview + copy */}
        <div className="rounded-lg border border-gray-700 bg-gray-950 p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <p className="text-xs font-medium text-gray-400">
              Subject: <span className="text-gray-200">{template.subject}</span>
            </p>
            <button
              onClick={() => copyTemplate(template.id)}
              className="flex-shrink-0 text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {copied === template.id ? "Copied" : "Copy body"}
            </button>
          </div>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "inherit" }}>
            {template.body}
          </pre>
        </div>

        <p className="text-xs text-gray-600">
          Select a template above, then click an email address below — Gmail will open with the template pre-filled.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(["all", "paid", "shipped"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {s === "all" ? "All" : s === "paid" ? "Awaiting ship" : "In transit"}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No active orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((order) => {
                  const age = daysSince(order.created_at);
                  const isLate = order.status === "paid" && age >= 5;
                  const buyerAddr = (() => {
                    try { return order.buyer_address ? JSON.parse(order.buyer_address) : null; }
                    catch { return null; }
                  })();

                  return (
                    <tr key={order.id} className={`transition-colors ${isLate ? "bg-red-950/20 hover:bg-red-950/30" : "hover:bg-gray-800/30"}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white text-sm">{getItemTypeLabel(order.item_type)}</div>
                        <div className="text-xs text-gray-500">${order.total_amount.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            order.status === "paid"
                              ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                              : "bg-purple-900/30 text-purple-400 border border-purple-800/50"
                          }`}
                        >
                          {order.status === "paid" ? "Awaiting ship" : "In transit"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${isLate ? "text-red-400" : "text-gray-400"}`}>
                          {age}d ago{isLate ? " — late" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={gmailLink(order.buyer_email, template.subject, template.body)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                        >
                          {order.buyer_email}
                        </a>
                        {buyerAddr?.name && (
                          <div className="text-xs text-gray-600 mt-0.5">{buyerAddr.name}</div>
                        )}
                        {buyerAddr?.city && (
                          <div className="text-xs text-gray-600">{buyerAddr.city}, {buyerAddr.state}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.seller_email ? (
                          <a
                            href={gmailLink(order.seller_email, template.subject, template.body)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                          >
                            {order.seller_email}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.tracking_number ? (
                          <a
                            href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 font-mono transition-colors"
                          >
                            {order.tracking_number}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
