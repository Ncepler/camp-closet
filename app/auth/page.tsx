"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

function AuthForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") ?? "/";
  const hasError     = searchParams.get("error") === "callback_failed";

  const [mode, setMode]         = useState<"login" | "signup">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push(redirect);
    });
  }, [redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        router.push(redirect);
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("success");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#2d5016" }}
            >
              CC
            </div>
            <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
              Camp Closet
            </span>
          </Link>
        </div>

        {hasError && (
          <div className="mb-4 px-4 py-3 rounded border border-red-200 bg-red-50 text-xs text-red-700">
            The sign-in link expired or was already used. Request a new one below.
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Tab toggle */}
          <div className="flex border-b border-gray-100">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setMessage(""); setStatus("idle"); }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  mode === tab
                    ? "text-gray-900 border-b-2 border-[#2d5016]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {status === "success" ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-lg border-2 border-[#2d5016] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-[#2d5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Check your inbox</h3>
                <p className="text-xs text-gray-500 mb-1 leading-relaxed">
                  We sent a confirmation link to <strong>{email}</strong>.
                </p>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                  Click the link to finish setting up your account. Check spam if you don&apos;t see it.
                </p>
                <button
                  onClick={() => { setMode("login"); setStatus("idle"); setMessage(""); }}
                  className="text-xs text-[#2d5016] font-medium hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm outline-none focus:border-gray-400 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm outline-none focus:border-gray-400 transition-colors"
                    placeholder={mode === "signup" ? "6 characters minimum" : "••••••••"}
                  />
                </div>

                {message && status === "error" && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-2.5 rounded text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
                  style={{ background: "#2d5016" }}
                >
                  {status === "loading"
                    ? "Please wait…"
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>

                <p className="text-center text-xs text-gray-400 pt-1">
                  {mode === "login" ? "No account? " : "Already have one? "}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); setStatus("idle"); }}
                    className="text-[#2d5016] font-medium hover:underline"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          You need an account to sell. Browsing is free.{" "}
          <Link href="/camps" className="hover:text-gray-600 transition-colors">
            Browse camps →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
