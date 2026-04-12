"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

function AuthForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") ?? "/";

  const [mode, setMode]         = useState<"login" | "signup">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState("");

  useEffect(() => {
    // If already logged in, redirect
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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("success");
        setMessage("Check your email for a confirmation link, then sign in.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "linear-gradient(135deg, #f8faf6 0%, #f6f9fc 100%)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: "linear-gradient(135deg, #2d5016, #7fb069)" }}>
              CC
            </div>
            <span className="text-xl font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
              Camp Closet
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab toggle */}
          <div className="flex border-b border-gray-100">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setMessage(""); setStatus("idle"); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  mode === tab
                    ? "text-[#2d5016] border-b-2 border-[#2d5016]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {status === "success" ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h3 className="font-semibold text-gray-900 mb-2">Check your email!</h3>
                <p className="text-sm text-gray-500 mb-4">{message}</p>
                <button
                  onClick={() => { setMode("login"); setStatus("idle"); setMessage(""); }}
                  className="text-sm text-[#2d5016] font-medium hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#7fb069] focus:ring-2 focus:ring-[#7fb069]/20 transition"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#7fb069] focus:ring-2 focus:ring-[#7fb069]/20 transition"
                    placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  />
                </div>

                {message && status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 mt-1"
                  style={{ background: "linear-gradient(135deg, #2d5016, #4a7c2c)" }}
                >
                  {status === "loading"
                    ? "Please wait…"
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>

                <p className="text-center text-xs text-gray-500 pt-1">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
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

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing up you agree to our terms of service.
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
