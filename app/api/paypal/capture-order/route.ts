import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { capturePayPalOrder } from "@/app/lib/paypal";
import { calcSellerPayout } from "@/app/lib/impact";

// NOTE: The 'orders' table requires these columns (run migration if not present):
// buyer_user_id, seller_user_id, seller_email, item_type, item_price, shipping_fee,
// total_amount, platform_fee, seller_payout, paypal_order_id, paypal_capture_id,
// buyer_email, buyer_name, buyer_address, status, tracking_number, shipped_at,
// payout_status, refund_status, refund_reason, seller_flagged

export async function POST(req: NextRequest) {
  const {
    paypal_order_id,
    item_id,
    buyer_user_id,
    buyer_email,
    buyer_name,
    buyer_address,
  } = await req.json();

  if (!paypal_order_id || !item_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let captureData;
  try {
    captureData = await capturePayPalOrder(paypal_order_id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (captureData.status !== "COMPLETED") {
    return NextResponse.json(
      { error: `Unexpected PayPal status: ${captureData.status}` },
      { status: 500 }
    );
  }

  const db = createServiceClient();
  const { data: item } = await db.from("items").select("*").eq("id", item_id).single();
  if (!item) {
    return NextResponse.json({ error: "Item not found after capture" }, { status: 500 });
  }

  const captureDetail = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  const { platformFee, sellerPayout } = calcSellerPayout(item.price);

  // Find seller: oldest approved sell request for this item type + institution
  const sellTable = item.camp_id ? "camp_requests" : "school_requests";
  const idField = item.camp_id ? "camp_id" : "school_id";
  const idValue = item.camp_id ?? item.school_id;

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
      buyer_user_id: buyer_user_id ?? null,
      seller_user_id: sellerReq?.user_id ?? null,
      seller_email: sellerReq?.seller_email ?? null,
      item_id,
      item_type: item.item_type,
      item_price: item.price,
      shipping_fee: 0,
      total_amount: item.price,
      platform_fee: platformFee,
      seller_payout: sellerPayout,
      paypal_order_id,
      paypal_capture_id: captureDetail?.id ?? null,
      buyer_email,
      buyer_name: buyer_name ?? null,
      buyer_address: buyer_address ?? null,
      status: "paid",
      tracking_number: null,
      shipped_at: null,
      payout_status: "pending",
      refund_status: "none",
      refund_reason: null,
      seller_flagged: false,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order insert error:", orderError);
    return NextResponse.json({ error: "Failed to record order" }, { status: 500 });
  }

  // Insert into buy_requests to trigger the stock-decrement DB trigger
  await db.from("buy_requests").insert({
    user_id: buyer_user_id ?? null,
    item_id,
    buyer_email,
    buyer_phone: null,
    status: "approved",
    approved_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, order_id: order.id });
}
