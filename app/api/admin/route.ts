import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabaseClient";
import { isAdminAuthorized } from "@/app/lib/adminAuth";

/**
 * POST /api/admin
 *
 * Generic admin proxy using the Supabase service role key (bypasses RLS).
 * All requests must include x-admin-key header matching ADMIN_PASSWORD env var.
 *
 * Supported operations:
 *   select         — list rows from a table
 *   count          — count rows matching filters
 *   update         — update a single row by id
 *   insert         — insert a single row
 *   approve_camp   — insert into camps + update new_camp_requests status
 *   approve_school — insert into schools + update new_school_requests status
 *   orders         — list orders with optional filters
 *   update_order   — update an order row by id
 */

type Filter = { col: string; eq: string | boolean | null };

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const db = createServiceClient();

  switch (body.op) {
    case "select": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db.from(body.table).select(body.columns ?? "*");
      for (const f of (body.filters ?? []) as Filter[]) {
        q = q.eq(f.col, f.eq);
      }
      if (body.in) q = q.in(body.in.col, body.in.values);
      if (body.orderBy) q = q.order(body.orderBy, { ascending: body.orderAsc ?? false });
      const { data, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    case "count": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db.from(body.table).select("*", { count: "exact", head: true });
      for (const f of (body.filters ?? []) as Filter[]) {
        q = q.eq(f.col, f.eq);
      }
      const { count, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ count: count ?? 0 });
    }

    case "update": {
      const { error } = await db
        .from(body.table)
        .update(body.data)
        .eq("id", body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    case "insert": {
      const { data, error } = await db
        .from(body.table)
        .insert(body.data)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    case "orders": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = db.from("orders").select("*");
      for (const f of (body.filters ?? []) as Filter[]) {
        q = q.eq(f.col, f.eq);
      }
      if (body.refund_requested) {
        q = q.neq("refund_status", "none");
      }
      q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    case "update_order": {
      const { error } = await db
        .from("orders")
        .update(body.data)
        .eq("id", body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    case "approve_camp": {
      const slug = (body.camp_name as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const { error: campError } = await db.from("camps").insert({
        name: body.camp_name,
        slug,
        location: body.location ?? null,
      });
      if (campError) return NextResponse.json({ error: campError.message }, { status: 400 });
      await db
        .from("new_camp_requests")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", body.id);
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
  }
}
