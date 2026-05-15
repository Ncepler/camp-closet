"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const IMPACT = {
  tshirt: { label: "T-Shirt", co2: 7.0, water: 2700, energy: 11 },
  hoodie: { label: "Hoodie", co2: 15.0, water: 6000, energy: 25 },
};

export function ImpactEstimator() {
  const [counts, setCounts] = useState({ tshirt: 1, hoodie: 0 });

  const total = Object.entries(counts).reduce(
    (acc, [type, count]) => {
      const impact = IMPACT[type as keyof typeof IMPACT];
      return {
        co2: acc.co2 + impact.co2 * count,
        water: acc.water + impact.water * count,
        energy: acc.energy + impact.energy * count,
      };
    },
    { co2: 0, water: 0, energy: 0 }
  );

  const miles = Math.round(total.co2 / 0.4);
  const days  = Math.round(total.water / 3);

  return (
    <div style={{ borderTop: "1px solid #D9D2C2", paddingTop: "32px" }}>
      <h3
        className="text-base font-medium mb-6"
        style={{ fontFamily: "var(--font-fraunces)", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
      >
        Your impact
      </h3>

      <div className="grid grid-cols-1 gap-4 mb-8" style={{ maxWidth: "360px" }}>
        {Object.entries(IMPACT).map(([type, data]) => (
          <div key={type} className="flex items-center justify-between gap-4">
            <label className="text-sm" style={{ color: "#4A5247", minWidth: "80px" }}>
              {data.label}
            </label>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.1 }}
                onClick={() => setCounts((p) => ({ ...p, [type]: Math.max(0, p[type as keyof typeof counts] - 1) }))}
                className="w-7 h-7 flex items-center justify-center"
                style={{
                  border: "1px solid #D9D2C2",
                  borderRadius: "2px",
                  color: "#4A5247",
                  background: "transparent",
                  transition: "background 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span className="text-sm leading-none">−</span>
              </motion.button>

              <AnimatePresence mode="wait">
                <motion.span
                  key={counts[type as keyof typeof counts]}
                  initial={{ opacity: 0, y: -6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.8, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className="text-sm w-6 text-center tabular"
                  style={{ fontFamily: "var(--font-mono)", color: "#1F2A20", display: "inline-block" }}
                >
                  {counts[type as keyof typeof counts]}
                </motion.span>
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.1 }}
                onClick={() => setCounts((p) => ({ ...p, [type]: p[type as keyof typeof counts] + 1 }))}
                className="w-7 h-7 flex items-center justify-center"
                style={{
                  border: "1px solid #D9D2C2",
                  borderRadius: "2px",
                  color: "#4A5247",
                  background: "transparent",
                  transition: "background 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span className="text-sm leading-none">+</span>
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {total.co2 > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15, ease: EASE_OUT } }}
            transition={{ duration: 0.38, ease: EASE_OUT }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { value: `~${total.co2.toFixed(1)} kg`, label: "CO₂ avoided", sub: `≈ ${miles} miles not driven` },
              { value: `~${(total.water / 1000).toFixed(1)}K L`, label: "water saved", sub: `≈ ${days} days of drinking water` },
              { value: `~${total.energy} kWh`, label: "energy preserved", sub: "by not manufacturing new" },
            ].map(({ value, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.32, delay: i * 0.07, ease: EASE_OUT }}
                className="p-4"
                style={{ border: "1px solid #D9D2C2", background: "#EDE6D3" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={value}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="text-lg font-medium mb-0.5 tabular"
                    style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D", fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </motion.div>
                </AnimatePresence>
                <div className="text-xs font-medium mb-1" style={{ color: "#1F2A20" }}>{label}</div>
                <div className="text-xs" style={{ color: "#8A8E83" }}>{sub}</div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.25 }}
            className="text-sm"
            style={{ color: "#8A8E83" }}
          >
            Add items above to see your impact.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
