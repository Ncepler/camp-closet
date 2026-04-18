import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";

/**
 * POST /api/request
 * Handles new-camp and new-school requests from unauthenticated users.
 * Uses the service role key so RLS is not an obstacle.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, ...payload } = body as {
    type: "camp" | "school";
    [key: string]: string | null;
  };

  if (type !== "camp" && type !== "school") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const table = type === "camp" ? "new_camp_requests" : "new_school_requests";

  const { error } = await supabase.from(table).insert({ ...payload, status: "pending" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
