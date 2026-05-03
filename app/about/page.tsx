import Link from "next/link";

const values = [
  {
    title: "Sustainability",
    desc: "Every item resold is one fewer item in a landfill. We believe clothing should have long lives.",
  },
  {
    title: "Privacy First",
    desc: "Buyers and sellers never see each other's personal info. We act as the trusted middleman.",
  },
  {
    title: "Quality Control",
    desc: "Every submission is reviewed before going live. No spam, no scams, no surprises.",
  },
  {
    title: "Fair Pricing",
    desc: "We set prices that are fair to both buyers and sellers. No haggling, no pressure.",
  },
  {
    title: "Community",
    desc: "We're building a network of families who support each other through shared resources.",
  },
  {
    title: "Giving Back",
    desc: "Our donation program helps families who can't afford new gear access quality clothing.",
  },
];

const sellerSteps = [
  "Create a free account",
  "Find your camp or school",
  "Describe the item and upload a photo",
  "We review and approve within 1–2 days",
  "When sold, we coordinate the handoff",
];

const buyerSteps = [
  "Browse freely — no account needed",
  "Find your camp or school",
  "Click Buy Now on any item",
  "We review and match you with the seller",
  "We coordinate pickup or delivery",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-6 text-center" style={{ background: "#111827" }}>
        <h1
          className="text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          About Camp Closet
        </h1>
        <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
          A marketplace built by a student who got tired of paying full price for gear that only
          gets worn one summer. Trusted, safe, and focused on giving clothing a second life.
        </p>
      </section>

      {/* Story */}
      <section className="py-20 px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>
            Our Story
          </h2>
          <div className="space-y-5 text-gray-600 leading-relaxed text-sm">
            <p>
              Camp Closet started with a simple frustration: buying branded camp gear is expensive,
              and you outgrow it in one summer. The same goes for school uniforms — families spend
              hundreds of dollars on clothes that barely get worn.
            </p>
            <p>
              I built Camp Closet at 15 to solve this. A focused, trusted marketplace where families
              can buy and sell used camp clothing and school uniforms — organized by institution,
              curated by a real human.
            </p>
            <p>
              Unlike general resale platforms, every submission is reviewed before it goes live.
              Prices are set fairly. Buyer and seller info stays private — all communication runs
              through us. It&apos;s not just a marketplace; it&apos;s a community built on trust.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center" style={{ fontFamily: "var(--font-fraunces)" }}>
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works detail */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center" style={{ fontFamily: "var(--font-fraunces)" }}>
            The Full Process
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[#2d5016] uppercase tracking-widest">For Sellers</h3>
              {sellerSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "#2d5016" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-widest">For Buyers</h3>
              {buyerSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "#1e3a5f" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: "#111827" }}>
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
          Ready to join the community?
        </h2>
        <p className="text-white/50 mb-8 text-sm">Browse hundreds of items or list your own today.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/camps"
            className="px-7 py-3 rounded-md text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "#2d5016" }}
          >
            Browse Camps
          </Link>
        </div>
      </section>
    </div>
  );
}
