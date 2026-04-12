import Link from "next/link";

const stats = [
  { label: "Camps", value: "13+" },
  { label: "Schools", value: "20+" },
  { label: "Items Listed", value: "500+" },
  { label: "Families Served", value: "200+" },
];

const howItWorks = [
  {
    step: "1",
    title: "Browse",
    description: "Find your camp or school and see all available items with prices, sizes, and photos.",
    color: "#2d5016",
  },
  {
    step: "2",
    title: "Request",
    description: "Submit a buy request. We review everything and keep both parties' info private.",
    color: "#4a7c2c",
  },
  {
    step: "3",
    title: "Connect",
    description: "We coordinate the handoff. Safe, simple, and community-focused.",
    color: "#7fb069",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-[#1a3310] via-[#2d5016] to-[#4a7c2c]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, #7fb069 0%, transparent 50%), radial-gradient(circle at 75% 75%, #4a90e2 0%, transparent 50%)",
          }}
        />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-[#7fb069] rounded-full animate-pulse" />
            Trusted by hundreds of families
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl text-white font-bold leading-tight mb-6 animate-fade-in"
            style={{ fontFamily: "var(--font-fraunces)", animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
          >
            The Marketplace
            <br />
            <span className="text-[#7fb069]">for Camp & School</span>
            <br />
            Clothing
          </h1>

          <p
            className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
          >
            Buy and sell used camp apparel and school uniforms. Curated, safe, and community-driven.
            New items approved by us — no spam, no scams.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
          >
            <Link
              href="/camps"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95 w-full sm:w-auto justify-center"
              style={{ background: "linear-gradient(135deg, #2d5016, #4a7c2c)", boxShadow: "0 4px 24px rgba(45,80,22,0.4)" }}
            >
              <span className="text-2xl group-hover:animate-bounce">🏕️</span>
              Shop Camps
            </Link>
            <Link
              href="/schools"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95 w-full sm:w-auto justify-center"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #2e5a8f)", boxShadow: "0 4px 24px rgba(30,58,95,0.4)" }}
            >
              <span className="text-2xl group-hover:animate-bounce">🎓</span>
              Shop Schools
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}>
              <div className="text-3xl font-bold text-[#2d5016] mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
              Two Ways to Save
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Whether you&apos;re gearing up for summer camp or uniform season, we&apos;ve got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Camps card */}
            <Link
              href="/camps"
              className="group relative overflow-hidden rounded-3xl p-8 text-white transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #7fb069 100%)" }}
            >
              <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all">🌲</div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🏕️</div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Camp Clothing</h3>
                <p className="text-white/80 mb-6">
                  T-shirts, sweatshirts, hats, and more from 13+ summer camps. Find gear for your camper or sell what they&apos;ve outgrown.
                </p>
                <span className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-colors">
                  Browse Camps
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Schools card */}
            <Link
              href="/schools"
              className="group relative overflow-hidden rounded-3xl p-8 text-white transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2e5a8f 50%, #4a90e2 100%)" }}
            >
              <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all">📚</div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>School Uniforms</h3>
                <p className="text-white/80 mb-6">
                  Polo shirts, khakis, dress shirts, and uniform staples from 20+ high schools and middle schools.
                </p>
                <span className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-colors">
                  Browse Schools
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
              How It Works
            </h2>
            <p className="text-gray-500">Simple, safe, and community-powered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div
                key={step.step}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${i * 0.12}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}99)` }}
                >
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#f8faf6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a3310] mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
              Why Families Trust Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🔒", title: "Private & Safe", desc: "Buyer and seller info is never shared. All coordination goes through us." },
              { icon: "✅", title: "Every Item Approved", desc: "Nothing goes live without our review. Quality and authenticity guaranteed." },
              { icon: "💰", title: "Fair Pricing", desc: "We set prices to be fair for both buyers and sellers. No haggling needed." },
              { icon: "📸", title: "Real Photos", desc: "Sellers upload actual photos of their items. No stock images, no surprises." },
              { icon: "🔔", title: "Waitlist Alerts", desc: "Out of stock? Join the waitlist and get notified the moment it's available." },
              { icon: "🌱", title: "Sustainable", desc: "Give clothing a second life. Better for families, better for the planet." },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-[#d4e3cc] hover:shadow-md transition-shadow animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1a3310] to-[#2d5016] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
            Ready to get started?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Browse hundreds of items or list your own in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/camps"
              className="px-8 py-4 rounded-xl bg-[#7fb069] text-[#1a3310] font-semibold text-lg hover:bg-[#8fc479] transition-colors hover:shadow-lg"
            >
              Browse Camps
            </Link>
            <Link
              href="/submit"
              className="px-8 py-4 rounded-xl bg-white/10 border border-white/30 text-white font-semibold text-lg hover:bg-white/20 transition-colors"
            >
              Sell an Item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
