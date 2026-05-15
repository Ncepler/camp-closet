"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { IMPACT_COUNTER_MIN_ITEMS, WATER_LITERS_PER_ITEM, CO2_KG_PER_ITEM } from "@/lib/constants";

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
type IconProps = React.SVGProps<SVGSVGElement>;

const WaterIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C9 6.5 5 10.5 5 14.5 5 18.36 8.13 21.5 12 21.5c3.87 0 7-3.14 7-7C19 10.5 15 6.5 12 2Z" />
  </svg>
);
const BoltIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
);
const LeafIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
const CarIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M19 17H5a2 2 0 0 1-2-2v-4l2.5-5H18.5L21 11v4a2 2 0 0 1-2 2Z" />
    <circle cx="7.5" cy="17" r="1.5" />
    <circle cx="16.5" cy="17" r="1.5" />
  </svg>
);
const HomeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const WashIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <circle cx="12" cy="13" r="5" />
    <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
    <path d="M10 7h4" />
  </svg>
);
const PoolIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M2 12h20" />
    <path d="M2 6h2a2 2 0 0 1 2 2v4M18 6h2v6" />
    <path d="M2 17c1.5 0 2.5 1 4 1s2.5-1 4-1 2.5 1 4 1 2.5-1 4-1" />
    <path d="M2 21c1.5 0 2.5-1 4-1s2.5 1 4 1 2.5-1 4-1 2.5 1 4 1" />
  </svg>
);
const BathtubIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M7 17H4a2 2 0 0 1-2-2v-2h20v2a2 2 0 0 1-2 2h-3" />
    <path d="M7 17v3M17 17v3" />
    <path d="M4 13V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M2 11h20" />
  </svg>
);
const FridgeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 6v2M8 14v4" />
  </svg>
);

// ─── Easing (Emil Kowalski: strong ease-out for UI, ease-in-out for on-screen) ─
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// ─── Count-up hook ──────────────────────────────────────────────────────────────
function useCountUp(target: number, inView: boolean, reducedMotion: boolean | null, duration = 1.8) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion || target === 0) { setCount(target); return; }
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reducedMotion, duration]);
  return count;
}

