import Link from "next/link";
import { BRAND_NAME, BRAND_EMAIL } from "@/lib/brand";

export const metadata = {
  title: `Policies — ${BRAND_NAME}`,
  description: `Return policy, refund policy, and seller guidelines for ${BRAND_NAME} Marketplace.`,
};

export default function PolicyPage() {
  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>
      <div className="px-6 py-16" style={{ maxWidth: "680px", margin: "0 auto" }}>

        <div className="mb-12">
          <Link
            href="/"
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: "#8A8E83" }}
          >
            &larr; Back to home
          </Link>
          <h1
            className="mt-5 mb-2"
            style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 72, 'soft' 40", fontSize: "36px", color: "#1F2A20" }}
          >
            Policies
          </h1>
          <p className="text-sm" style={{ color: "#8A8E83" }}>
            Last updated May 2026. Questions? Email us at {BRAND_EMAIL}.
          </p>
        </div>

        <div className="space-y-12">

          <section style={{ borderTop: "1px solid #D9D2C2", paddingTop: "36px" }}>
            <h2
              className="font-medium mb-4"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Returns
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A5247" }}>
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

          <section style={{ borderTop: "1px solid #D9D2C2", paddingTop: "36px" }}>
            <h2
              className="font-medium mb-4"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Refunds
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A5247" }}>
              <p>You&apos;re eligible for a full refund in two situations:</p>
              <ul className="space-y-2 pl-0">
                <li className="flex gap-3">
                  <span className="text-xs mt-0.5 flex-shrink-0 tabular" style={{ fontFamily: "var(--font-mono)", color: "#C8932F" }}>1</span>
                  <span>
                    <strong style={{ color: "#1F2A20" }}>The seller doesn&apos;t ship.</strong> Sellers have 7 days from
                    the date of purchase to enter a tracking number. If they miss that window,
                    your payment is automatically refunded in full.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xs mt-0.5 flex-shrink-0 tabular" style={{ fontFamily: "var(--font-mono)", color: "#C8932F" }}>2</span>
                  <span>
                    <strong style={{ color: "#1F2A20" }}>The item is significantly not as described.</strong> If what arrives
                    is materially different from what was listed — wrong item, undisclosed damage —
                    reply to your shipping confirmation email within 48 hours of delivery and we&apos;ll sort it out.
                  </span>
                </li>
              </ul>
              <p>
                Refunds are processed through PayPal and typically show up within 3–5 business days.
              </p>
            </div>
          </section>

          <section style={{ borderTop: "1px solid #D9D2C2", paddingTop: "36px" }}>
            <h2
              className="font-medium mb-4"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              PayPal disputes
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A5247" }}>
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

          <section style={{ borderTop: "1px solid #D9D2C2", paddingTop: "36px" }}>
            <h2
              className="font-medium mb-4"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              For buyers
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A5247" }}>
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

          <section style={{ borderTop: "1px solid #D9D2C2", paddingTop: "36px" }}>
            <h2
              className="font-medium mb-4"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              For sellers
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A5247" }}>
              <p>
                Once your item sells, you have 7 days to ship it and enter the USPS tracking
                number on your seller dashboard. If you miss that window, the buyer gets
                an automatic refund and the sale is reversed.
              </p>
              <p>
                Listing is free. {BRAND_NAME} takes a 15% platform fee from the sale price,
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

          <section style={{ borderTop: "1px solid #D9D2C2", paddingTop: "36px" }}>
            <h2
              className="font-medium mb-4"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              Disputes between buyers and sellers
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A5247" }}>
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

          <section className="pt-4" style={{ borderTop: "1px solid #D9D2C2" }}>
            <p className="text-sm" style={{ color: "#8A8E83" }}>
              If you have a question about an order or something not covered here, email{" "}
              <a href={`mailto:${BRAND_EMAIL}`} className="font-medium transition-opacity hover:opacity-70" style={{ color: "#2D5A3D" }}>
                {BRAND_EMAIL}
              </a>
              . We read every message.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
