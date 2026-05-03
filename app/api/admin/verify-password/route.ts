import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD;
  if (!correct || password !== correct) {
    return NextResponse.json({ error: "Incorrect password", debug_env_set: !!correct, debug_received: password }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
