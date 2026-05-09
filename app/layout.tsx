import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description:
    "Buy and sell used camp clothing, organized by camp. Every listing reviewed before it goes live. Because a camp tee worn one summer deserves another.",
  keywords: ["camp clothing", "camp gear", "used camp clothes", "summer camp resale", "kids secondhand"],
  openGraph: {
    title: BRAND_NAME,
    description: "Camp gear finds its second summer here.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer>
          {/* Sustainability one-liner — appears on every page */}
          <div
            className="px-6 py-3 text-center"
            style={{ background: "#EDE6D3", borderTop: "1px solid #D9D2C2" }}
          >
            <p className="text-xs" style={{ color: "#4A5247" }}>
              Manufacturing new clothes produces ~10× more carbon than shipping used ones.{" "}
              <Link
                href="/your-impact"
                className="underline underline-offset-2 transition-opacity hover:opacity-70"
                style={{ textDecorationColor: "#2D5A3D" }}
              >
                The math →
              </Link>
            </p>
          </div>

          {/* Main footer */}
          <div className="px-6 py-16" style={{ background: "#1F2A20" }}>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

                {/* Brand column */}
                <div className="col-span-2 md:col-span-1">
                  <h3
                    className="text-lg font-medium mb-3"
                    style={{ fontFamily: "var(--font-fraunces)", color: "#F5F1E8" }}
                  >
                    {BRAND_NAME}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "rgba(245,241,232,0.45)" }}
                  >
                    {BRAND_TAGLINE}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(245,241,232,0.25)" }}
                  >
                    Organized by camp. Every listing reviewed before it goes live.
                  </p>
                </div>

                {/* Marketplace */}
                <div>
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-5"
                    style={{ color: "rgba(245,241,232,0.35)" }}
                  >
                    Marketplace
                  </h4>
                  <ul className="space-y-3">
                    {[
                      { href: "/camps",     label: "Browse Camps" },
                      { href: "/submit",    label: "List an Item" },
                      { href: "/donations", label: "Donated Gear" },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: "rgba(245,241,232,0.6)" }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-5"
                    style={{ color: "rgba(245,241,232,0.35)" }}
                  >
                    Company
                  </h4>
                  <ul className="space-y-3">
                    {[
                      { href: "/about",  label: "About" },
                      { href: "/policy", label: "Policies" },
                      { href: "/auth",   label: "Sign In" },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: "rgba(245,241,232,0.6)" }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact */}
                <div>
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-5"
                    style={{ color: "rgba(245,241,232,0.35)" }}
                  >
                    Impact
                  </h4>
                  <ul className="space-y-3">
                    {[
                      { href: "/your-impact", label: "Your impact" },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: "rgba(245,241,232,0.6)" }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                className="border-t pt-8"
                style={{ borderColor: "rgba(245,241,232,0.1)" }}
              >
                <p
                  className="text-xs text-center"
                  style={{ color: "rgba(245,241,232,0.25)" }}
                >
                  © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
