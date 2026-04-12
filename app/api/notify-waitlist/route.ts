import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    if (!item_id) return NextResponse.json({ error: "item_id is required" }, { status: 400 });

    const supabase = createServiceClient();

    // Fetch waitlist entries for this item
    const { data: entries, error: wlError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("item_id", item_id)
      .eq("notified", false);

    if (wlError) throw wlError;
    if (!entries || entries.length === 0) {
      return NextResponse.json({ message: "No pending waitlist entries" });
    }

    // Fetch item info
    const { data: item } = await supabase.from("items").select("*").eq("id", item_id).single();

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY && RESEND_API_KEY !== "your_resend_api_key") {
      // Send emails via Resend
      for (const entry of entries) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from:    "Camp Closet <noreply@campcloset.com>",
              to:      [entry.email],
              subject: "Great news — your waitlisted item is back in stock!",
              html: `
                <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px 24px;">
                  <h1 style="font-size: 24px; color: #1a3310; margin-bottom: 8px;">
                    Good news! 🎉
                  </h1>
                  <p style="color: #556b4f; line-height: 1.6; margin-bottom: 24px;">
                    An item on your waitlist just came back in stock on Camp Closet:
                  </p>
                  <div style="background: #f8faf6; border: 1px solid #d4e3cc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <strong style="color: #1a3310;">${item?.item_type ?? "Item"}</strong>
                    ${item?.size ? ` — Size ${item.size}` : ""}
                    ${item?.price ? ` — $${Number(item.price).toFixed(2)}` : ""}
                  </div>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://campcloset.com"}"
                    style="display: inline-block; background: linear-gradient(135deg, #2d5016, #4a7c2c); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                    View &amp; Buy Now
                  </a>
                  <p style="color: #999; font-size: 12px; margin-top: 32px;">
                    You received this because you joined the waitlist for this item.
                    Items are first-come, first-served.
                  </p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error("Failed to send email to", entry.email, emailErr);
        }
      }
    } else {
      // Log emails for development
      console.log(`[Waitlist] Would notify ${entries.length} users about item ${item_id}:`);
      entries.forEach((e) => console.log("  →", e.email));
    }

    // Mark as notified
    const ids = entries.map((e) => e.id);
    await supabase.from("waitlist").update({ notified: true }).in("id", ids);

    return NextResponse.json({
      message: `Notified ${entries.length} user${entries.length !== 1 ? "s" : ""}`,
      count:   entries.length,
    });
  } catch (err: unknown) {
    console.error("[notify-waitlist] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
