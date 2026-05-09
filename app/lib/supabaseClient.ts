import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Fall back to a non-empty placeholder so createClient doesn't throw when the
// env var is missing — all queries will just return 401 errors instead of crashing.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing-anon-key";

// Lazy singleton — avoids crashing during build when env vars are placeholders
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured. Please update .env.local.");
    }
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Proxy so call sites can do `supabase.from(...)` as before
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Server-side client with service role (for admin operations)
export function createServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }
  return createClient(supabaseUrl, serviceKey);
}

// ─── Type Definitions ──────────────────────────────────────────────────────

export interface Camp {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  location: string | null;
  description: string | null;
  main_image: string | null;
}

export interface Item {
  id: string;
  created_at: string;
  camp_id: string | null;
  school_id: string | null;
  item_type: string;
  size: string;
  condition: "new" | "like_new" | "good" | "fair";
  price: number;
  available_count: number;
  image_url: string | null;
  description: string | null;
  is_donated: boolean;
  donor_note: string | null;
  donor_user_id: string | null;
  donor_email: string | null;
  camp_request_id: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
}

export interface Claim {
  id: string;
  listing_id: string;
  claimer_id: string;
  donor_user_id: string | null;
  donor_email: string | null;
  claimer_note: string | null;
  claimer_email: string | null;
  claimer_address: string | null;
  status: "pending_pickup" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  shipped_at: string | null;
  tracking_number: string | null;
}

export interface CampRequest {
  id: string;
  created_at: string;
  user_id: string | null;
  camp_id: string | null;
  item_type: string;
  size: string;
  condition: string;
  image_url: string | null;
  seller_email: string;
  seller_phone: string | null;
  seller_name: string | null;
  status: "pending" | "approved" | "rejected";
  is_donation: boolean;
  donor_note: string | null;
  approved_at: string | null;
}

export interface BuyRequest {
  id: string;
  created_at: string;
  user_id: string | null;
  item_id: string;
  buyer_email: string;
  buyer_phone: string | null;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
}

export interface Order {
  id: string;
  created_at: string;
  buyer_user_id: string | null;
  seller_user_id: string | null;
  seller_email: string | null;
  item_id: string;
  item_type: string;
  item_price: number;
  shipping_fee: number;
  total_amount: number;
  platform_fee: number;
  seller_payout: number;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  buyer_email: string;
  buyer_name: string | null;
  buyer_address: string | null;
  status: "paid" | "shipped" | "delivered" | "refunded" | "cancelled";
  tracking_number: string | null;
  shipped_at: string | null;
  payout_status: "pending" | "released" | "issued";
  refund_status: "none" | "requested" | "approved" | "issued" | "rejected";
  refund_reason: string | null;
  seller_flagged: boolean;
}

export interface WaitlistEntry {
  id: string;
  created_at: string;
  user_id: string | null;
  item_id: string;
  email: string;
  notified: boolean;
}

export interface NewCampRequest {
  id: string;
  created_at: string;
  requested_by: string | null;
  camp_name: string;
  location: string | null;
  requester_email: string;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
}

// ─── Item Type Constants ──────────────────────────────────────────────────
// UI supports three item types. Legacy DB rows may still have 'sweatshirt'.

export const ITEM_TYPES = [
  { value: "tshirt",  label: "T-Shirt" },
  { value: "hat",     label: "Hat" },
  { value: "hoodie",  label: "Hoodie" },
] as const;

export const CONDITIONS = [
  { value: "new",  label: "New",  description: "Never worn, tags on" },
  { value: "good", label: "Good", description: "Normal wear, no significant issues" },
  { value: "fair", label: "Fair", description: "Visible wear but fully functional" },
] as const;

export const SIZES_CLOTHING = ["XS", "S", "M", "L", "XL", "XXL", "Youth XS", "Youth S", "Youth M", "Youth L", "Youth XL"];

export function getSizesForItemType(_itemType: string): string[] {
  return SIZES_CLOTHING;
}

const LEGACY_TYPE_LABELS: Record<string, string> = {
  sweatshirt: "Sweatshirt / Hoodie",
};

export function getItemTypeLabel(value: string): string {
  return ITEM_TYPES.find((t) => t.value === value)?.label
    ?? LEGACY_TYPE_LABELS[value]
    ?? value;
}

export function getConditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
