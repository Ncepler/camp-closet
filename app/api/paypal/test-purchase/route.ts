import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { calcSellerPayout } from "@/app/lib/impact";

// Bypass PayPal for the test account — creates a real order record without charging anything.
export async function POST(req: NextRequest) {
  const { item_id, buyer_user_id, buyer_email, buyer_name, buyer_address } = await req.json();

  if (!item_id) {
    return NextResponse.json({ error: "Missing item_id" }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: item } = await db.from("items").select("*").eq("id", item_id).single();
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const { platformFee, sellerPayout } = calcSellerPayout(item.price);

  const sellTable = item.camp_id ? "camp_requests" : "school_requests";
  const idField   = item.camp_id ? "camp_id" : "school_id";
  const idValue   = item.camp_id ?? item.school_id;

  const { data: sellerReq } = await db
    .from(sellTable)
    .select("user_id, seller_email")
    .eq(idField, idValue)
    .eq("item_type", item.item_type)
    .eq("status", "approved")
    .eq("is_donation", false)
    .order("approved_at", { ascending: true })
    .limit(1)
    .single();

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      buyer_user_id:    buyer_user_id ?? null,
      seller_user_id:   sellerReq?.user_id ?? null,
      seller_email:     sellerReq?.seller_email ?? null,
      item_id,
      item_type:        item.item_type,
      item_price:       item.price,
      shipping_fee:     0,
      total_amount:     item.price,
      platform_fee:     platformFee,
      seller_payout:    sellerPayout,
      paypal_order_id:  `test-${Date.now()}`,
      paypal_capture_id:`test-capture-${Date.now()}`,
      buyer_email,
      buyer_name:       buyer_name ?? null,
      buyer_address:    buyer_address ?? null,
      status:           "paid",
      tracking_number:  null,
      shipped_at:       null,
      payout_status:    "pending",
      refund_status:    "none",
      refund_reason:    null,
      seller_flagged:   false,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Trigger the stock-decrement DB trigger
  await db.from("buy_requests").insert({
    user_id:      buyer_user_id ?? null,
    item_id,
    buyer_email,
    buyer_phone:  null,
    status:       "approved",
    approved_at:  new Date().toISOString(),
  });

  return NextResponse.json({ success: true, order_id: order.id });
}
