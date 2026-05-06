import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "admintester@gmail.com";
const TEST_PASSWORD = "testertester";

export async function POST(req: Request) {
  const { email, password, full_name, phone } = await req.json();

  if (email !== TEST_EMAIL || password !== TEST_PASSWORD) {
    return NextResponse.json({ error: "Not a test user" }, { status: 403 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone },
  });

  // Already registered is fine — they can just sign in
  if (error && !error.message.toLowerCase().includes("already been registered")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
