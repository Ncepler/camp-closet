import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { ImpactEstimator } from "./ImpactEstimator";
import { AnimatedBar } from "./AnimatedBar";
import { MotionReveal } from "@/components/MotionReveal";

export const metadata: Metadata = {
  title: `Your Impact — ${BRAND_NAME}`,
  description:
    "Does shipping used clothing really help? We show the numbers: manufacturing a t-shirt produces 7 kg of CO₂. Shipping it produces 0.4 kg.",
};

const CHART_ITEMS = [
  { label: "T-Shirt",  manufacturing: 7.0,  shipping: 0.4, source: 1 },
  { label: "Hoodie",   manufacturing: 15.0, shipping: 0.4, source: 2 },
];

const MAX_CO2 = 15.0;

export default function TheMathPage() {
  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Hero */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal delay={0}>
          <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: "#8A8E83", letterSpacing: "0.12em" }}>
            Your Impact
          </p>
        </MotionReveal>
        <MotionReveal delay={0.06}>
          <h1
            className="mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 144, 'soft' 50",
              fontSize: "clamp(36px, 5vw, 64px)",
              color: "#1F2A20",
            }}
          >
            Doesn&apos;t shipping make this worse?
          </h1>
        </MotionReveal>
        <MotionReveal delay={0.12}>
          <p className="text-lg leading-relaxed" style={{ color: "#4A5247", maxWidth: "560px" }}>
            No. Manufacturing a new t-shirt produces around 7 kg of CO₂.
            Shipping a used one across the country produces about 0.4 kg — roughly
            17 times less.
          </p>
        </MotionReveal>
      </section>

      {/* Bar chart */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal>
          <h2
            className="text-base font-medium mb-10"
            style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
          >
            CO₂ emissions: manufacturing new vs. shipping used
          </h2>
        </MotionReveal>

        <div className="space-y-10">
          {CHART_ITEMS.map(({ label, manufacturing, shipping, source }) => (
            <MotionReveal key={label}>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "#8A8E83", letterSpacing: "0.1em" }}>
                  {label}
                  <sup className="ml-0.5" style={{ color: "#C8932F" }}>{source}</sup>
                </p>
                <div className="space-y-3">
                  <AnimatedBar value={manufacturing} max={MAX_CO2} color="#2D5A3D" label="manufacturing new" delay={0.1} />
                  <AnimatedBar value={shipping}      max={MAX_CO2} color="#C8932F" label="shipping used"     delay={0.22} />
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>

        <MotionReveal>
          <div className="flex items-center gap-6 mt-10 pt-8" style={{ borderTop: "1px solid #D9D2C2" }}>
            {[
              { color: "#2D5A3D", label: "Manufacturing new" },
              { color: "#C8932F", label: "Shipping used" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: color }} />
                <span className="text-xs" style={{ color: "#4A5247" }}>{label}</span>
              </div>
            ))}
          </div>
        </MotionReveal>
      </section>

      {/* The numbers */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", background: "#EDE6D3", maxWidth: "100%" }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <MotionReveal>
            <h2
              className="text-base font-medium mb-8"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Per-item breakdown
            </h2>
          </MotionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ border: "1px solid #D9D2C2", background: "#D9D2C2" }}>
            {[
              {
                item: "T-Shirt",
                stats: [
                  { label: "Water to produce", value: "~2,700 L", note: "drinking water for 900 days" },
                  { label: "Energy to produce", value: "11 kWh",   note: "powers a fridge for 2 weeks" },
                  { label: "CO₂ to produce",    value: "~7 kg",    note: "equals driving ~18 miles" },
                  { label: "CO₂ to ship used",  value: "~0.4 kg",  note: "USPS First Class domestic" },
                ],
                source: 1,
              },
              {
                item: "Hoodie",
                stats: [
                  { label: "Water to produce", value: "~6,000 L", note: "drinking water for 5+ years" },
                  { label: "Energy to produce", value: "25 kWh",   note: "powers a home for a full day" },
                  { label: "CO₂ to produce",    value: "~15 kg",   note: "equals driving ~38 miles" },
                  { label: "CO₂ to ship used",  value: "~0.4 kg",  note: "USPS Ground Advantage domestic" },
                ],
                source: 2,
              },
            ].map(({ item, stats, source }, i) => (
              <MotionReveal key={item} delay={i * 0.08}>
                <div className="p-6 h-full" style={{ background: "#F5F1E8" }}>
                  <p
                    className="text-sm font-medium mb-5"
                    style={{ color: "#1F2A20", fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                  >
                    {item}
                    <sup className="ml-0.5" style={{ color: "#C8932F" }}>{source}</sup>
                  </p>
                  <div className="space-y-4">
                    {stats.map(({ label, value, note }) => (
                      <div key={label}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-xs" style={{ color: "#8A8E83" }}>{label}</span>
                          <span
                            className="text-sm font-medium tabular"
                            style={{ fontFamily: "var(--font-mono)", color: "#1F2A20", fontVariantNumeric: "tabular-nums" }}
                          >
                            {value}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "#A8A89F" }}>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* The catch */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal>
          <h2
            className="text-base font-medium mb-6"
            style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
          >
            The catch
          </h2>
        </MotionReveal>

        <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#4A5247", maxWidth: "600px" }}>
          {[
            "The numbers above assume that buying a used item means one fewer new item gets made. That's the ideal case — and it's the most common one.",
            <>
              But researchers at Yale and the Ellen MacArthur Foundation have documented a rebound effect: some
              buyers who purchase second-hand use the savings to buy more clothing overall.
              If you spend what you saved on a new item elsewhere, the net benefit shrinks.
              <sup className="ml-0.5" style={{ color: "#C8932F" }}>3</sup>
            </>,
            "Our items don't compete with fast fashion on price — a used Camp Closet hoodie costs $30, not $8 from a fast-fashion retailer. We think that removes most of the rebound risk for this specific category.",
            <>
              Extending a garment&apos;s active life by just nine months reduces its total water, carbon,
              and waste footprint by 20–30%.
              <sup className="ml-0.5" style={{ color: "#C8932F" }}>4</sup>
              {" "}A camp tee worn every summer for three years instead of one doesn&apos;t need a fancy study to justify it.
            </>,
          ].map((text, i) => (
            <MotionReveal key={i} delay={i * 0.05}>
              <p>{text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      {/* Context stats */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", background: "#EDE6D3", maxWidth: "100%" }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <MotionReveal>
            <h2
              className="text-base font-medium mb-8"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Bigger picture
            </h2>
          </MotionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ border: "1px solid #D9D2C2", background: "#D9D2C2" }}>
            {[
              {
                stat: "8%",
                label: "of global greenhouse gas emissions come from the fashion industry",
                source: 5,
              },
              {
                stat: "81 lbs",
                label: "of clothing the average American discards every year — most of it still wearable",
                source: 6,
              },
              {
                stat: "20–30%",
                label: "reduction in footprint from extending a garment's active life by just nine months",
                source: 4,
              },
            ].map(({ stat, label, source }, i) => (
              <MotionReveal key={stat} delay={i * 0.08}>
                <div className="p-6 h-full" style={{ background: "#F5F1E8" }}>
                  <div
                    className="text-3xl font-medium mb-3 tabular"
                    style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D", fontVariantNumeric: "tabular-nums" }}
                  >
                    {stat}
                    <sup className="text-xs ml-0.5" style={{ color: "#C8932F" }}>{source}</sup>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#4A5247" }}>{label}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact estimator */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <ImpactEstimator />
      </section>

      {/* Footnotes */}
      <section
        className="px-6 py-12"
        style={{ maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal>
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-6"
            style={{ color: "#8A8E83", letterSpacing: "0.1em" }}
          >
            Sources
          </h2>
          <ol className="space-y-3">
            {[
              { n: 1, text: "WWF — cotton t-shirt water and CO₂ figures. Cradle-to-gate LCA, covering farming, ginning, spinning, weaving, dyeing, and finishing." },
              { n: 2, text: "Carbonfact / industry LCA data — sweatshirt/hoodie CO₂ and water figures. Based on 500g cotton-blend garment." },
              { n: 3, text: "Ellen MacArthur Foundation, \"A New Textiles Economy\" (2017). Rebound effects documented for secondhand and rental clothing categories." },
              { n: 4, text: "Ellen MacArthur Foundation — extending active garment life by nine months reduces water, carbon, and waste footprint by 20–30%." },
              { n: 5, text: "UN / ILO — fashion industry share of global greenhouse gas emissions, approximately 8%." },
              { n: 6, text: "EPA / Council for Textile Recycling — average American discards approximately 81 lbs of clothing annually." },
            ].map(({ n, text }) => (
              <li key={n} className="flex gap-3 text-xs leading-relaxed" style={{ color: "#8A8E83" }}>
                <span
                  className="flex-shrink-0 font-medium"
                  style={{ color: "#C8932F", fontFamily: "var(--font-mono)", minWidth: "16px" }}
                >
                  {n}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 pt-8" style={{ borderTop: "1px solid #D9D2C2" }}>
            <p className="text-xs mb-4" style={{ color: "#8A8E83" }}>
              All CO₂ figures are cradle-to-gate (production only). Shipping emissions estimated for domestic USPS First Class / Ground Advantage delivery of a 200–500g parcel.
              Actual impact varies by origin country, energy grid mix, and transport route.
            </p>
            <Link
              href="/camps"
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#2D5A3D" }}
            >
              Browse the marketplace →
            </Link>
          </div>
        </MotionReveal>
      </section>
    </div>
  );
}
