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

const conditionColors: Record<string, string> = {
  new:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  good: "bg-amber-50 text-amber-700 border border-amber-200",
  fair: "bg-orange-50 text-orange-700 border border-orange-200",
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

  const primaryColor = "#2d5016";
  const bgColor      = "#f8faf6";
  const isAvailable  = item.available_count > 0;
  const impact       = getImpact(item.item_type);

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
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 animate-fade-in flex flex-col"
        style={{
          animationDelay: `${animationDelay}ms`,
          opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: bgColor }}>
          {item.image_url && !imgError ? (
            <Image
              src={item.image_url}
              alt={getItemTypeLabel(item.item_type)}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-gray-400">{getItemTypeLabel(item.item_type)}</span>
            </div>
          )}

          {/* Out of stock overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}

          {/* Condition badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${conditionColors[item.condition] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
              {getConditionLabel(item.condition)}
            </span>
          </div>

          {/* Sustainability impact tag */}
          {impact && (
            <div
              className="absolute bottom-2 right-2 flex items-center gap-1 text-white px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: primaryColor + "cc" }}
            >
              <BoltIcon />
              {impact.energyDisplay} saved
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {getItemTypeLabel(item.item_type)}
            </h3>
            <span className="text-sm font-semibold flex-shrink-0" style={{ color: primaryColor }}>
              ${item.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Size {item.size}</span>
            <span className="text-gray-300">·</span>
            <span>{isAvailable ? `${item.available_count} available` : "0 available"}</span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>
          )}

          {/* CTA */}
          <div className="mt-auto">
            {isAvailable ? (
              <button
                onClick={handleBuyClick}
                className="w-full py-2 rounded text-white text-xs font-semibold transition-opacity hover:opacity-90"
                style={{ background: primaryColor }}
              >
                Buy Now
              </button>
            ) : (
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="w-full py-2 rounded text-xs font-semibold border transition-colors hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Join Waitlist
              </button>
            )}
          </div>
        </div>
      </div>

      {showBuyModal && (
        <BuyModal
          item={item}
          onClose={() => setShowBuyModal(false)}
        />
      )}
      {showWaitlistModal && (
        <WaitlistModal
          item={item}
          theme={theme}
          onClose={() => setShowWaitlistModal(false)}
        />
      )}
    </>
  );
}
