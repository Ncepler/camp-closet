import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

    const db = createServiceClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Count existing views today before recording this one
    const { count: countBefore } = await db
      .from("listing_views")
      .select("*", { count: "exact", head: true })
      .eq("item_id", item_id)
      .gt("viewed_at", since);

    // Record this view
    await db.from("listing_views").insert({ item_id });

    return NextResponse.json({ view_count: countBefore ?? 0 });
  } catch (err) {
    console.error("[items/view] error:", err);
    return NextResponse.json({ view_count: 0 });
  }
}
