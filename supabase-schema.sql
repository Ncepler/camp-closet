-- ============================================================
-- CAMP CLOSET MARKETPLACE — Supabase Database Schema
-- Run this in your Supabase SQL Editor: Project → SQL Editor
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS camps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  location    TEXT,
  description TEXT,
  main_image  TEXT
);

CREATE TABLE IF NOT EXISTS schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  school_type TEXT CHECK (school_type IN ('high_school', 'middle_school')),
  location    TEXT,
  description TEXT,
  main_image  TEXT
);

CREATE TABLE IF NOT EXISTS items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  camp_id         UUID REFERENCES camps(id) ON DELETE CASCADE,
  school_id       UUID REFERENCES schools(id) ON DELETE CASCADE,
  item_type       TEXT NOT NULL,
  size            TEXT NOT NULL,
  condition       TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_count INTEGER NOT NULL DEFAULT 0,
  image_url       TEXT,
  description     TEXT,
  CONSTRAINT items_institution_check CHECK (
    (camp_id IS NOT NULL AND school_id IS NULL) OR
    (camp_id IS NULL AND school_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS camp_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  camp_id      UUID REFERENCES camps(id) ON DELETE CASCADE,
  item_type    TEXT NOT NULL,
  size         TEXT NOT NULL,
  condition    TEXT NOT NULL,
  image_url    TEXT,
  seller_email TEXT NOT NULL,
  seller_phone TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_donation       BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at       TIMESTAMPTZ,
  rejection_reason  TEXT
);

-- Run this if the table already exists:
-- ALTER TABLE camp_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS school_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school_id    UUID REFERENCES schools(id) ON DELETE CASCADE,
  item_type    TEXT NOT NULL,
  size         TEXT NOT NULL,
  condition    TEXT NOT NULL,
  image_url    TEXT,
  seller_email TEXT NOT NULL,
  seller_phone TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_donation  BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS buy_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  item_id      UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  buyer_email  TEXT NOT NULL,
  buyer_phone  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  notified   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (item_id, email)
);

CREATE TABLE IF NOT EXISTS new_camp_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  camp_name       TEXT NOT NULL,
  location        TEXT,
  requester_email TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS new_school_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school_name     TEXT NOT NULL,
  school_type     TEXT CHECK (school_type IN ('high_school', 'middle_school')),
  location        TEXT,
  requester_email TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at     TIMESTAMPTZ
);

