"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { Item } from "@/app/lib/supabaseClient";
import { getItemTypeLabel, getConditionLabel } from "@/app/lib/supabaseClient";
import { BuyModal } from "./BuyModal";
import { WaitlistModal } from "./WaitlistModal";

interface ItemCardProps {
  item: Item;
  theme: "camp" | "school";
  animationDelay?: number;
}

const conditionColors: Record<string, string> = {
  new:      "bg-emerald-100 text-emerald-800",
  like_new: "bg-blue-100 text-blue-800",
  good:     "bg-yellow-100 text-yellow-800",
  fair:     "bg-orange-100 text-orange-800",
};

export function ItemCard({ item, theme, animationDelay = 0 }: ItemCardProps) {
  const router = useRouter();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const primaryColor = theme === "camp" ? "#2d5016" : "#1e3a5f";
  const accentColor  = theme === "camp" ? "#7fb069" : "#4a90e2";
  const bgColor      = theme === "camp" ? "#f8faf6" : "#f6f9fc";

  const isAvailable = item.available_count > 0;

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
        className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in group"
        style={{
          borderColor: theme === "camp" ? "#d4e3cc" : "#c5d9ed",
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
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="text-4xl opacity-30">👕</div>
              <span className="text-xs text-gray-400">{getItemTypeLabel(item.item_type)}</span>
            </div>
          )}
          {/* Stock badge */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                Out of Stock
              </span>
            </div>
          )}
          {/* Condition badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conditionColors[item.condition] ?? "bg-gray-100 text-gray-700"}`}>
              {getConditionLabel(item.condition)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {getItemTypeLabel(item.item_type)}
            </h3>
            <span className="text-base font-bold flex-shrink-0" style={{ color: primaryColor }}>
              ${item.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="bg-gray-100 px-2 py-0.5 rounded-full">Size {item.size}</span>
            <span>·</span>
            <span>{isAvailable ? `${item.available_count} available` : "0 available"}</span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
          )}

          {/* CTA */}
          {isAvailable ? (
            <button
              onClick={handleBuyClick}
              className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              Buy Now
            </button>
          ) : (
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="w-full py-2 rounded-lg text-sm font-semibold border-2 transition-all hover:bg-gray-50 active:scale-95"
              style={{ borderColor: accentColor, color: primaryColor }}
            >
              Join Waitlist
            </button>
          )}
        </div>
      </div>

      {showBuyModal && (
        <BuyModal
          item={item}
          theme={theme}
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
