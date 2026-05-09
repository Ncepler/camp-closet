"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { BRAND_NAME } from "@/lib/brand";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_ev, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/camps",  label: "Camps"  },
    { href: "/submit", label: "Sell"   },
    { href: "/donate", label: "Donate" },
    { href: "/about",  label: "About"  },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "#F5F1E8", borderBottom: "1px solid #D9D2C2" }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-6 h-6 flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: "#2D5A3D", borderRadius: "2px" }}
          >
            C
          </div>
          <span
            className="text-sm font-medium hidden sm:block"
            style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 72, 'soft' 50" }}
          >
            {BRAND_NAME}
          </span>
        </Link>

        {/* Main nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{
                color: isActive(link.href) ? "#2D5A3D" : "#4A5247",
                textDecoration: isActive(link.href) ? "underline" : "none",
                textDecorationColor: "#2D5A3D",
                textUnderlineOffset: "4px",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/seller"
                className="hidden sm:block text-sm font-medium transition-colors"
                style={{
                  color: isActive("/seller") ? "#2D5A3D" : "#4A5247",
                  textDecoration: isActive("/seller") ? "underline" : "none",
                  textDecorationColor: "#2D5A3D",
                  textUnderlineOffset: "4px",
                }}
              >
                My Sales
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm px-3 py-1.5 font-medium transition-colors"
                style={{ color: "#4A5247", border: "1px solid #D9D2C2", borderRadius: "4px" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-sm px-4 py-1.5 font-medium text-white transition-opacity hover:opacity-80"
              style={{ background: "#2D5A3D", borderRadius: "4px" }}
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 transition-colors"
            style={{ color: "#4A5247" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 space-y-1 animate-fade-in"
          style={{ borderTop: "1px solid #D9D2C2", background: "#F5F1E8" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: isActive(link.href) ? "#2D5A3D" : "#1F2A20" }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/seller"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: "#4A5247" }}
            >
              My Sales
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
