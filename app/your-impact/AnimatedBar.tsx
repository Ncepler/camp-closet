"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function AnimatedBar({
  value,
  max,
  color,
  label,
  delay = 0,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const pct = (value / max) * 100;

  return (
    <div ref={ref} className="flex items-center gap-4">
      <div className="relative h-6 overflow-hidden" style={{ flex: "1 1 0" }}>
        <motion.div
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: `${pct}%`,
            minWidth: "2px",
            background: color,
          }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.75, delay, ease: EASE_OUT }
          }
        />
      </div>
      <span
        className="text-xs tabular whitespace-nowrap"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#4A5247",
          fontVariantNumeric: "tabular-nums",
          minWidth: "190px",
        }}
      >
        {value} kg — {label}
      </span>
    </div>
  );
}
