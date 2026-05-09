"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import { getImpact } from "@/app/lib/impact";
import { BuyModal } from "./BuyModal";
import { WaitlistModal } from "./WaitlistModal";

interface ItemCardProps {
  item: Item;
  theme?: "camp";
  animationDelay?: number;
}

const conditionDot: Record<string, string> = {
  new:  "#2D5A3D",
  good: "#C8932F",
  fair: "#8A8E83",
};

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

export function ItemCard({ item, theme, animationDelay = 0 }: ItemCardProps) {
  const router = useRouter();
  const [showBuyModal, setShowBuyModal]           = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [imgError, setImgError]                   = useState(false);

  const isAvailable = item.available_count > 0;
  const impact      = getImpact(item.item_type);

  const handleBuyClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/auth?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setShowBuyModal(true);
  };

  return (
    <>
      <div
        className="border overflow-hidden flex flex-col animate-fade-in transition-all duration-200"
        style={{
          borderColor: "#D9D2C2",
          background: "#F5F1E8",
          borderRadius: "0px",
          animationDelay: `${animationDelay}ms`,
          opacity: 0,
          animationFillMode: "forwards",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#8A8E83"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D9D2C2"; }}
      >
        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden"
          style={{ background: "#EDE6D3" }}
        >
          {item.image_url && !imgError ? (
            <Image
              src={item.image_url}
              alt={getItemTypeLabel(item.item_type)}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-200 photo-warm"
              style={{ transformOrigin: "center" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs" style={{ color: "#8A8E83" }}>
                {getItemTypeLabel(item.item_type)}
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {!isAvailable && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(245,241,232,0.75)" }}
            >
              <span
                className="text-xs font-semibold px-3 py-1"
                style={{ background: "#1F2A20", color: "#F5F1E8", borderRadius: "2px" }}
              >
                Out of stock
              </span>
            </div>
          )}

          {/* Sustainability tag */}
          {impact && isAvailable && (
            <div
              className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-medium px-2 py-0.5"
              style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "2px" }}
            >
              <BoltIcon />
              {impact.energyDisplay} saved
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1" style={{ borderTop: "1px solid #D9D2C2" }}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className="font-medium text-sm leading-tight"
              style={{ color: "#1F2A20", fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
            >
              {getItemTypeLabel(item.item_type)}
            </h3>
            <span
              className="text-sm font-medium flex-shrink-0 tabular"
              style={{ color: "#1F2A20", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
            >
              ${item.price.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "#8A8E83" }}>
            <span
              className="px-1.5 py-0.5"
              style={{ background: "#EDE6D3", color: "#4A5247", borderRadius: "2px" }}
            >
              {item.size}
            </span>
            <span style={{ color: "#D9D2C2" }}>·</span>
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: conditionDot[item.condition] ?? "#8A8E83" }}
              />
              {getConditionLabel(item.condition)}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-auto">
            {isAvailable ? (
              <button
                onClick={handleBuyClick}
                className="w-full py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
              >
                Buy — ${item.price.toFixed(0)}
              </button>
            ) : (
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="w-full py-2 text-xs font-semibold transition-colors"
                style={{ border: "1px solid #D9D2C2", color: "#4A5247", borderRadius: "4px", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                Join Waitlist
              </button>
            )}
          </div>
        </div>
      </div>

      {showBuyModal && <BuyModal item={item} onClose={() => setShowBuyModal(false)} />}
      {showWaitlistModal && (
        <WaitlistModal item={item} theme={theme} onClose={() => setShowWaitlistModal(false)} />
      )}
    </>
  );
}
