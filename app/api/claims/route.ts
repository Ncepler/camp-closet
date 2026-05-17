import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { getItemTypeLabel } from "@/app/lib/supabaseClient";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anothersummer.com";

async function sendDonorEmail(opts: {
  donor_email: string;
  item_type: string;
  claimer_note: string | null;
  claim_id: string;
}) {
  if (!RESEND_API_KEY || RESEND_API_KEY === "your_resend_api_key") {
    console.log("[claims] donor email (dev):", opts);
    return;
  }
  const itemLabel = getItemTypeLabel(opts.item_type);
  const noteHtml = opts.claimer_note
    ? `<p style="color:#4A5247;line-height:1.6;">They wrote: &ldquo;${opts.claimer_note}&rdquo;</p>`
    : "";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "Another Summer <noreply@anothersummer.com>",
      to: [opts.donor_email],
      subject: "Your donation found a home.",
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1F2A20;">
          <p style="color:#4A5247;line-height:1.6;">Your ${itemLabel} was just claimed.</p>
          ${noteHtml}
          <p style="color:#4A5247;line-height:1.6;">
            We'll be in touch with shipping details shortly.
            Thank you for keeping camp gear in circulation.
          </p>
          <p style="color:#8A8E83;margin-top:32px;font-size:13px;">— Another Summer</p>
        </div>
      `,
    }),
  }).catch((e) => console.error("[claims] donor email failed:", e));
}

async function sendClaimerEmail(opts: {
  claimer_email: string;
  item_type: string;
  claim_id: string;
}) {
  if (!RESEND_API_KEY || RESEND_API_KEY === "your_resend_api_key") return;
  const itemLabel = getItemTypeLabel(opts.item_type);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "Another Summer <noreply@anothersummer.com>",
      to: [opts.claimer_email],
      subject: `Your claim is confirmed — ${itemLabel}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1F2A20;">
          <p style="color:#4A5247;line-height:1.6;">
            Your claim for the ${itemLabel} is confirmed. The donor will ship within 3 days.
            We'll email you when it's on the way.
          </p>
          <a href="${SITE_URL}/claims/${opts.claim_id}"
            style="display:inline-block;margin-top:16px;color:#2D5A3D;font-size:14px;">
            View your claim →
          </a>
          <p style="color:#8A8E83;margin-top:32px;font-size:13px;">— Another Summer</p>
        </div>
      `,
    }),
  }).catch((e) => console.error("[claims] claimer email failed:", e));
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth — claimer must be signed in
    const authHeader = req.headers.get("authorization");
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { listing_id, claimer_note } = await req.json();
    if (!listing_id) return NextResponse.json({ error: "listing_id required" }, { status: 400 });

    const db = createServiceClient();

    // 2. Fetch item — verify it's donated, not claimed, not already bought
    const { data: item, error: itemErr } = await db
      .from("items")
      .select("id, item_type, is_donated, is_claimed, donor_user_id, donor_email, camp_id")
      .eq("id", listing_id)
      .single();

    if (itemErr || !item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (!item.is_donated) return NextResponse.json({ error: "Item is not a donated listing" }, { status: 400 });
    if (item.is_claimed) return NextResponse.json({ error: "already_claimed" }, { status: 409 });
    if (item.donor_user_id === user.id) return NextResponse.json({ error: "You cannot claim your own donation" }, { status: 400 });

    // 3. Anti-resell check: block if user has previously claimed same type+camp for free
    const { data: priorClaim } = await db
      .from("claims")
      .select("id")
      .eq("claimer_id", user.id)
      .neq("status", "cancelled")
      .eq("listing_id", listing_id) // exact listing check for strict matching
      .limit(1);
    if (priorClaim && priorClaim.length > 0) {
      return NextResponse.json({ error: "You have already claimed this item" }, { status: 409 });
    }

    // 4. Pre-check rate limit (DB trigger also enforces, this gives nicer UX)
    const { count: recentCount } = await db
      .from("claims")
      .select("*", { count: "exact", head: true })
      .eq("claimer_id", user.id)
      .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .not("status", "eq", "cancelled");

    if ((recentCount ?? 0) >= 2) {
      // Find oldest qualifying claim to compute reset date
      const { data: oldest } = await db
        .from("claims")
        .select("created_at")
        .eq("claimer_id", user.id)
        .neq("status", "cancelled")
        .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true })
        .limit(1);

      let daysUntilReset: number | null = null;
      if (oldest?.[0]) {
        const resetAt = new Date(oldest[0].created_at).getTime() + 30 * 24 * 60 * 60 * 1000;
        daysUntilReset = Math.max(1, Math.ceil((resetAt - Date.now()) / (24 * 60 * 60 * 1000)));
      }
      return NextResponse.json({ error: "claim_rate_limit_exceeded", days_until_reset: daysUntilReset }, { status: 429 });
    }

    // 5. Insert claim (DB trigger enforces rate limit + marks item claimed)
    const { data: claim, error: insertErr } = await db
      .from("claims")
      .insert({
        listing_id,
        claimer_id:   user.id,
        donor_user_id: item.donor_user_id,
        donor_email:  item.donor_email,
        claimer_note: claimer_note ?? null,
        claimer_email: user.email,
        status: "pending_pickup",
      })
      .select("id")
      .single();

    if (insertErr) {
      if (insertErr.message.includes("claim_rate_limit_exceeded")) {
        return NextResponse.json({ error: "claim_rate_limit_exceeded", days_until_reset: null }, { status: 429 });
      }
      throw insertErr;
    }

    // 6. Remaining claims count
    const { count: usedAfter } = await db
      .from("claims")
      .select("*", { count: "exact", head: true })
      .eq("claimer_id", user.id)
      .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .neq("status", "cancelled");

    const remaining = Math.max(0, 2 - (usedAfter ?? 1));

    // 7. Fire emails (non-blocking)
    if (item.donor_email) {
      sendDonorEmail({
        donor_email: item.donor_email,
        item_type: item.item_type,
        claimer_note: claimer_note ?? null,
        claim_id: claim.id,
      });
    }
    if (user.email) {
      sendClaimerEmail({ claimer_email: user.email, item_type: item.item_type, claim_id: claim.id });
    }

    return NextResponse.json({ success: true, claim_id: claim.id, remaining_claims: remaining });
  } catch (err) {
    console.error("[claims] POST error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
