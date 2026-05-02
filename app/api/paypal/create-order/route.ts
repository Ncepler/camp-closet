import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { createPayPalOrder } from "@/app/lib/paypal";
import { getItemLabel } from "@/app/lib/impact";

export async function POST(req: NextRequest) {
  const { item_id } = await req.json();
  if (!item_id) return NextResponse.json({ error: "Missing item_id" }, { status: 400 });

  const db = createServiceClient();
  const { data: item, error: itemError } = await db
    .from("items")
    .select("*")
    .eq("id", item_id)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (item.available_count < 1) {
    return NextResponse.json({ error: "Item is out of stock" }, { status: 400 });
  }

  try {
    // Shipping is embedded in item.price — no separate shipping fee
    const paypalOrderId = await createPayPalOrder(
      item_id,
      item.price,
      0,
      getItemLabel(item.item_type)
    );
    return NextResponse.json({ order_id: paypalOrderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
