# Camp Closet Marketplace

## What This Is

A peer-to-peer resale marketplace for camp and school branded clothing, organized BY institution. Parents sell their kids' outgrown camp shirts and sweatshirts, and other parents at the same camp/school buy them used. This is NOT a general marketplace like eBay — items are strictly organized by camp or school, with predefined item types (t-shirt, sweatshirt) and a curated approval workflow.

## The Mission

This is a sustainability platform disguised as a marketplace. Every item resold is one less new garment manufactured, one less piece of clothing in a landfill, and thousands of liters of water saved. The home page leads with environmental impact. Everywhere else, the brand identity reinforces "reloved, repurposed, second summer." Clothes get a second life; the planet gets a break.

Sustainability is not a side message — it is the entire thesis. Every design choice, microcopy line, and feature should reinforce the idea that buying used here is an environmental act. Stats, energy savings, water savings, and CO2 avoided should appear contextually throughout the experience, not just on the home page.

## Platform Structure

Two distinct sides sharing the same architecture:
- **Camps** (green theme) — summer camps with branded apparel
- **Schools** (blue theme) — high schools and middle schools with uniforms

Users land on the home page and branch into Camps or Schools. Each side has its own inventory and visual theme.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Auth**: Supabase Auth (email/password)
- **Styling**: Tailwind CSS
- **Image storage**: Supabase Storage
- **Email**: Resend API
- **Payments**: PayPal Checkout with Multiparty / Platform Fees
- **Animation**: Framer Motion
- **Supabase client**: `app/lib/supabaseClient.ts`

## Item Types

The marketplace supports two item types only:
- **Cotton T-shirts**
- **Cotton-blend Sweatshirts / Hoodies**

Jerseys and any other apparel types are NOT supported. The submission UI, item-type dropdowns, and admin approval flow should enforce this restriction.

All environmental impact numbers for these items live in `clothing_impact_data.md` at the project root. Use ONLY those numbers — do not invent or search for others. Note: jersey data in that file is no longer in use and can be ignored or removed.

## Database Schema (Supabase)

Key tables:
- `camps` — camp data with `main_image`
- `schools` — school data with `main_image`
- `items` — inventory linked via `camp_id` or `school_id`, with stock counts and `price`
- `camp_requests` / `school_requests` — sell and donate submissions awaiting approval
- `buy_requests` — purchase submissions awaiting admin approval, with `tracking_number` and `shipped_at` fields
- `waitlist` — out-of-stock item signups
- `new_camp_requests` / `new_school_requests` — user-submitted requests for camps/schools not yet listed
- `orders` — completed transactions with PayPal order IDs, payout status, refund status

Supabase triggers auto-increment stock on sell-approval and auto-decrement on buy-approval. Row-Level Security is enabled with public SELECT policies.

## Core User Flows

**Browsing** — no account needed. Browse camps or schools → pick one → see available items.

**Selling** — requires account. Submit form with camp/school, item type (t-shirt or sweatshirt), size, condition, photo → goes to pending table → admin approves OR rejects → if approved, stock increments and item goes live. There is no "damaged-discount" tier — items either meet quality standards or are rejected outright.

**Buying** — requires account. Buyer pays via PayPal at checkout (item price + flat shipping fee) → order is created → seller receives notification with shipping details → seller ships within 5 business days and enters tracking number → admin oversees the transaction. Seller info stays hidden from buyer; buyer info is shared with seller only insofar as needed for shipping.

**Waitlist** — out-of-stock items show "Join Waitlist" → email captured → when restocked, notification fires.

**Donations** — separate flow; donated items go into a marked pool. Specific claim mechanism still undecided (see Pending Decisions).

## Payments — PayPal Multiparty

The platform uses **PayPal Checkout with Multiparty / Platform Fees** (not Stripe, not Venmo). Reasoning: marketplace-grade buyer/seller protection, automatic split payments, brand trust with parents, and built-in fraud tools.

### Revenue split

- **65% to the seller** of the item price
- **35% to the platform** of the item price
- Shipping fees are a **pass-through** — not split. The buyer's shipping payment routes to the seller (or to the platform's shipping fund if the platform is buying the label later in V2).

