import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const db = createServiceClient();
  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { order_id, reason } = await req.json();
  if (!order_id || !reason?.trim()) {
    return NextResponse.json({ error: "Missing order_id or reason" }, { status: 400 });
  }

  const { data: order } = await db
    .from("orders")
    .select("id, buyer_user_id, buyer_email, refund_status, status, shipped_at")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isBuyer = order.buyer_user_id === user.id || order.buyer_email === user.email;
  if (!isBuyer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.refund_status !== "none") {
    return NextResponse.json({ error: "A claim already exists for this order" }, { status: 400 });
  }

  if (order.status === "refunded") {
    return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
  }

  // Check 7-day window from ship date (or 14 days from order if never shipped → "not arrived" case)
  const referenceDate = order.shipped_at ?? order.shipped_at;
  if (referenceDate) {
    const daysSinceShip = (Date.now() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceShip > 14) {
      return NextResponse.json({ error: "Claim window has closed (14 days after ship date)" }, { status: 400 });
    }
  }

  const { error: updateError } = await db
    .from("orders")
    .update({ refund_status: "requested", refund_reason: reason.trim() })
    .eq("id", order_id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
