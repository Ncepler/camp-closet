"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import { BRAND_NAME } from "@/lib/brand";
import type { User } from "@supabase/supabase-js";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

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
          className="flex-shrink-0"
          onClick={() => setMenuOpen(false)}
          style={{ transition: "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          <span
            className="font-medium"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 14, 'soft' 50",
              fontWeight: 500,
              fontSize: "15px",
              color: "#1F2A20",
            }}
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
              className="text-sm font-medium"
              style={{
                color: isActive(link.href) ? "#2D5A3D" : "#4A5247",
                textDecoration: isActive(link.href) ? "underline" : "none",
                textDecorationColor: "#2D5A3D",
                textUnderlineOffset: "4px",
                transition: "color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#1F2A20"; }}
              onMouseLeave={(e) => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#4A5247"; }}
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
                className="hidden sm:block text-sm font-medium"
                style={{
                  color: isActive("/seller") ? "#2D5A3D" : "#4A5247",
                  textDecoration: isActive("/seller") ? "underline" : "none",
                  textDecorationColor: "#2D5A3D",
                  textUnderlineOffset: "4px",
                  transition: "color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                My Sales
              </Link>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.1 }}
                onClick={handleSignOut}
                className="text-sm px-3 py-1.5 font-medium"
                style={{
                  color: "#4A5247",
                  border: "1px solid #D9D2C2",
                  borderRadius: "4px",
                  transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                Sign Out
              </motion.button>
            </div>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
              <Link
                href="/auth"
                className="text-sm px-4 py-1.5 font-medium text-white"
                style={{
                  background: "#2D5A3D",
                  borderRadius: "4px",
                  transition: "opacity 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Sign In
              </Link>
            </motion.div>
          )}

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="md:hidden p-1.5"
            style={{ color: "#4A5247" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.path
                    key="close"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <motion.path
                    key="open"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </AnimatePresence>
            </svg>
          </motion.button>
        </div>
      </nav>

      {/* Mobile menu — AnimatePresence for smooth entry/exit */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid #D9D2C2", background: "#F5F1E8" }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04, ease: EASE_OUT }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium"
                    style={{
                      color: isActive(link.href) ? "#2D5A3D" : "#1F2A20",
                      transition: "color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: navLinks.length * 0.04, ease: EASE_OUT }}
                >
                  <Link
                    href="/seller"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium"
                    style={{ color: "#4A5247" }}
                  >
                    My Sales
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
