# Schools Side — Archive

Removed May 2026. Preserved here so the schools section can be rebuilt later.

---

## What It Was

A parallel marketplace track for buying and selling used school uniforms.
Used a navy blue theme (#1e3a5f) to distinguish it from the camps side (forest green #2d5016).
The feature was always deferred — built structurally but never launched with real data.

---

## Database Tables (still exist in Supabase — not deleted)

**schools**
- id, created_at, name, slug, location, description, main_image
- school_type: "high_school" | "middle_school"

**school_requests** — seller submissions for school uniforms
- id, created_at, user_id, school_id, item_type, size, condition, image_url
- seller_email, seller_phone, status (pending/approved/rejected), is_donation, approved_at

**new_school_requests** — requests to add a new school to the platform
- id, created_at, requested_by, school_name, school_type, location
- requester_email, status (pending/approved/rejected), approved_at

---

## Pages That Were Removed

- `/schools` — browse all schools (mirror of /camps, navy theme)
- `/schools/[slug]` — individual school shop page
  - queried items table filtered by school_id
  - showed school_type badge (High School / Middle School)
- `/admin/new-schools` — admin panel to review and approve school add requests
  - approve_school operation: inserts into schools table, updates new_school_requests status

---

## How the Sell Flow Worked

1. Seller hit /submit and toggled to "School Uniforms" mode
2. Picked their school from the list
3. Selected item type, size, condition, uploaded photo
4. Submission inserted into school_requests with status = pending
5. Admin reviewed in /admin/sell-submissions (shared panel with camps)
6. On approval, item appeared on school's shop page (/schools/[slug])
7. Buyer purchased via same PayPal flow as camps
8. Seller shipped USPS, entered tracking number on seller dashboard

---

## How the Admin Dashboard Looked

The main admin dashboard (/admin) included:
- "New Schools" pending count card → linked to /admin/new-schools
- "Total Schools" count card → linked to /admin/inventory

Both were removed from the stats grid when schools were cut.

---

## Code That Was Changed or Removed

### Deleted files
- app/schools/page.tsx
- app/schools/[slug]/page.tsx
- app/admin/new-schools/page.tsx

### Components simplified
- components/Navbar.tsx — "Schools" nav link removed
- app/layout.tsx — "Browse Schools" footer link removed
- components/RequestModal.tsx — school branch removed, now camp-only
- components/BuyModal.tsx — theme prop simplified from "camp"|"school" to always camp

### Files stripped of school references
- app/submit/page.tsx — school mode toggle removed, camp-only
- app/seller/page.tsx — school_requests fetching removed
- app/lib/supabaseClient.ts — School, SchoolRequest, NewSchoolRequest types removed
- app/lib/adminApi.ts — approveSchool() method removed
- app/api/admin/route.ts — approve_school case removed
- app/admin/page.tsx — school stat cards removed
- app/admin/layout.tsx — "New School Requests" nav item removed

---

## Schools That Were in the System

None. The schools table was built but no schools were ever added.

---

## How to Rebuild

1. Add "Schools" back to navLinks in components/Navbar.tsx
2. Add "Browse Schools" back to footer in app/layout.tsx
3. Restore app/schools/page.tsx and app/schools/[slug]/page.tsx
4. Restore app/admin/new-schools/page.tsx
5. Add school mode toggle back to app/submit/page.tsx
6. Add school_requests fetching back to app/seller/page.tsx
7. Add School, SchoolRequest, NewSchoolRequest types back to app/lib/supabaseClient.ts
8. Add approveSchool() back to app/lib/adminApi.ts
9. Add approve_school case back to app/api/admin/route.ts
10. Add school stat cards back to app/admin/page.tsx
11. Add "New School Requests" back to NAV_ITEMS in app/admin/layout.tsx
12. Update RequestModal.tsx to handle type="school" again