-- ─── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_items_camp_id        ON items(camp_id);
CREATE INDEX IF NOT EXISTS idx_items_school_id      ON items(school_id);
CREATE INDEX IF NOT EXISTS idx_items_item_type      ON items(item_type);
CREATE INDEX IF NOT EXISTS idx_camp_requests_status ON camp_requests(status);
CREATE INDEX IF NOT EXISTS idx_school_requests_status ON school_requests(status);
CREATE INDEX IF NOT EXISTS idx_buy_requests_status  ON buy_requests(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_item_id     ON waitlist(item_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_notified    ON waitlist(notified);
CREATE INDEX IF NOT EXISTS idx_camps_slug           ON camps(slug);
CREATE INDEX IF NOT EXISTS idx_schools_slug         ON schools(slug);

-- ─── Row Level Security ───────────────────────────────────────

ALTER TABLE camps              ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools            ENABLE ROW LEVEL SECURITY;
ALTER TABLE items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE buy_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist           ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_camp_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_school_requests ENABLE ROW LEVEL SECURITY;

-- Public read access for browse pages
CREATE POLICY "Public read camps"    ON camps    FOR SELECT USING (true);
CREATE POLICY "Public read schools"  ON schools  FOR SELECT USING (true);
CREATE POLICY "Public read items"    ON items    FOR SELECT USING (true);

-- Authenticated users can insert sell/donate submissions
CREATE POLICY "Auth insert camp_requests" ON camp_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert school_requests" ON school_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can insert buy requests
CREATE POLICY "Auth insert buy_requests" ON buy_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can join waitlist
CREATE POLICY "Auth insert waitlist" ON waitlist
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public read waitlist" ON waitlist
  FOR SELECT USING (true);

-- Authenticated users can insert new camp/school requests
CREATE POLICY "Auth insert new_camp_requests" ON new_camp_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert new_school_requests" ON new_school_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Service role bypass (admin panel uses service role key)
-- The service role automatically bypasses RLS

-- ─── Trigger Functions ────────────────────────────────────────

-- Auto-increment stock when a sell submission is approved
CREATE OR REPLACE FUNCTION increment_item_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_price DECIMAL(10,2) := 0;
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    IF TG_TABLE_NAME = 'camp_requests' THEN
      -- Try to find existing item
      SELECT price INTO v_price FROM items
        WHERE camp_id = NEW.camp_id AND item_type = NEW.item_type AND size = NEW.size
        LIMIT 1;

      INSERT INTO items (camp_id, item_type, size, condition, price, available_count, image_url)
        VALUES (NEW.camp_id, NEW.item_type, NEW.size, NEW.condition, COALESCE(v_price, 0), 1, NEW.image_url)
        ON CONFLICT (camp_id, item_type, size)
        DO UPDATE SET
          available_count = items.available_count + 1,
          -- Only update image if no image set yet
          image_url = CASE WHEN items.image_url IS NULL THEN EXCLUDED.image_url ELSE items.image_url END;
    ELSE
      SELECT price INTO v_price FROM items
        WHERE school_id = NEW.school_id AND item_type = NEW.item_type AND size = NEW.size
        LIMIT 1;

      INSERT INTO items (school_id, item_type, size, condition, price, available_count, image_url)
        VALUES (NEW.school_id, NEW.item_type, NEW.size, NEW.condition, COALESCE(v_price, 0), 1, NEW.image_url)
        ON CONFLICT (school_id, item_type, size)
        DO UPDATE SET
          available_count = items.available_count + 1,
          image_url = CASE WHEN items.image_url IS NULL THEN EXCLUDED.image_url ELSE items.image_url END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraints needed for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'items_camp_id_item_type_size_key'
  ) THEN
    ALTER TABLE items ADD CONSTRAINT items_camp_id_item_type_size_key
      UNIQUE NULLS NOT DISTINCT (camp_id, item_type, size);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'items_school_id_item_type_size_key'
  ) THEN
    ALTER TABLE items ADD CONSTRAINT items_school_id_item_type_size_key
      UNIQUE NULLS NOT DISTINCT (school_id, item_type, size);
  END IF;
END $$;

CREATE TRIGGER on_camp_request_approved
  AFTER UPDATE ON camp_requests
  FOR EACH ROW EXECUTE FUNCTION increment_item_stock();

CREATE TRIGGER on_school_request_approved
  AFTER UPDATE ON school_requests
  FOR EACH ROW EXECUTE FUNCTION increment_item_stock();

-- Auto-decrement stock when a buy request is approved
CREATE OR REPLACE FUNCTION decrement_item_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE items
    SET available_count = GREATEST(available_count - 1, 0)
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_purchase_approved
  AFTER UPDATE ON buy_requests
  FOR EACH ROW EXECUTE FUNCTION decrement_item_stock();

-- ─── Supabase Storage ─────────────────────────────────────────
-- Run this to create the storage bucket for item images.
-- Or create it manually in Supabase Dashboard → Storage

INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Auth users can upload item images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-images');

-- Public read for item images
CREATE POLICY "Public read item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'item-images' AND auth.uid() = owner);

-- ─── Seed Data ────────────────────────────────────────────────
-- 13 Camps

