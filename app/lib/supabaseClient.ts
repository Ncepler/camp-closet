import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

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

export interface School {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  school_type: "high_school" | "middle_school";
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
  status: "pending" | "approved" | "rejected";
  is_donation: boolean;
  approved_at: string | null;
}

export interface SchoolRequest {
  id: string;
  created_at: string;
  user_id: string | null;
  school_id: string | null;
  item_type: string;
  size: string;
  condition: string;
  image_url: string | null;
  seller_email: string;
  seller_phone: string | null;
  status: "pending" | "approved" | "rejected";
  is_donation: boolean;
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

export interface NewSchoolRequest {
  id: string;
  created_at: string;
  requested_by: string | null;
  school_name: string;
  school_type: string | null;
  location: string | null;
  requester_email: string;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
}

// ─── Item Type Constants ──────────────────────────────────────────────────

export const ITEM_TYPES = [
  { value: "tshirt",     label: "T-Shirt" },
  { value: "shorts",     label: "Shorts" },
  { value: "jersey",     label: "Jersey" },
  { value: "sweatshirt", label: "Sweatshirt" },
  { value: "sweatpants", label: "Sweatpants" },
  { value: "hat",        label: "Hat / Cap" },
  { value: "jacket",     label: "Jacket" },
  { value: "polo",       label: "Polo Shirt" },
  { value: "dress",      label: "Dress / Skirt" },
  { value: "pants",      label: "Pants / Trousers" },
  { value: "vest",       label: "Vest" },
  { value: "other",      label: "Other" },
] as const;

export const CONDITIONS = [
  { value: "new",      label: "New",      description: "Never worn, tags on" },
  { value: "like_new", label: "Like New", description: "Worn once or twice, no flaws" },
  { value: "good",     label: "Good",     description: "Normal wear, no significant issues" },
  { value: "fair",     label: "Fair",     description: "Visible wear but fully functional" },
] as const;

export const SIZES_CLOTHING = ["XS", "S", "M", "L", "XL", "XXL", "Youth XS", "Youth S", "Youth M", "Youth L", "Youth XL"];
export const SIZES_HAT      = ["Youth", "S/M", "L/XL", "One Size"];

export function getSizesForItemType(itemType: string): string[] {
  if (itemType === "hat") return SIZES_HAT;
  return SIZES_CLOTHING;
}

export function getItemTypeLabel(value: string): string {
  return ITEM_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function getConditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
