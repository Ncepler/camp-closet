import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";

/**
 * POST /api/request
 * Handles new-camp requests.
 * Uses the service role key so RLS is not an obstacle.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, ...payload } = body as {
    type: string;
    [key: string]: string | null;
  };

  if (type !== "camp") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("new_camp_requests").insert({ ...payload, status: "pending" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
