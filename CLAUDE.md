@AGENTS.md
# Camp Closet Marketplace

## What This Is

A peer-to-peer resale marketplace for camp and school branded clothing, organized BY institution. Parents sell their kids' outgrown camp shirts, jerseys, and sweatshirts, and other parents at the same camp/school buy them used. This is NOT a general marketplace like eBay — items are strictly organized by camp or school, with predefined item types (t-shirt, jersey, sweatshirt) and a curated approval workflow.

## The Mission

This is a sustainability platform disguised as a marketplace. Every item resold is one less new garment manufactured, one less piece of clothing in a landfill, and thousands of liters of water saved. The home page leads with environmental impact. Everywhere else, the brand identity reinforces "reloved, repurposed, second summer." Clothes get a second life; the planet gets a break.

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
- **Payments**: Stripe Connect (pending)
- **Animation**: Framer Motion
- **Supabase client**: `app/lib/supabaseClient.ts`

## Item Types

The main item types were focusing on:
- **Cotton T-shirts**
- **Polyester Jerseys**
- **Cotton-blend Sweatshirts / Hoodies**

All environmental impact numbers for these three items live in `clothing_impact_data.md` at the project root. Use ONLY those numbers — do not invent or search for others.

## Database Schema (Supabase)

Key tables:
- `camps` — camp data with `main_image`
- `schools` — school data with `main_image`
- `items` — inventory linked via `camp_id` or `school_id`, with stock counts
- `camp_requests` / `school_requests` — sell and donate submissions awaiting approval
- `buy_requests` — purchase submissions awaiting admin approval
- `waitlist` — out-of-stock item signups
- `new_camp_requests` / `new_school_requests` — user-submitted requests for camps/schools not yet listed

Supabase triggers auto-increment stock on sell-approval and auto-decrement on buy-approval. Row-Level Security is enabled with public SELECT policies.

## Core User Flows

**Browsing** — no account needed. Browse camps or schools → pick one → see available items.

**Selling** — requires account. Submit form with camp/school, item type, size, condition, photo → goes to pending table → admin approves → stock increments → item goes live.

**Buying** — requires account. Submit buy request with contact info → pending → admin approves → stock decrements → admin coordinates the exchange between buyer and seller (platform is the middleman; seller info stays hidden from buyer).

**Waitlist** — out-of-stock items show "Join Waitlist" → email captured → when restocked, notification fires.

**Donations** — separate flow; donated items go into a marked pool. Specific claim mechanism still undecided.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
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

## Current Priorities

The home page is being rebuilt around sustainability messaging. See the current prompt for specifics. Other pages are stable and should not be touched unless the design direction calls for global styling updates.

## Important Notes

- The admin is always the middleman in transactions. Buyer and seller never communicate directly.
- Approval workflow is intentional — nothing goes live without admin review.
- Items never "disappear" at 0 stock — they stay visible with a waitlist option.
- Never reveal seller personal info to buyers or in any public UI.