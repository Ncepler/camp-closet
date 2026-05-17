import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const html = readFileSync(
    join(process.cwd(), "email-templates/auth-confirm-signup.html"),
    "utf-8"
  ).replace("{{ .ConfirmationURL }}", "https://anothersummer.com/auth");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from:    "Another Summer <noreply@anothersummer.com>",
      to:      ["shopanothersummer@gmail.com"],
      subject: "Confirm your account — Another Summer",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[send-test-email] Resend error:", body);
    return NextResponse.json({ error: "Failed to send email", detail: body }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
