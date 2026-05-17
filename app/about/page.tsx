import Link from "next/link";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { MotionReveal } from "@/components/MotionReveal";

export const metadata: Metadata = {
  title: `About — ${BRAND_NAME}`,
  description: "Your kid's old camp tee has one more summer in it. Another Summer is a curated resale marketplace for used summer camp clothing.",
};

const PRINCIPLES = [
  {
    title: "Every listing is reviewed",
    desc: "Nothing goes live without a human looking at it. No spam, no scams, no surprises.",
  },
  {
    title: "Buyers and sellers never meet",
    desc: "Personal info stays private. All coordination runs through us — buyer address shared with seller for shipping only.",
  },
  {
    title: "Prices are set, not negotiated",
    desc: "One price per item type. No haggling, no pressure, no wondering if you got a fair deal.",
  },
  {
    title: "Shipping is always included",
    desc: "The price you see is the price you pay. No checkout surprises.",
  },
];

const SELLER_STEPS = [
  "Create a free account",
  "Find your camp",
  "Describe the item and upload a photo",
  "We review and approve within 1–2 days",
  "When sold, you ship directly to the buyer",
];

const BUYER_STEPS = [
  "Browse without an account",
  "Find your camp",
  "Buy any available item",
  "Seller ships within a week",
  "Item arrives — transaction complete",
];

const STORY_PARAGRAPHS = [
  `Branded camp gear is expensive. You buy a hoodie for $55, it gets worn seven weeks,
  and then it sits in a bin until it's donated to someone who has no idea what
  Camp Echo Lake is. The embroidery is still perfect. The fabric has barely been used.`,
  `The resale market for this specific category didn't exist — general platforms like
  eBay and Poshmark are too noisy, and camp families don't have time to search through
  thousands of listings to find gear from the right camp, in the right size, at a
  reasonable price.`,
  `${BRAND_NAME} is the focused version: one camp, one category at a time.
  Built by a 15-year-old who got tired of paying full price for a shirt that's
  going to smell like bug spray in seven weeks anyway.`,
];

export default function AboutPage() {
  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Hero */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal delay={0}>
          <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: "#8A8E83", letterSpacing: "0.12em" }}>
            About
          </p>
        </MotionReveal>
        <MotionReveal delay={0.06}>
          <h1
            className="mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 144, 'soft' 50",
              fontSize: "clamp(36px, 5vw, 60px)",
              color: "#1F2A20",
            }}
          >
            Your kid&apos;s old camp tee has one more summer in it.
          </h1>
        </MotionReveal>
        <MotionReveal delay={0.12}>
          <p className="text-base leading-relaxed" style={{ color: "#4A5247", maxWidth: "560px" }}>
            {BRAND_NAME} is a curated resale marketplace for used summer camp clothing,
            organized by camp. Every item reviewed by a human. Every transaction handled end-to-end.
            Every sale is one less new garment manufactured.
          </p>
        </MotionReveal>
      </section>

      {/* Story */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal>
          <h2
            className="font-medium mb-6"
            style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 48, 'soft' 30", fontSize: "clamp(20px, 2.5vw, 28px)" }}
          >
            Why this exists
          </h2>
        </MotionReveal>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#4A5247", maxWidth: "600px" }}>
          {STORY_PARAGRAPHS.map((text, i) => (
            <MotionReveal key={i} delay={i * 0.07}>
              <p>{text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", background: "#EDE6D3", maxWidth: "100%" }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <MotionReveal>
            <h2
              className="font-medium mb-8"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 48, 'soft' 30", fontSize: "clamp(20px, 2.5vw, 28px)" }}
            >
              How we operate
            </h2>
          </MotionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ border: "1px solid #D9D2C2", background: "#D9D2C2" }}>
            {PRINCIPLES.map((p, i) => (
              <MotionReveal key={p.title} delay={i * 0.08}>
                <div className="p-6 h-full" style={{ background: "#F5F1E8" }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: "#1F2A20" }}>{p.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A5247" }}>{p.desc}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid #D9D2C2", maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal>
          <h2
            className="font-medium mb-10"
            style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 48, 'soft' 30", fontSize: "clamp(20px, 2.5vw, 28px)" }}
          >
            The process
          </h2>
        </MotionReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <MotionReveal>
              <p className="text-xs font-medium uppercase tracking-wider mb-6" style={{ color: "#2D5A3D", letterSpacing: "0.1em" }}>
                Selling
              </p>
            </MotionReveal>
            <ol className="space-y-5">
              {SELLER_STEPS.map((step, i) => (
                <MotionReveal key={i} delay={i * 0.06}>
                  <li className="flex gap-4">
                    <span
                      className="flex-shrink-0 text-xs tabular"
                      style={{ fontFamily: "var(--font-mono)", color: "#C8932F", fontVariantNumeric: "tabular-nums", minWidth: "20px", paddingTop: "1px" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "#4A5247" }}>{step}</span>
                  </li>
                </MotionReveal>
              ))}
            </ol>
          </div>
          <div>
            <MotionReveal>
              <p className="text-xs font-medium uppercase tracking-wider mb-6" style={{ color: "#2D5A3D", letterSpacing: "0.1em" }}>
                Buying
              </p>
            </MotionReveal>
            <ol className="space-y-5">
              {BUYER_STEPS.map((step, i) => (
                <MotionReveal key={i} delay={i * 0.06}>
                  <li className="flex gap-4">
                    <span
                      className="flex-shrink-0 text-xs tabular"
                      style={{ fontFamily: "var(--font-mono)", color: "#C8932F", fontVariantNumeric: "tabular-nums", minWidth: "20px", paddingTop: "1px" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "#4A5247" }}>{step}</span>
                  </li>
                </MotionReveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16"
        style={{ maxWidth: "720px", margin: "0 auto" }}
      >
        <MotionReveal>
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 72, 'soft' 40",
              fontSize: "clamp(24px, 3vw, 36px)",
              color: "#1F2A20",
            }}
          >
            Ready to give gear a second summer?
          </h2>
        </MotionReveal>
        <MotionReveal delay={0.06}>
          <p className="text-sm mb-8" style={{ color: "#8A8E83" }}>
            Browse items at no cost. Listing is free.
          </p>
        </MotionReveal>
        <MotionReveal delay={0.12}>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/camps"
              className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#C8932F", color: "#F5F1E8", borderRadius: "4px" }}
            >
              Browse the marketplace →
            </Link>
            <Link
              href="/submit"
              className="px-6 py-3 text-sm font-medium transition-colors"
              style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px" }}
            >
              List an item
            </Link>
          </div>
        </MotionReveal>
      </section>
    </div>
  );
}
