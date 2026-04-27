// Environmental impact per item type — numbers from clothing_impact_data.md only

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

// Flat shipping fees collected from buyers
export const SHIPPING_FEES: Record<string, number> = {
  tshirt: 6,
  sweatshirt: 9,
};

export function getShippingFee(itemType: string): number {
  return SHIPPING_FEES[itemType] ?? 6;
}

// Revenue split constants
export const PLATFORM_FEE_RATE = 0.35;
export const SELLER_RATE = 0.65;