### Fee handling

PayPal charges the **seller** the processing fee (~3% of their payout), not the platform. This must be communicated transparently to sellers in the seller onboarding UI and the seller dashboard. Example messaging: "PayPal will deduct ~3% from your payout as their processing fee. Your effective take is ~63% of the item price."

### Payout flow

1. Buyer completes checkout via PayPal.
2. PayPal Multiparty automatically routes 65% of item price + 100% of shipping fee to seller's PayPal account, and 35% of item price to the platform's PayPal account.
3. Seller payout is held until the seller enters a tracking number (use PayPal's delayed-disbursement feature).
4. If no tracking is entered within 5 business days, the order is auto-refunded to the buyer and the seller is flagged.

### Fallback if PayPal denies marketplace approval

PayPal Multiparty requires approval, and early-stage founders are sometimes denied. If approval doesn't come through:
- Use standard PayPal Checkout where 100% of the buyer's payment lands in the platform's PayPal account
- Manually issue payouts to sellers via PayPal Payouts API after tracking is confirmed
- Same revenue split, just operationally more work for the admin

## Pricing

Pricing is set by the admin per item type per camp/school — sellers do not choose prices. Suggested starting points (adjust per institution based on retail value of the original item):

- **T-shirt**: ~$12
- **Sweatshirt**: ~$20

Prices are stored in `items.price` and can vary per camp/school for the same item type.

### Quality grading

Items are accepted or rejected at the admin approval stage. There is no discounted "damaged" tier. The admin should be strict — the cost of one poor-quality listing slipping through (refund + reputation damage) is higher than the cost of telling a seller their submission doesn't qualify.

## Shipping (V1 — Seller-Managed)

The platform launches with a **seller-ships-themselves** model. Shippo or similar label-generation integration is deferred to V2.

### Buyer-paid flat shipping fees (collected at checkout)

- **T-shirt**: $6
- **Sweatshirt**: $9

### Seller responsibilities

1. Seller receives an email notification when their item sells, including the buyer's shipping address.
2. Seller is responsible for purchasing a USPS shipping label (USPS.com or in-person at a post office) and shipping within 5 business days.
3. Seller enters the tracking number into the platform via a "Mark as Shipped" UI on their seller dashboard.
4. Seller pockets the shipping fee — it's their reimbursement for postage. If they ship cheaper than the flat fee, they keep the difference. If it costs more, they eat it. Recommended service: **USPS Ground Advantage** (cheapest for clothing, includes free $100 insurance).

### Buyer experience

- Tracking number is shown on the buyer's order page once entered.
- Buyer receives an email when tracking is added.

### Auto-refund rule

If no tracking number is entered within **5 business days** of the order, the system automatically refunds the buyer and flags the seller for review. Two flagged orders = seller is banned or all future submissions require extra scrutiny.

### V2 trigger

Migrate to Shippo (or EasyPost / Pirate Ship) when friction becomes real — sellers complaining, missed tracking entries, lost packages, or volume high enough that label generation becomes a meaningful upgrade. Shippo gives commercial USPS rates without volume requirements and integrates via a documented API. Estimated 1-2 days of dev work when the time comes.

## Returns & Refunds

The default policy is **final sale**. Buyers cannot return items for buyer's remorse, wrong size, or "doesn't fit my kid." Used clothing is sold as-is.

### Refund-eligible cases

1. **Item not as described** — photos showed a clean shirt, buyer received one with stains, holes, or damage that wasn't disclosed. Refund: full refund. The item is shipped back at the seller's expense (or the platform's if the seller disputes).
2. **Item never arrived** — tracking shows non-delivery 14+ days after the ship date. Full refund issued from the platform; the platform absorbs the loss or files a claim with USPS.

### Process

- Buyer files a claim within **7 days of delivery** (forces prompt inspection).
- Buyer submits photos showing the issue.
- Admin reviews and decides — admin is judge and jury at this scale.
- If approved, refund is issued via PayPal Refund API.
- Refund pulls from platform fee first, then from seller's payout if the seller is at fault.

### Seller penalties

- 2+ legitimate complaints = banned, OR all future submissions require additional admin scrutiny before approval.

## Operational Rules

- **Admin is always the middleman** in approval and dispute resolution. Buyer and seller never directly communicate, except for shipping address being shared with the seller post-purchase.
- **Approval workflow is intentional** — nothing goes live without admin review.
- **Strict approval standards** — reject borderline items rather than risk a refund/reputation hit.
- **Items never "disappear" at 0 stock** — they stay visible with a waitlist option.
- **Never reveal seller personal info** to buyers in any public UI. Only the shipping address is shared with the seller for fulfillment.
- **Sales tax**: ignore for V1. Most US states classify marketplaces as "marketplace facilitators" required to collect/remit sales tax, but state thresholds (typically $100K+ revenue or 200+ transactions) mean this is irrelevant at launch. Revisit at $20K+ annual revenue. Consult a tax professional before launching at scale.
- **1099-K reporting**: any seller earning $600+/year requires a 1099-K. PayPal's marketplace product handles this automatically when using Multiparty.
- **Shipping insurance**: not built into the platform. USPS Ground Advantage includes free $100 coverage. Sellers can add more at their own cost if they want.

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

### Reference sites for visual inspiration
- patagonia.com — earthy, confident, mission-driven
- allbirds.com — clean, natural materials feel, warm palette
- everlane.com — minimal, transparent, editorial layouts

### Color palette
- Deep forest green: `#1F4E33` (primary camp color)
- Navy blue: `#1E3A5F` (primary school color)
- Warm cream: `#F5F1EA` (backgrounds)
- Soft sage: `#A8C5A0` (accents)
- Muted terracotta: `#C17A5A` (sparingly, for CTAs or highlights)

### Typography
- Headlines: a slightly softer serif for warmth — Fraunces, Lora, or Playfair Display
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

Sustainability messaging is not confined to the home page. It should appear contextually throughout the experience:

- **Item cards** show a small "X kWh saved by buying this used" tag
- **Checkout success page** shows the total environmental impact of the purchase: water saved, CO2 avoided, energy preserved
- **Seller dashboard** shows cumulative impact: "Items you've listed have saved X kWh and Y liters of water"
- **Camp/school browse pages** show institution-level totals: "Camp Ramah families have diverted 340 lbs of clothing from landfills"
- **Waitlist messaging** reframes scarcity as opportunity: "Buying new would cost X kWh — wait for a used one and save it"

All numbers come from `clothing_impact_data.md`. Never invent stats.

## Current Priorities

The home page is being rebuilt around sustainability messaging. Other pages are stable and should not be touched unless the design direction calls for global styling updates.

Once the home page lands, the next priorities in order:
1. PayPal Multiparty integration (replace Stripe code)
2. Seller "Mark as Shipped" UI with tracking number entry
3. Buyer order tracking page
4. Auto-refund cron/trigger for missed ship deadlines
5. Refund/dispute admin UI
6. Item-type restriction enforcement (drop jerseys from all dropdowns and validation)

## Pending Decisions

These are still undecided and need resolution before the relevant features are built:

1. **Donation flow claim mechanism** — Option A (free claim by recipient family), Option B (donor pays for new item to send), or Option C (separate discounted pool with applications). Needs decision.
2. **Schools pricing model** — Option A (free resale, no platform fee), Option B (lower fee than camps, e.g. 5% instead of 35%), or Option C (donation-based). Needs decision.
3. **Camp/school main image upload UI** — column exists in DB, no admin UI to upload yet.
4. **Resend email templates** — order confirmation, seller notification of sale, waitlist restock, refund issued, etc.
5. **Better admin auth** — currently hardcoded password; long-term move to Supabase Auth with admin role.

## Important Notes

- The admin is always the middleman in transactions. Buyer and seller never communicate directly.
- Approval workflow is intentional — nothing goes live without admin review.
- Items never "disappear" at 0 stock — they stay visible with a waitlist option.
- Never reveal seller personal info to buyers or in any public UI.
- This is a sustainability platform first, a marketplace second. Every feature decision should pass the test: "Does this reinforce the message that buying used is an environmental act?"