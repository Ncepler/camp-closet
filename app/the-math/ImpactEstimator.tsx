"use client";

import { useState } from "react";

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
  const days = Math.round(total.water / 3);

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
              <button
                onClick={() => setCounts((p) => ({ ...p, [type]: Math.max(0, p[type as keyof typeof counts] - 1) }))}
                className="w-7 h-7 flex items-center justify-center transition-colors"
                style={{ border: "1px solid #D9D2C2", borderRadius: "2px", color: "#4A5247", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span className="text-sm leading-none">−</span>
              </button>
              <span
                className="text-sm w-6 text-center tabular"
                style={{ fontFamily: "var(--font-mono)", color: "#1F2A20" }}
              >
                {counts[type as keyof typeof counts]}
              </span>
              <button
                onClick={() => setCounts((p) => ({ ...p, [type]: p[type as keyof typeof counts] + 1 }))}
                className="w-7 h-7 flex items-center justify-center transition-colors"
                style={{ border: "1px solid #D9D2C2", borderRadius: "2px", color: "#4A5247", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span className="text-sm leading-none">+</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {total.co2 > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: `~${total.co2.toFixed(1)} kg`, label: "CO₂ avoided", sub: `≈ ${miles} miles not driven` },
            { value: `~${(total.water / 1000).toFixed(1)}K L`, label: "water saved", sub: `≈ ${days} days of drinking water` },
            { value: `~${total.energy} kWh`, label: "energy preserved", sub: "by not manufacturing new" },
          ].map(({ value, label, sub }) => (
            <div
              key={label}
              className="p-4"
              style={{ border: "1px solid #D9D2C2", background: "#EDE6D3" }}
            >
              <div
                className="text-lg font-medium mb-0.5 tabular"
                style={{ fontFamily: "var(--font-mono)", color: "#2D5A3D", fontVariantNumeric: "tabular-nums" }}
              >
                {value}
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: "#1F2A20" }}>{label}</div>
              <div className="text-xs" style={{ color: "#8A8E83" }}>{sub}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm" style={{ color: "#8A8E83" }}>
          Add items above to see your impact.
        </div>
      )}
    </div>
  );
}
