import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { refundPayPalCapture } from "@/app/lib/paypal";
import { isAdminAuthorized } from "@/app/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { order_id, reason } = await req.json();
  if (!order_id) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

  const db = createServiceClient();
  const { data: order } = await db
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.paypal_capture_id) {
    return NextResponse.json({ error: "No capture ID on record — refund manually" }, { status: 400 });
  }
  if (order.refund_status === "issued") {
    return NextResponse.json({ error: "Already refunded" }, { status: 400 });
  }

  try {
    await refundPayPalCapture(
      order.paypal_capture_id,
      order.total_amount,
      reason ?? "Item not as described or not delivered"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refund failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await db
    .from("orders")
    .update({
      refund_status: "issued",
      refund_reason: reason ?? null,
      status: "refunded",
      payout_status: "pending",
    })
    .eq("id", order_id);

  // Flag seller if warranted
  if (order.seller_user_id) {
    const { count } = await db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("seller_user_id", order.seller_user_id)
      .eq("refund_status", "issued");

    if ((count ?? 0) >= 2) {
      await db.from("orders").update({ seller_flagged: true }).eq("seller_user_id", order.seller_user_id);
    }
  }

  return NextResponse.json({ success: true });
}
