import Link from "next/link";

export const metadata = {
  title: "Policies — Camp Closet",
  description: "Return policy, refund policy, and seller guidelines for Camp Closet Marketplace.",
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            &larr; Back to home
          </Link>
          <h1
            className="text-3xl font-bold text-gray-900 mt-4"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Policies
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Last updated May 2026. Questions? Email us at hello@campcloset.com.
          </p>
        </div>

        <div className="space-y-12 text-gray-700">

          {/* Returns */}
          <section>
            <h2
              className="text-xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Returns
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                All sales are final. We don&apos;t accept returns for reasons like wrong size,
                change of mind, or fit. Camp clothing sizing varies a lot by brand, so please
                look at the condition description and photos carefully before buying.
              </p>
              <p>
                We know that&apos;s not the answer everyone wants, but it&apos;s what makes the
                platform work — sellers are real families reselling items, not a store with
                a returns department.
              </p>
            </div>
          </section>

          {/* Refunds */}
          <section>
            <h2
              className="text-xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Refunds
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>You&apos;re eligible for a full refund in two situations:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong>The seller doesn&apos;t ship.</strong> Sellers have 7 days from
                  the date of purchase to enter a tracking number. If they miss that window,
                  your payment is automatically refunded in full.
                </li>
                <li>
                  <strong>The item is significantly not as described.</strong> If what arrives
                  is materially different from what was listed — wrong item, undisclosed damage,
                  that sort of thing — contact us and we&apos;ll sort it out.
                </li>
              </ul>
              <p>
                Refunds are processed through PayPal and typically show up within 3–5 business
                days depending on your bank.
              </p>
            </div>
          </section>

          {/* PayPal disputes */}
          <section>
            <h2
              className="text-xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              PayPal Disputes
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Because payments go through PayPal, you can open a buyer dispute directly
                with PayPal for up to 180 days after your purchase. PayPal&apos;s buyer
                protection applies to all transactions here.
              </p>
              <p>
                We&apos;d prefer you reach out to us first — most issues are easy to resolve
                without a formal dispute — but you&apos;re free to go through PayPal if you prefer.
              </p>
            </div>
          </section>

          {/* For buyers */}
          <section>
            <h2
              className="text-xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              For Buyers
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Your shipping address is shared with the seller so they can mail your item.
                It is never displayed publicly or used for anything else. We don&apos;t share
                your contact information with sellers beyond what&apos;s needed to complete the shipment.
              </p>
              <p>
                Shipping is included in the listed price — there are no surprise fees at checkout.
                Sellers ship via USPS. You should receive tracking info by email once the
                item has been dropped off.
              </p>
            </div>
          </section>

          {/* For sellers */}
          <section>
            <h2
              className="text-xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              For Sellers
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Once your item sells, you have 7 days to ship it and enter the USPS tracking
                number on your seller dashboard. If you miss that window, the buyer gets
                an automatic refund and the sale is reversed.
              </p>
              <p>
                Listing is free. Camp Closet takes a 15% platform fee from the sale price,
                and PayPal deducts its standard processing fee (2.99% + $0.49). The rest
                is paid to you through PayPal.
              </p>
              <p>
                You&apos;re responsible for the actual shipping cost, which comes out of your
                payout. USPS Ground Advantage is the cheapest option for clothing — a hat
                runs about $4, a t-shirt $5, a hoodie $7. Use a poly mailer to keep costs down.
              </p>
              <p>
                Be honest in your listings. We review every submission before it goes live,
                and we&apos;ll reject anything that looks misrepresented. If a buyer receives
                something significantly different from what was listed, the refund comes
                from your payout.
              </p>
            </div>
          </section>

          {/* Disputes */}
          <section>
            <h2
              className="text-xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Disputes Between Buyers and Sellers
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Buyers and sellers never communicate directly through this platform — we
                act as the middleman. If there&apos;s a problem with an order, contact us
                and we&apos;ll mediate.
              </p>
              <p>
                We take these seriously. A bad transaction reflects on the whole platform,
                and most of our sellers are real families who want to do right by buyers.
                We&apos;ll do our best to find a fair resolution quickly.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-100 pt-10">
            <p className="text-sm text-gray-500">
              If you have a question about an order or something not covered here, email{" "}
              <a href="mailto:hello@campcloset.com" className="text-[#2d5016] font-medium hover:underline">
                hello@campcloset.com
              </a>
              . We read every message.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
