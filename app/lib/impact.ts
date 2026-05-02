// Environmental impact per item type — numbers from clothing_impact_data.md only
// Note: hat has no LCA data in clothing_impact_data.md — impact stats not shown for hats.

export const IMPACT = {
  tshirt: {
    water: 2700,
    energy: 11,
    co2: 7.0,
    waterDisplay: '~2,500L',
    energyDisplay: '11 kWh',
    co2Display: '~7 kg',
    label: 'Cotton T-Shirt',
  },
  hoodie: {
    water: 6000,
    energy: 25,
    co2: 15.0,
    waterDisplay: '~6,000L',
    energyDisplay: '25 kWh',
    co2Display: '~15 kg',
    label: 'Hoodie',
  },
  // Legacy alias — existing DB rows may use 'sweatshirt'
  sweatshirt: {
    water: 6000,
    energy: 25,
    co2: 15.0,
    waterDisplay: '~6,000L',
    energyDisplay: '25 kWh',
    co2Display: '~15 kg',
    label: 'Sweatshirt / Hoodie',
  },
} as const;

export type SupportedItemType = keyof typeof IMPACT;

export function getImpact(itemType: string) {
  return IMPACT[itemType as SupportedItemType] ?? null;
}

export function getItemLabel(itemType: string): string {
  return IMPACT[itemType as SupportedItemType]?.label ?? itemType;
}

export function calcTotalImpact(items: { item_type: string; count?: number }[]) {
  let water = 0, energy = 0, co2 = 0;
  for (const item of items) {
    const impact = getImpact(item.item_type);
    if (!impact) continue;
    const n = item.count ?? 1;
    water += impact.water * n;
    energy += impact.energy * n;
    co2 += impact.co2 * n;
  }
  return { water, energy, co2 };
}

// Fixed prices per item type (all-inclusive — shipping is embedded, not a separate line item)
export const ITEM_PRICES: Record<string, number> = {
  tshirt: 22,
  hat: 12,
  hoodie: 30,
};

// Revenue split constants
// PayPal: 2.99% + $0.49 standard rate
// Platform: 15% of the amount after PayPal fee
export const PAYPAL_PCT = 0.0299;
export const PAYPAL_FIXED = 0.49;
export const PLATFORM_FEE_RATE = 0.15;

export function calcSellerPayout(itemPrice: number): {
  paypalFee: number;
  platformFee: number;
  sellerPayout: number;
} {
  const paypalFee = parseFloat((itemPrice * PAYPAL_PCT + PAYPAL_FIXED).toFixed(2));
  const platformFee = parseFloat(((itemPrice - paypalFee) * PLATFORM_FEE_RATE).toFixed(2));
  const sellerPayout = parseFloat((itemPrice - paypalFee - platformFee).toFixed(2));
  return { paypalFee, platformFee, sellerPayout };
}
