import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3310] via-[#2d5016] to-[#4a7c2c] py-20 px-6 text-center">
        <h1
          className="text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          About Camp Closet
        </h1>
        <p className="text-white/75 text-xl max-w-2xl mx-auto leading-relaxed">
          A community marketplace built by parents, for parents. Trusted, safe, and focused
          on giving clothing a second life.
        </p>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>
            Our Story
          </h2>
          <div className="prose prose-gray max-w-none space-y-5 text-gray-600 leading-relaxed">
            <p>
              Camp Closet started with a simple frustration: buying branded camp gear is expensive,
              and kids outgrow it in one summer. The same goes for school uniforms — parents spend
              hundreds of dollars on clothes that barely get worn.
            </p>
            <p>
              We built Camp Closet to solve this. A focused, trusted marketplace where families
              can buy and sell used camp clothing and school uniforms — organized by institution,
              curated by real humans.
            </p>
            <p>
              Unlike general resale platforms, we review every submission before it goes live.
              We set fair prices. We keep buyer and seller info private — all communication runs
              through us. It&apos;s not just a marketplace; it&apos;s a community.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#f8faf6]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1a3310] mb-12 text-center" style={{ fontFamily: "var(--font-fraunces)" }}>
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌱",
                title: "Sustainability",
                desc: "Every item resold is one fewer item in a landfill. We believe clothing should have long lives.",
              },
              {
                icon: "🔒",
                title: "Privacy First",
                desc: "Buyers and sellers never see each other's personal info. We act as the trusted middleman.",
              },
              {
                icon: "✅",
                title: "Quality Control",
                desc: "Every submission is reviewed before going live. No spam, no scams, no surprises.",
              },
              {
                icon: "💰",
                title: "Fair Pricing",
                desc: "We set prices that are fair to both buyers and sellers. No haggling, no pressure.",
              },
              {
                icon: "🤝",
                title: "Community",
                desc: "We're building a network of families who support each other through shared resources.",
              },
              {
                icon: "💚",
                title: "Giving Back",
                desc: "Our donation program helps families who can't afford new gear access quality clothing.",
              },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6 border border-[#d4e3cc] hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{value.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
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
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#2d5016]">For Sellers</h3>
              {[
                "Create a free account",
                "Find your camp or school",
                "Describe the item and upload a photo",
                "We review and approve within 1-2 days",
                "When sold, we coordinate the handoff",
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#2d5016] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">For Buyers</h3>
              {[
                "Browse freely — no account needed",
                "Find your camp or school",
                "Click Buy Now on any item",
                "We review and match you with the seller",
                "We coordinate pickup or delivery",
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
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
      <section className="py-20 px-6 bg-gradient-to-br from-[#1a3310] to-[#2d5016] text-center">
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
          Ready to join the community?
        </h2>
        <p className="text-white/70 mb-8">Browse hundreds of items or list your own today.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/camps" className="px-8 py-4 rounded-xl bg-[#7fb069] text-[#1a3310] font-semibold hover:bg-[#8fc479] transition-colors">
            Browse Camps
          </Link>
          <Link href="/schools" className="px-8 py-4 rounded-xl bg-[#4a90e2] text-white font-semibold hover:bg-[#5a9ff0] transition-colors">
            Browse Schools
          </Link>
        </div>
      </section>
    </div>
  );
}
