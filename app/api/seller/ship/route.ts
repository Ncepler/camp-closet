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

  const { order_id, tracking_number } = await req.json();
  if (!order_id || !tracking_number?.trim()) {
    return NextResponse.json({ error: "Missing order_id or tracking_number" }, { status: 400 });
  }

  // Verify this order belongs to this seller
  const { data: order } = await db
    .from("orders")
    .select("id, seller_user_id, seller_email, status")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isSeller =
    order.seller_user_id === user.id || order.seller_email === user.email;
  if (!isSeller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.status === "refunded" || order.status === "cancelled") {
    return NextResponse.json({ error: "Cannot ship a refunded or cancelled order" }, { status: 400 });
  }

  const { error: updateError } = await db
    .from("orders")
    .update({
      tracking_number: tracking_number.trim(),
      shipped_at: new Date().toISOString(),
      status: "shipped",
    })
    .eq("id", order_id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
