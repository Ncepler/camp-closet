# Camp Closet Marketplace

## What This Is

A peer-to-peer resale marketplace for buying and selling used summer camp clothing. Parents and campers who have outgrown camp gear connect with families who need it. Items are organized strictly by camp — this is NOT a general marketplace. Every transaction is facilitated through an admin approval workflow.

## The Mission

This is a sustainability platform disguised as a marketplace. Every item resold is one less new garment manufactured, one less piece of clothing in a landfill. The brand identity reinforces "reloved, repurposed, second summer." Clothes get a second life; the planet gets a break.

Sustainability is not a side message — it is the entire thesis. Every design choice, microcopy line, and feature should reinforce that buying used here is an environmental act. Stats, energy savings, water savings, and CO2 avoided should appear contextually throughout the experience, not just on the home page.

## Platform Structure

Current focus: **Camps** (green theme) — summer camps with branded apparel.

Schools side (blue theme) is deferred — the architecture supports it but is not actively being built. Do not build new school-specific features until explicitly directed.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Auth**: Supabase Auth (email/password)
- **Styling**: Tailwind CSS
- **Image storage**: Supabase Storage
- **Email**: Resend API
- **Payments**: PayPal Commerce Platform (Multiparty / Partner Payments)
- **Animation**: Framer Motion
- **Supabase client**: `app/lib/supabaseClient.ts`

## Item Types (Current Focus — 3 Only)

The UI should emphasize exactly these three item types. The `item_types` table may contain other entries (Jersey, Shorts, Sweatpants, Other) — leave the table as-is but filter the UI to show only:

| Item | Fixed Price |
|------|------------|
| T-Shirt | $22 |
| Hat | $12 |
| Hoodie | $30 |

All items of the same type are priced identically regardless of condition. No quality tiers, no negotiation, no per-item pricing.

## Pricing Model (Hardcode These Numbers)

**Shipping is included in the listed price.** Buyers see one number at checkout — no separate shipping fee.

Sellers handle their own shipping and pay it out of pocket. The flat prices are set to cover a reasonable shipping cost while still giving sellers a worthwhile payout.

### Per-item breakdown

**T-Shirt — $22 total**
- PayPal fee: $1.15 (2.99% + $0.49)
- Platform commission (15%): $3.13
- Seller receives via PayPal: $17.72
- Seller pays shipping (~$5 USPS)
- Seller net: ~$12.72

**Hat — $12 total**
- PayPal fee: $0.85 (2.99% + $0.49)
- Platform commission (15%): $1.67
- Seller receives via PayPal: $9.48
- Seller pays shipping (~$4 USPS)
- Seller net: ~$5.48

**Hoodie — $30 total**
- PayPal fee: $1.39 (2.99% + $0.49)
- Platform commission (15%): $4.29
- Seller receives via PayPal: $24.32
- Seller pays shipping (~$7 USPS)
- Seller net: ~$17.32

### Revenue split summary
- **Platform**: 15% of item price
- **PayPal**: 2.99% + $0.49 per transaction (standard rate)
- **Seller**: remainder, minus shipping they pay out of pocket

## Transaction Flow

Nothing happens until a buyer purchases. Listings are free for sellers.

1. Seller submits item via `/submit` form (pulls from `item_types` table)
2. Item enters `camp_requests` table with `status = pending`
3. Admin approves item via admin panel
4. Approved item appears on the camp's public shop page (`/camps/[slug]`)
5. Buyer purchases through PayPal Commerce Platform
6. PayPal automatically splits payment at capture: seller gets their share, platform gets 15%, PayPal takes its fee
7. Seller is notified to ship the item
8. Seller ships and enters tracking number
9. Buyer receives item — transaction complete

## Payments — PayPal Commerce Platform

We use **PayPal Commerce Platform** (also called PayPal for Marketplaces / Multiparty Payments) — NOT standard PayPal Checkout. This handles automatic split payments between platform and sellers at the moment of capture.

### Key integration details
- Sellers use a personal PayPal account — no business account required
- Seller onboarding: redirect to PayPal login + permission grant via **Partner Referrals API**
- Order creation: `/v2/checkout/orders` with `PURCHASE_UNITS.PAYMENT_INSTRUCTION.PLATFORM_FEES.AMOUNT` set to the 15% platform fee
- Refunds: `/v2/payments/captures/{capture_id}/refund` with `PAYMENT_INSTRUCTION.PLATFORM_FEES.AMOUNT`
- Platform account cannot hold a PayPal balance — partner fees settle to linked bank account daily
- Use **Smart Payment Buttons** on the buyer checkout page
- Platform must be approved by PayPal before going live — sandbox testing first

### Application status
**Still need to apply at developer.paypal.com** — this is blocking live integration. Sandbox testing can proceed in the meantime.

### Fallback if PayPal denies marketplace approval
- Use standard PayPal Checkout (100% lands in platform account)
- Manually issue seller payouts via PayPal Payouts API after tracking is confirmed
- Same 15% / seller split, just more operational work for admin

## Shipping

Sellers manage their own shipping. Shipping cost is embedded in the item price — buyers do not see a separate fee.

- Recommended service: **USPS First Class / Ground Advantage** (cheapest for clothing)
- Recommended packaging: USPS poly mailers for cost efficiency
- Approximate seller shipping costs: ~$4 hat, ~$5 t-shirt, ~$7 hoodie

Seller responsibilities:
1. Receive email notification when item sells (includes buyer shipping address)
2. Purchase and affix USPS label within the refund window
3. Enter tracking number via "Mark as Shipped" UI on seller dashboard

## Returns & Refunds

**Default policy: final sale.** No returns for buyer's remorse, wrong size, or fit.

