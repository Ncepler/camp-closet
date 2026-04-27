import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { refundPayPalCapture } from "@/app/lib/paypal";

// Secured with CRON_SECRET env var.
// Configure in Vercel: Settings → Cron Jobs → /api/cron/auto-refund, schedule "0 9 * * *" (daily 9am UTC)

function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();
  const cutoff = addBusinessDays(new Date(), -5).toISOString();

  // Orders that are paid, no tracking entered, and past the 5-business-day deadline
  const { data: overdueOrders, error } = await db
    .from("orders")
    .select("*")
    .eq("status", "paid")
    .is("tracking_number", null)
    .lt("created_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { order_id: string; status: "refunded" | "skipped" | "error"; reason?: string }[] = [];

  for (const order of overdueOrders ?? []) {
    if (!order.paypal_capture_id) {
      results.push({ order_id: order.id, status: "skipped", reason: "No capture ID" });
      continue;
    }

    try {
      await refundPayPalCapture(
        order.paypal_capture_id,
        order.total_amount,
        "Seller did not ship within 5 business days. Full refund issued automatically."
      );

      await db.from("orders").update({
        status: "refunded",
        refund_status: "issued",
        refund_reason: "Auto-refund: tracking not entered within 5 business days",
        payout_status: "pending",
      }).eq("id", order.id);

      // Flag seller — 2+ flags = ban review
      await db.from("orders").update({ seller_flagged: true }).eq("id", order.id);

      results.push({ order_id: order.id, status: "refunded" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ order_id: order.id, status: "error", reason: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
