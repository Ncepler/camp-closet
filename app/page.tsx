import Link from "next/link";

const stats = [
  { label: "Camps", value: "13+" },
  { label: "Schools", value: "20+" },
  { label: "Items Listed", value: "500+" },
  { label: "Families Served", value: "200+" },
];

const howItWorks = [
  {
    step: "01",
    title: "Browse",
    description: "Find your camp or school and see all available items with prices, sizes, and photos.",
  },
  {
    step: "02",
    title: "Request",
    description: "Submit a buy request. We review everything and keep both parties' info private.",
  },
  {
    step: "03",
    title: "Connect",
    description: "We coordinate the handoff. Safe, simple, and community-focused.",
  },
];

const trustFeatures = [
  { title: "Private & Safe", desc: "Buyer and seller info is never shared. All coordination goes through us." },
  { title: "Every Item Approved", desc: "Nothing goes live without our review. Quality and authenticity guaranteed." },
  { title: "Fair Pricing", desc: "We set prices to be fair for both buyers and sellers. No haggling needed." },
  { title: "Real Photos", desc: "Sellers upload actual photos of their items. No stock images, no surprises." },
  { title: "Waitlist Alerts", desc: "Out of stock? Join the waitlist and get notified the moment it's available." },
  { title: "Sustainable", desc: "Give clothing a second life. Better for families, better for the planet." },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center px-6"
        style={{ background: "#111827" }}
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-white/15 rounded px-3 py-1 text-white/60 text-xs mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-[#7fb069] rounded-full" />
            Trusted by hundreds of families
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl text-white font-bold leading-tight mb-6 animate-fade-in"
            style={{
              fontFamily: "var(--font-fraunces)",
              animationDelay: "0.1s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            The Marketplace
            <br />
            <span style={{ color: "#7fb069" }}>for Camp &amp; School</span>
            <br />
            Clothing
          </h1>

          <p
            className="text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
          >
            Buy and sell used camp apparel and school uniforms. Curated, safe, and community-driven.
            New items approved by us — no spam, no scams.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in"
            style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
          >
            <Link
              href="/camps"
              className="px-7 py-3 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 w-full sm:w-auto text-center"
              style={{ background: "#2d5016" }}
            >
              Shop Camps
            </Link>
            <Link
              href="/schools"
              className="px-7 py-3 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 w-full sm:w-auto text-center"
              style={{ background: "#1e3a5f" }}
            >
              Shop Schools
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}
            >
              <div
                className="text-3xl font-bold text-[#2d5016] mb-1"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two Paths ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Two Ways to Save
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Whether you&apos;re gearing up for summer camp or uniform season, we&apos;ve got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Camps card */}
            <Link
              href="/camps"
              className="group relative overflow-hidden rounded-lg p-8 text-white transition-shadow hover:shadow-lg"
              style={{ background: "#2d5016" }}
            >
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Camp Clothing</p>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  Find camp apparel
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  T-shirts, sweatshirts, hats, and more from 13+ summer camps. Find gear for your camper or sell what they&apos;ve outgrown.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                  Browse Camps
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Schools card */}
            <Link
              href="/schools"
              className="group relative overflow-hidden rounded-lg p-8 text-white transition-shadow hover:shadow-lg"
              style={{ background: "#1e3a5f" }}
            >
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">School Uniforms</p>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  Find school uniforms
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  Polo shirts, khakis, dress shirts, and uniform staples from 20+ high schools and middle schools.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                  Browse Schools
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              How It Works
            </h2>
            <p className="text-gray-500 text-sm">Simple, safe, and community-powered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {howItWorks.map((step, i) => (
              <div
                key={step.step}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.12}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div
                  className="text-xs font-mono font-semibold text-[#2d5016] mb-4"
                >
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Why Families Trust Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustFeatures.map((feature, i) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center" style={{ background: "#111827" }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Ready to get started?
          </h2>
          <p className="text-white/50 mb-8 text-sm">
            Browse hundreds of items or list your own in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/camps"
              className="px-7 py-3 rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#2d5016", color: "#fff" }}
            >
              Browse Camps
            </Link>
            <Link
              href="/submit"
              className="px-7 py-3 rounded-md border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Sell an Item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
