"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isCampPage = pathname?.startsWith("/camps");
  const isSchoolPage = pathname?.startsWith("/schools");

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
    { href: "/camps",   label: "Camps"   },
    { href: "/schools", label: "Schools" },
    { href: "/submit",  label: "Sell"    },
    { href: "/donate",  label: "Donate"  },
    { href: "/about",   label: "About"   },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "#2d5016" }}
          >
            CC
          </div>
          <span
            className="text-base font-semibold hidden sm:block text-gray-900"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Camp Closet
          </span>
        </Link>

        {/* Mode toggle */}
        <div className="hidden md:flex items-center gap-0.5 border border-gray-200 rounded-md p-0.5">
          <Link
            href="/camps"
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isCampPage
                ? "bg-[#2d5016] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Camps
          </Link>
          <Link
            href="/schools"
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isSchoolPage
                ? "bg-[#1e3a5f] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Schools
          </Link>
        </div>

        {/* Main nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[140px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-sm px-4 py-1.5 rounded text-white font-medium transition-colors hover:opacity-90"
              style={{ background: "#2d5016" }}
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 animate-fade-in">
          <div className="flex gap-2 mb-3">
            <Link
              href="/camps"
              onClick={() => setMenuOpen(false)}
              className={`flex-1 text-center py-2 rounded text-sm font-medium border transition-colors ${
                isCampPage ? "bg-[#2d5016] text-white border-[#2d5016]" : "text-[#2d5016] border-gray-200 hover:bg-gray-50"
              }`}
            >
              Camps
            </Link>
            <Link
              href="/schools"
              onClick={() => setMenuOpen(false)}
              className={`flex-1 text-center py-2 rounded text-sm font-medium border transition-colors ${
                isSchoolPage ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "text-[#1e3a5f] border-gray-200 hover:bg-gray-50"
              }`}
            >
              Schools
            </Link>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