Refunds are issued only if the seller fails to ship within the deadline (suggest 7 days as default — TBD, needs to be hardcoded once decided).

Buyers have 180 days to open a PayPal dispute regardless of platform policy — be aware of this in the integration.

Refunds are processed via PayPal Refund API, pulling from the seller's split.

## Database Schema (Supabase)

Key tables confirmed from prior sessions:

- `camps` — live camp list with `slug` and `main_image`
- `items` — camp-specific items (has real rows)
- `camp_items` — master catalog (structure unclear, may be empty)
- `camp_requests` — user sell submissions (`email`, `phone`, `image_url`, `camp_item_id`, `status`)
- `camp_add_requests` — requests to add new camps (`camp_name` field)
- `item_types` — global catalog (T-Shirt, Jersey, Shorts, Hoodie, Sweatpants, Hat, Other — UI should filter to T-Shirt, Hat, Hoodie only)
- `waitlist` — out-of-stock item signups
- `orders` — completed transactions with PayPal order IDs, payout status, refund status

Supabase triggers auto-increment stock on sell-approval and auto-decrement on buy-approval. Row-Level Security is enabled with public SELECT policies.

### Known routing/query quirks
- `app/camps/[slug]/[item]/page.tsx` uses a two-step slug-to-UUID lookup
- `app/camps/[slug]/page.tsx` queries `camp_items`, not `items`

## Operational Rules

- **Admin is always the middleman** — buyer and seller never communicate directly. Buyer address is shared with seller for shipping only.
- **Approval workflow is intentional** — nothing goes live without admin review.
- **Strict approval standards** — reject borderline items rather than risk a refund or reputation hit.
- **Items never disappear at 0 stock** — stay visible with a waitlist option.
- **Never reveal seller personal info** to buyers in any public UI.
- **Sales tax**: ignore for V1. Revisit at $20K+ annual revenue.
- **1099-K reporting**: PayPal Multiparty handles this automatically for sellers earning $600+/year.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
RESEND_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_PARTNER_ATTRIBUTION_ID=
PAYPAL_ENVIRONMENT=  # 'sandbox' or 'live'
```

## Design Direction

The aesthetic is **modern eco-marketplace**. Think Patagonia meets Depop. Professional and trustworthy, not crunchy or hippie. Parents need to feel safe buying and selling here, and everyone should feel like they're part of something bigger than just saving money on a camp tee.

### Reference sites
- patagonia.com — earthy, confident, mission-driven
- allbirds.com — clean, natural materials feel, warm palette
- everlane.com — minimal, transparent, editorial layouts

### Color palette
- Deep forest green: `#1F4E33` (primary)
- Warm cream: `#F5F1EA` (backgrounds)
- Soft sage: `#A8C5A0` (accents)
- Muted terracotta: `#C17A5A` (sparingly, CTAs or highlights)
- Navy blue: `#1E3A5F` (reserved for schools side when built)

### Typography
- Headlines: a slightly softer serif — Fraunces, Lora, or Playfair Display
- Body/UI: DM Sans, Satoshi, or Geist
- NO Inter, NO Roboto, NO Arial, NO system-ui defaults

### Motion
- Framer Motion throughout the home page
- Stat numbers count up from 0 when they scroll into view
- Cards stagger-fade in on load
- Scroll-triggered reveals on every section
- Subtle floating or pulsing background elements in hero
- Respect `prefers-reduced-motion`

### Hard rules
- No emojis anywhere, ever
- No purple gradients
- No rounded-bubble UI
- Sharp cards, max 8px border-radius
- Nature-inspired icons only (water drops, leaves, lightning, CO2 clouds) — use SVG, not emoji
- Generous whitespace over cramped density

## Sustainability Integration

Sustainability messaging should appear contextually throughout the experience:

- **Item cards** — "X kWh saved by buying this used"
- **Checkout success page** — total environmental impact: water saved, CO2 avoided, energy preserved
- **Seller dashboard** — cumulative impact: "Items you've listed have saved X kWh and Y liters of water"
- **Camp browse pages** — institution-level totals: "Camp Ramah families have diverted 340 lbs of clothing from landfills"
- **Waitlist messaging** — "Buying new would cost X kWh — wait for a used one and save it"

All numbers come from `clothing_impact_data.md` at the project root. Never invent stats.

## Outstanding Work

In priority order:
1. Apply for PayPal Commerce Platform access at developer.paypal.com *(blocking live payments)*
2. Build PayPal payment flow integration (after approval, sandbox first)
3. Build seller PayPal onboarding flow (Partner Referrals API)
4. Implement refund/return policy logic (7-day shipping deadline → auto-refund)
5. Seller "Mark as Shipped" UI with tracking number entry
6. Buyer order tracking page
7. Auto-refund cron/trigger for missed ship deadlines
8. Verify approved items appear correctly on public camp shop pages
9. Lock in domain name (exploring options connecting camp + sustainability + clothing)

## Pending Decisions

1. **Refund window** — how many days after purchase before auto-refund if no tracking? Suggested: 7 days.
2. **Domain name** — TBD.
3. **Camp/school main image upload UI** — `main_image` column exists in DB, no admin UI yet.
4. **Resend email templates** — order confirmation, seller sale notification, waitlist restock, refund issued.
5. **Better admin auth** — currently hardcoded password; should migrate to Supabase Auth with admin role.
6. **Schools side** — fully deferred; no active work until explicitly re-opened.
7. **Donation flow** — deferred; claim mechanism undecided (free claim, discounted pool, or application-based).

## Development Preferences

- Minimal diffs — keep unchanged lines intact when editing files
- Don't create new admin pages unless absolutely necessary; reuse existing ones
- Keep things simple and ship-able rather than over-engineered
- The `item_types` table is the source of truth for item names — filter in the UI, don't modify the table