INSERT INTO camps (name, slug, location, description) VALUES
  ('Camp Moosehead', 'camp-moosehead', 'Kennebunkport, ME', 'A classic Maine wilderness camp with 80 years of tradition.'),
  ('Camp Laurel', 'camp-laurel', 'Readfield, ME', 'Award-winning overnight camp known for athletics and arts.'),
  ('Camp Takajo', 'camp-takajo', 'Naples, ME', 'Boys camp on Long Lake with exceptional sports programs.'),
  ('Camp Fernwood', 'camp-fernwood', 'Poland, ME', 'Girls camp dedicated to character building and creative expression.'),
  ('Camp Timber Tops', 'camp-timber-tops', 'Greeley, PA', 'Premier co-ed camp in the Pocono Mountains.'),
  ('Kenwood Evergreen', 'kenwood-evergreen', 'Wilmington, ME', 'Twin camps for boys and girls sharing the same beautiful lake.'),
  ('Camp Weequahic', 'camp-weequahic', 'Lakewood, PA', 'Extraordinary camp with 1,500 acres in the Poconos.'),
  ('Camp Starlight', 'camp-starlight', 'Starlight, PA', 'Family owned and operated since 1947 in the Poconos.'),
  ('Camp Birchwood', 'camp-birchwood', 'Walker, MN', 'Co-ed camp on the shores of picturesque Leech Lake.'),
  ('Camp Lohikan', 'camp-lohikan', 'Lake Como, PA', 'Action packed summer of unlimited program choices.'),
  ('Camp Walden', 'camp-walden', 'Denmark, ME', 'Creative arts-focused camp on Highland Lake in Maine.'),
  ('Camp Kiniya', 'camp-kiniya', 'Colchester, VT', 'Girls camp on the shores of Lake Champlain.'),
  ('Camp Lincoln', 'camp-lincoln', 'Lake Hubert, MN', 'Over 100 years of tradition in the Minnesota lake country.')
ON CONFLICT (slug) DO NOTHING;

-- 20 Schools (high schools and middle schools only)

INSERT INTO schools (name, slug, school_type, location, description) VALUES
  ('Phillips Academy Andover', 'phillips-andover', 'high_school', 'Andover, MA', 'One of the oldest and most prestigious secondary schools in the US.'),
  ('Exeter Academy', 'exeter-academy', 'high_school', 'Exeter, NH', 'Renowned for its Harkness method of teaching.'),
  ('Deerfield Academy', 'deerfield-academy', 'high_school', 'Deerfield, MA', 'Exceptional boarding and day high school in western Massachusetts.'),
  ('Milton Academy', 'milton-academy', 'high_school', 'Milton, MA', 'College preparatory school with a strong sense of community.'),
  ('BB&N Upper School', 'bbn-upper', 'high_school', 'Cambridge, MA', 'Buckingham Browne & Nichols — one of Greater Boston''s leading independents.'),
  ('Belmont Hill School', 'belmont-hill', 'high_school', 'Belmont, MA', 'Independent boys school with rigorous academics and athletics.'),
  ('Winsor School', 'winsor-school', 'high_school', 'Boston, MA', 'Outstanding girls school known for academic excellence.'),
  ('Nobles & Greenough', 'nobles-greenough', 'high_school', 'Dedham, MA', 'Co-ed independent day school with outstanding facilities.'),
  ('Concord Academy', 'concord-academy', 'high_school', 'Concord, MA', 'Progressive college preparatory boarding and day school.'),
  ('Rivers School', 'rivers-school', 'high_school', 'Weston, MA', 'Co-ed independent school known for creative arts.'),
  ('BB&N Middle School', 'bbn-middle', 'middle_school', 'Cambridge, MA', 'Buckingham Browne & Nichols middle division.'),
  ('Fenn School', 'fenn-school', 'middle_school', 'Concord, MA', 'Leading boys middle school in greater Boston.'),
  ('Park School', 'park-school', 'middle_school', 'Brookline, MA', 'Progressive co-ed school for preschool through grade 8.'),
  ('Brimmer & May', 'brimmer-may', 'middle_school', 'Chestnut Hill, MA', 'Urban independent school offering pre-K through grade 12.'),
  ('Advent School', 'advent-school', 'middle_school', 'Boston, MA', 'Small independent school in Beacon Hill focused on community.'),
  ('Commonwealth School', 'commonwealth-school', 'high_school', 'Boston, MA', 'Outstanding small independent school with exceptional academics.'),
  ('Cambridge Rindge & Latin', 'crls', 'high_school', 'Cambridge, MA', 'Comprehensive public high school with strong athletics.'),
  ('Newton South High', 'newton-south', 'high_school', 'Newton, MA', 'Top-rated public high school with strong academics and athletics.'),
  ('Lexington High School', 'lexington-high', 'high_school', 'Lexington, MA', 'Large public high school known for its exceptional programs.'),
  ('Runkle School', 'runkle-school', 'middle_school', 'Brookline, MA', 'Brookline Public Schools K-8 serving the community.')
ON CONFLICT (slug) DO NOTHING;