// ─── Reveal section ─────────────────────────────────────────────────────────────
function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Item LCA data ───────────────────────────────────────────────────────────────
const ITEM_DATA = [
  {
    id: "tshirt",
    name: "Cotton T-Shirt",
    detail: "200g cotton",
    comparisons: [
      { Icon: WaterIcon, headline: "900 days",   detail: "of drinking water for one person" },
      { Icon: BathtubIcon, headline: "34 bathtubs", detail: "filled completely to the brim" },
      { Icon: FridgeIcon, headline: "2 weeks",   detail: "running a refrigerator nonstop" },
      { Icon: CarIcon,    headline: "18 miles",  detail: "driven in an average gas car" },
    ],
    stats: [
      { label: "Water",  value: "~2,500 L", Icon: WaterIcon },
      { label: "Energy", value: "11 kWh",   Icon: BoltIcon  },
      { label: "CO2",    value: "7 kg",     Icon: LeafIcon  },
    ],
  },
  {
    id: "sweatshirt",
    name: "Sweatshirt / Hoodie",
    detail: "500g cotton blend",
    comparisons: [
      { Icon: WaterIcon, headline: "5+ years",    detail: "of drinking water for one person" },
      { Icon: PoolIcon,  headline: "Half a pool", detail: "of a backyard swimming pool filled" },
      { Icon: HomeIcon,  headline: "1 full day",  detail: "of power for an average home" },
      { Icon: WashIcon,  headline: "250 loads",   detail: "of laundry" },
    ],
    stats: [
      { label: "Water",  value: "~6,000 L", Icon: WaterIcon },
      { label: "CO2",    value: "~15 kg",   Icon: LeafIcon  },
      { label: "Energy", value: "25 kWh",   Icon: BoltIcon  },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────────
interface Props {
  itemsResold: number;
}

export function HomeClient({ itemsResold }: Props) {
  const reducedMotion = useReducedMotion();
  const showCounter   = itemsResold >= IMPACT_COUNTER_MIN_ITEMS;

  const waterTotal = itemsResold * WATER_LITERS_PER_ITEM;
  const co2Total   = itemsResold * CO2_KG_PER_ITEM;

  const heroRef    = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const counterRef    = useRef<HTMLDivElement>(null);
  const counterInView = useInView(counterRef, { once: true, margin: "-60px" });

  const item0Ref   = useRef<HTMLDivElement>(null);
  const item1Ref   = useRef<HTMLDivElement>(null);
  const item0InView = useInView(item0Ref, { once: true, margin: "-60px" });
  const item1InView = useInView(item1Ref, { once: true, margin: "-60px" });
  const itemInViews = [item0InView, item1InView];
  const itemRefs    = [item0Ref, item1Ref];

  const waterCount = useCountUp(waterTotal,   counterInView, reducedMotion, 2.2);
  const co2Count   = useCountUp(co2Total,     counterInView, reducedMotion, 2.0);
  const itemCount  = useCountUp(itemsResold,  counterInView, reducedMotion, 1.8);

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-28 sm:py-36" style={{ background: "#F5F1E8" }}>
        {/* Floating background orb — subtle, reduced-motion safe */}
        {!reducedMotion && (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                right: "-8%",
                top: "-15%",
                width: "640px",
                height: "640px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(45,90,61,0.07) 0%, transparent 65%)",
              }}
              animate={{ scale: [1, 1.07, 1], y: [0, -18, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                left: "-12%",
                bottom: "-20%",
                width: "480px",
                height: "480px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(200,147,47,0.05) 0%, transparent 65%)",
              }}
              animate={{ scale: [1, 1.05, 1], y: [0, 12, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />
          </>
        )}

        <div className="relative max-w-4xl mx-auto">
          <motion.h1
            ref={heroRef}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT }}
            className="mb-8 leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 144, 'soft' 50",
              fontWeight: 500,
              fontSize: "clamp(44px, 6vw, 88px)",
              letterSpacing: "-0.01em",
              color: "#1F2A20",
            }}
          >
            A camp tee worn seven weeks
            <br />
            <span style={{ color: "#2D5A3D" }}>deserves another summer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
            className="text-lg max-w-xl mb-12 leading-relaxed"
            style={{ color: "#4A5247" }}
          >
            Used camp clothing, organized by camp. Every listing is reviewed before it goes live.
            The kid who needs it next is one camp over.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.35, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row items-start gap-3"
          >
            <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
              <Link
                href="/camps"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white"
                style={{
                  background: "#C8932F",
                  borderRadius: "4px",
                  transition: "opacity 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Browse the marketplace →
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium"
                style={{
                  color: "#4A5247",
                  border: "1px solid #D9D2C2",
                  borderRadius: "4px",
                  transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                or list a trunk →
              </Link>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="text-sm italic mt-6"
            style={{ color: "#8A8E83" }}
          >
            Camp gear finds its second summer here.
          </motion.p>
        </div>
      </section>

      {/* ══ CUMULATIVE STATS (only when real data exists) ═════════════════════ */}
      {showCounter && (
        <section style={{ background: "#EDE6D3", borderTop: "1px solid #D9D2C2", borderBottom: "1px solid #D9D2C2" }}>
          <div ref={counterRef} className="max-w-4xl mx-auto px-6 py-14">
            <motion.p
              initial={{ opacity: 0 }}
              animate={counterInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-widest text-center mb-10"
              style={{ color: "#8A8E83" }}
            >
              Together, we&apos;ve saved
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { count: waterCount, suffix: "L",    label: "liters of water",  Icon: WaterIcon },
                { count: co2Count,   suffix: " kg",  label: "kg CO2 avoided",   Icon: LeafIcon  },
                { count: itemCount,  suffix: "",     label: "items resold",     Icon: BoltIcon  },
              ].map(({ count, suffix, label, Icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={counterInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_OUT }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-3" style={{ color: "#2D5A3D" }} />
                  <div
                    className="mb-1 tabular"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontVariationSettings: "'opsz' 72, 'soft' 50",
                      fontWeight: 500,
                      fontSize: "clamp(32px, 4vw, 48px)",
                      color: "#1F2A20",
                    }}
                  >
                    {count.toLocaleString()}{suffix}
                  </div>
                  <div className="text-sm" style={{ color: "#4A5247" }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ THE STORY OF A CAMP TEE ═══════════════════════════════════════════ */}
      <section
        className="py-24 px-6"
        style={{ background: "#EDE6D3", borderTop: "1px solid #D9D2C2" }}
      >
        <div className="max-w-4xl mx-auto">
          <RevealSection className="max-w-3xl mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#C8932F" }}>
              The story of a camp tee
            </p>
            <h2
              className="leading-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 96, 'soft' 50",
                fontWeight: 500,
                fontSize: "clamp(28px, 3.5vw, 48px)",
                color: "#1F2A20",
              }}
            >
              A camp tee isn&apos;t trash.
              It&apos;s next summer&apos;s favorite shirt.
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-12">
            <RevealSection>
              <div className="space-y-5 leading-relaxed" style={{ color: "#4A5247" }}>
                <p>
                  Your kid wore it every day at camp. It&apos;s completely wearable. And somewhere across
                  town, another kid is heading to the same camp next summer and needs exactly this shirt.
                </p>
                <p>
                  Not a donation bin that never gets checked. Not a
                  garage sale. A direct path from one family&apos;s closet to the next kid who needs it —
                  where it gets worn again instead of forgotten.
                </p>
              </div>
            </RevealSection>
            <RevealSection>
              <div className="space-y-5 leading-relaxed" style={{ color: "#4A5247" }}>
                <p>
                  Every t-shirt that gets a second summer instead of a landfill is 2,500 liters of
                  water that didn&apos;t have to be used. Enough to fill 34 bathtubs. That&apos;s not abstract —
                  that&apos;s the actual number, and it comes from cotton farming, not shipping.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ══ THE NUMBERS MADE REAL ════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#F5F1E8" }}>
        <div className="max-w-4xl mx-auto">
          <RevealSection className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A8E83" }}>
              The numbers made real
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#4A5247", maxWidth: "480px" }}>
              Every item you buy used instead of new keeps this much out of the world.
            </p>
          </RevealSection>

          <div className="space-y-20">
            {ITEM_DATA.map((item, itemIndex) => {
              const inView = itemInViews[itemIndex];
              return (
                <div key={item.id} ref={itemRefs[itemIndex]}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3
                        style={{
                          fontFamily: "var(--font-fraunces)",
                          fontVariationSettings: "'opsz' 48, 'soft' 30",
                          fontWeight: 500,
                          fontSize: "clamp(20px, 2.5vw, 28px)",
                          color: "#1F2A20",
                        }}
                      >
                        {item.name}
                      </h3>
                      <span className="text-sm" style={{ color: "#8A8E83" }}>{item.detail}</span>
                    </div>
                    <div className="flex flex-wrap gap-5 mb-3">
                      {item.stats.map(({ label, value, Icon }) => (
                        <div key={label} className="flex items-center gap-1.5 text-sm">
                          <Icon className="w-4 h-4" style={{ color: "#2D5A3D" }} />
                          <span className="font-medium tabular" style={{ color: "#1F2A20", fontFamily: "var(--font-mono)" }}>{value}</span>
                          <span style={{ color: "#8A8E83" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm" style={{ color: "#4A5247" }}>Saving one of these from the bin means:</p>
                  </motion.div>

                  <div className="grid sm:grid-cols-2 gap-0" style={{ border: "1px solid #D9D2C2" }}>
                    {item.comparisons.map(({ Icon, headline, detail }, i) => (
                      <motion.div
                        key={headline}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                        transition={{ duration: 0.4, delay: i * 0.07, ease: EASE_OUT }}
                        className="flex items-start gap-4 p-5"
                        style={{
                          borderRight:  i % 2 === 0 ? "1px solid #D9D2C2" : "none",
                          borderBottom: i < 2       ? "1px solid #D9D2C2" : "none",
                        }}
                      >
                        <div
                          className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                          style={{ background: "#EDE6D3", borderRadius: "2px" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: "#2D5A3D" }} />
                        </div>
                        <div>
                          <div
                            className="font-medium"
                            style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 36, 'soft' 30", color: "#1F2A20" }}
                          >
                            {headline}
                          </div>
                          <div className="text-sm leading-relaxed mt-0.5" style={{ color: "#4A5247" }}>{detail}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ THE BIGGER PICTURE ════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#F5F1E8", borderTop: "1px solid #D9D2C2" }}>
        <div className="max-w-4xl mx-auto">
          <RevealSection className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A8E83" }}>
              The bigger picture
            </p>
            <h2
              className="leading-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 96, 'soft' 50",
                fontWeight: 500,
                fontSize: "clamp(28px, 3.5vw, 48px)",
                color: "#1F2A20",
              }}
            >
              The numbers are real.
              <br />
              <span style={{ color: "#2D5A3D" }}>Here&apos;s what they mean.</span>
            </h2>
          </RevealSection>

          <div className="grid sm:grid-cols-3 gap-0" style={{ border: "1px solid #D9D2C2" }}>
            {[
              { stat: "8%",    label: "of global greenhouse gas emissions", detail: "Come from the fashion industry. More than all aviation and shipping combined.",                                               source: "UN / ILO" },
              { stat: "81 lbs", label: "thrown away per person, per year",  detail: "The average American discards 81 pounds of clothing annually — most of it still wearable.",                                   source: "EPA" },
              { stat: "20–30%", label: "footprint reduction",               detail: "Extending a garment's life by just 9 months reduces its water, carbon, and waste footprint by 20–30%.", source: "Ellen MacArthur Foundation" },
            ].map(({ stat, label, detail, source }, i) => (
              <RevealSection key={stat}>
                <div
                  className="p-7 h-full"
                  style={{ borderRight: i < 2 ? "1px solid #D9D2C2" : "none" }}
                >
                  <div
                    className="mb-2 tabular"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontVariationSettings: "'opsz' 72, 'soft' 50",
                      fontWeight: 500,
                      fontSize: "clamp(28px, 3.5vw, 44px)",
                      color: "#2D5A3D",
                    }}
                  >
                    {stat}
                  </div>
                  <div className="font-medium text-sm mb-3" style={{ color: "#1F2A20" }}>{label}</div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#4A5247" }}>{detail}</p>
                  <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#D9D2C2" }}>{source}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BROWSE / SELL CTA ═════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#F5F1E8", borderTop: "1px solid #D9D2C2" }}>
        <div className="max-w-4xl mx-auto">
          <RevealSection className="mb-14">
            <h2
              className="leading-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: "'opsz' 96, 'soft' 50",
                fontWeight: 500,
                fontSize: "clamp(28px, 3.5vw, 48px)",
                color: "#1F2A20",
              }}
            >
              Your kid&apos;s old camp tee has another summer in it.
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-0" style={{ border: "1px solid #D9D2C2" }}>
            {[
              {
                href: "/camps",
                eyebrow: "Camp clothing",
                heading: "Browse the marketplace",
                body: "T-shirts, hats, and hoodies from 13 summer camps. Find gear for your camper or clear out what they've outgrown.",
                cta: "Explore camps",
                borderRight: true,
              },
              {
                href: "/submit",
                eyebrow: "Sell your gear",
                heading: "List an item",
                body: "Got a camp tee or hoodie collecting dust? List it in under two minutes. Listing is free — you only pay shipping when it sells.",
                cta: "Start selling",
                borderRight: false,
              },
            ].map(({ href, eyebrow, heading, body, cta, borderRight }) => (
              <motion.div key={href} whileTap={{ scale: 0.99 }} transition={{ duration: 0.12 }}>
                <Link
                  href={href}
                  className="group block p-10"
                  style={{
                    borderRight: borderRight ? "1px solid #D9D2C2" : "none",
                    transition: "background 220ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8A8E83" }}>
                    {eyebrow}
                  </p>
                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontVariationSettings: "'opsz' 60, 'soft' 40",
                      fontWeight: 500,
                      fontSize: "clamp(20px, 2.5vw, 28px)",
                      color: "#1F2A20",
                    }}
                  >
                    {heading}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "#4A5247" }}>
                    {body}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "#2D5A3D" }}
                  >
                    {cta}
                    <motion.span
                      className="inline-block"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                    >
                      →
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
