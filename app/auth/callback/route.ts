import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase auth callback — exchanges the PKCE code for a session.
 * Supabase emails link to <site_url>/auth/callback?code=xxx
 *
 * IMPORTANT: Add your Codespace URL to Supabase allowed redirect URLs:
 *   Dashboard → Authentication → URL Configuration → Redirect URLs
 *   Add: https://<your-codespace>-3000.app.github.dev/**
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // Fall back to auth page on error
  return NextResponse.redirect(new URL("/auth?error=callback_failed", url.origin));
}
