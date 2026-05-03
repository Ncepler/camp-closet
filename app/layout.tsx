import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Camp Closet Marketplace",
  description:
    "Buy and sell used camp clothing and school uniforms. A trusted community marketplace for families.",
  keywords: ["camp clothing", "school uniforms", "resale", "kids clothing", "camp gear"],
  openGraph: {
    title: "Camp Closet Marketplace",
    description: "Buy and sell used camp clothing and school uniforms.",
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
      className={`${fraunces.variable} ${dmSans.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-400 py-10 px-6 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>
                Camp Closet
              </h3>
              <p className="text-sm max-w-xs">
                A community marketplace for camp clothing and school uniforms. Trusted by families.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Marketplace</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/camps" className="hover:text-white transition-colors">Browse Camps</a></li>
                  <li><a href="/submit" className="hover:text-white transition-colors">Sell Items</a></li>
                  <li><a href="/donate" className="hover:text-white transition-colors">Donate</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/auth" className="hover:text-white transition-colors">Sign In</a></li>
                  <li><a href="/policy" className="hover:text-white transition-colors">Policies</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800 text-sm text-center">
            © {new Date().getFullYear()} Camp Closet Marketplace. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
