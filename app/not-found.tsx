import Link from "next/link";
import type { Metadata } from "next";
import { MotionReveal } from "@/components/MotionReveal";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#F5F1E8" }}
    >
      <MotionReveal>
        <div style={{ maxWidth: "480px", width: "100%" }}>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-6"
            style={{ color: "#8A8E83", letterSpacing: "0.12em" }}
          >
            404
          </p>
          <h1
            className="mb-4 leading-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 72, 'soft' 40",
              fontSize: "clamp(32px, 4vw, 48px)",
              color: "#1F2A20",
            }}
          >
            Nothing here.
            <br />
            Probably packed up.
          </h1>
          <p className="text-sm mb-8" style={{ color: "#8A8E83" }}>
            This page doesn&apos;t exist, or the item may have already sold.
          </p>
          <Link
            href="/camps"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#2D5A3D" }}
          >
            ← Back to listings
          </Link>
        </div>
      </MotionReveal>
    </div>
  );
}
