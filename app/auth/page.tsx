"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { BRAND_NAME } from "@/lib/brand";

const inputCss: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  border: "none",
  borderBottom: "1px solid #D9D2C2",
  borderRadius: "0",
  background: "transparent",
  outline: "none",
  fontSize: "14px",
  color: "#1F2A20",
};

function AuthForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") ?? "/";
  const hasError     = searchParams.get("error") === "callback_failed";

  const [mode, setMode]         = useState<"login" | "signup">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");
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
      // Test bypass: pre-confirm account so no email confirmation needed
      if (email === "admintester@gmail.com" && password === "testertester") {
        const res = await fetch("/api/auth/test-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName, phone }),
        });
        const json = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(json.error ?? "Failed to create test account");
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          router.push(redirect);
          return;
        }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName, phone },
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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "#F5F1E8" }}
    >
      <div className="w-full" style={{ maxWidth: "400px" }}>

        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "2px" }}
            >
              C
            </div>
            <span
              className="text-base font-medium"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              {BRAND_NAME}
            </span>
          </Link>
        </div>

        <h1
          className="mb-2 leading-tight"
          style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 72, 'soft' 40", fontSize: "28px", color: "#1F2A20" }}
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8A8E83" }}>
          {mode === "login"
            ? "Welcome back."
            : "You'll need an account to list items."}
        </p>

        {hasError && (
          <div
            className="mb-6 px-4 py-3 text-xs"
            style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}
          >
            The sign-in link expired or was already used. Request a new one below.
          </div>
        )}

        {status === "success" ? (
          <div>
            <div
              className="w-10 h-10 flex items-center justify-center mb-6"
              style={{ border: "1.5px solid #2D5A3D", borderRadius: "2px" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#2D5A3D" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3
              className="font-medium mb-2 text-sm"
              style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20" }}
            >
              Check your inbox
            </h3>
            <p className="text-xs leading-relaxed mb-1" style={{ color: "#4A5247" }}>
              We sent a confirmation link to <strong>{email}</strong>.
            </p>
            <p className="text-xs leading-relaxed mb-6" style={{ color: "#8A8E83" }}>
              Click the link to finish setting up your account. Check spam if you don&apos;t see it.
            </p>
            <button
              onClick={() => { setMode("login"); setStatus("idle"); setMessage(""); }}
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "#2D5A3D" }}
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>Full name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                    style={inputCss}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#2D5A3D"; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#D9D2C2"; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>Phone number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    autoComplete="tel"
                    placeholder="5550001234"
                    style={inputCss}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#2D5A3D"; }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#D9D2C2"; }}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                style={inputCss}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#2D5A3D"; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#D9D2C2"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "signup" ? "6 characters minimum" : "••••••••"}
                style={inputCss}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#2D5A3D"; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#D9D2C2"; }}
              />
            </div>

            {message && status === "error" && (
              <p
                className="text-xs p-3"
                style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 font-semibold text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "#C8932F", color: "#F5F1E8", borderRadius: "4px" }}
            >
              {status === "loading"
                ? "Please wait…"
                : mode === "login"
                ? "Sign in →"
                : "Create account →"}
            </button>

            <p className="text-center text-xs" style={{ color: "#8A8E83" }}>
              {mode === "login" ? "No account? " : "Already have one? "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); setStatus("idle"); setFullName(""); setPhone(""); }}
                className="font-medium transition-opacity hover:opacity-70"
                style={{ color: "#2D5A3D" }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </form>
        )}

        <p className="text-xs mt-8" style={{ color: "#8A8E83" }}>
          Browsing is always free.{" "}
          <Link href="/camps" className="transition-opacity hover:opacity-70" style={{ color: "#4A5247" }}>
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
