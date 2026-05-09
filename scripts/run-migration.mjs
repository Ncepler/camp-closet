import pg from "pg";

const { Client } = pg;

// Supabase direct connection — project ref extracted from URL
const PROJECT_REF = "rnwjcxmodfyjjvmglwch";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase connection string format
// Password for postgres user is the service role key in transaction pooler mode
// Using the REST SQL endpoint instead
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

const SQL = `
-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  buyer_user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_email      TEXT,
  item_id           UUID REFERENCES public.items(id) ON DELETE SET NULL,
  item_type         TEXT NOT NULL,
  item_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee      NUMERIC(10,2) NOT NULL DEFAULT 0,
  seller_payout     NUMERIC(10,2) NOT NULL DEFAULT 0,
  paypal_order_id   TEXT,
  paypal_capture_id TEXT,
  buyer_email       TEXT NOT NULL,
  buyer_name        TEXT,
  buyer_address     TEXT,
  status            TEXT NOT NULL DEFAULT 'paid'
                      CHECK (status IN ('paid','shipped','delivered','refunded','cancelled')),
  tracking_number   TEXT,
  shipped_at        TIMESTAMPTZ,
  payout_status     TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payout_status IN ('pending','released','issued')),
  refund_status     TEXT NOT NULL DEFAULT 'none'
                      CHECK (refund_status IN ('none','requested','approved','issued','rejected')),
  refund_reason     TEXT,
  seller_flagged    BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_select_own'
  ) THEN
    CREATE POLICY "orders_select_own" ON public.orders
      FOR SELECT USING (auth.uid() = buyer_user_id OR auth.uid() = seller_user_id);
  END IF;
END $$;

-- 2. Create buy_requests table
CREATE TABLE IF NOT EXISTS public.buy_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  item_id         UUID REFERENCES public.items(id) ON DELETE CASCADE,
  buyer_email     TEXT NOT NULL,
  buyer_phone     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  approved_at     TIMESTAMPTZ,
  tracking_number TEXT,
  shipped_at      TIMESTAMPTZ
);

ALTER TABLE public.buy_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buy_requests' AND policyname = 'buy_requests_select_own'
  ) THEN
    CREATE POLICY "buy_requests_select_own" ON public.buy_requests
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Fix $0 prices on existing items
UPDATE public.items SET price = 22 WHERE item_type = 'tshirt' AND price = 0;
UPDATE public.items SET price = 12 WHERE item_type = 'hat'    AND price = 0;
UPDATE public.items SET price = 30 WHERE item_type = 'hoodie' AND price = 0;
`;

// Use Supabase's REST SQL endpoint (available via service role)
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    "apikey": SERVICE_ROLE_KEY,
  },
  body: JSON.stringify({ sql: SQL }),
});

// That endpoint doesn't exist — fall back to direct pg connection
// Supabase session pooler: port 5432, host db.<ref>.supabase.co, user postgres
// The postgres password is NOT the service role key, so we try the management API
const mgmtRes = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: SQL }),
  }
);

const mgmtBody = await mgmtRes.text();
console.log("Management API status:", mgmtRes.status);
console.log("Response:", mgmtBody.slice(0, 500));
