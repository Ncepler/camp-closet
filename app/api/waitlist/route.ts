import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";

/**
 * POST /api/waitlist
 * Adds an email to the waitlist for an item.
 * Uses the service role key so unauthenticated users can join without hitting RLS.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { item_id, email, user_id } = body as {
    item_id: string;
    email: string;
    user_id?: string | null;
  };

  if (!item_id || !email) {
    return NextResponse.json({ error: "item_id and email are required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("waitlist").insert({
    item_id,
    email,
    user_id: user_id ?? null,
    notified: false,
  });

  // 23505 = unique violation (already on waitlist) → treat as success
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
