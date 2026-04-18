'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

type IconProps = React.SVGProps<SVGSVGElement>;

const WaterIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C9 6.5 5 10.5 5 14.5 5 18.36 8.13 21.5 12 21.5c3.87 0 7-3.14 7-7C19 10.5 15 6.5 12 2Z" />
  </svg>
);

const BoltIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
);

const LeafIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const CarIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M19 17H5a2 2 0 0 1-2-2v-4l2.5-5H18.5L21 11v4a2 2 0 0 1-2 2Z" />
    <circle cx="7.5" cy="17" r="1.5" />
    <circle cx="16.5" cy="17" r="1.5" />
  </svg>
);

const PhoneIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LaptopIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M2 20h20" />
  </svg>
);

const HomeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BulbIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6M10 22h4" />
  </svg>
);

const WashIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <circle cx="12" cy="13" r="5" />
    <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
    <path d="M10 7h4" />
  </svg>
);

const PoolIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M2 12h20" />
    <path d="M2 6h2a2 2 0 0 1 2 2v4M18 6h2v6" />
    <path d="M2 17c1.5 0 2.5 1 4 1s2.5-1 4-1 2.5 1 4 1 2.5-1 4-1" />
    <path d="M2 21c1.5 0 2.5-1 4-1s2.5 1 4 1 2.5-1 4-1 2.5 1 4 1" />
  </svg>
);

const BathtubIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M7 17H4a2 2 0 0 1-2-2v-2h20v2a2 2 0 0 1-2 2h-3" />
    <path d="M7 17v3M17 17v3" />
    <path d="M4 13V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M2 11h20" />
  </svg>
);

const FridgeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 6v2M8 14v4" />
  </svg>
);

// ─── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(
  target: number,
  inView: boolean,
  reducedMotion: boolean | null,
  duration = 1.8,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion || target === 0) {
      setCount(target);
      return;
    }
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reducedMotion, duration]);

  return count;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ITEM_DATA = [
  {
    id: 'tshirt',
    name: 'Cotton T-Shirt',
    detail: '200g cotton',
    leadStatDisplay: '~2,500L',
    leadStatValue: 2500,
    leadLabel: 'water saved',
    leadUnit: 'L',
    accentColor: '#3B82F6',
    bgTint: '#EFF6FF',
    allStats: [
      { label: 'Water', value: '~2,500 L', icon: WaterIcon },
      { label: 'Energy', value: '11 kWh', icon: BoltIcon },
      { label: 'CO2', value: '7 kg', icon: LeafIcon },
    ],
    comparisons: [
      { Icon: WaterIcon, headline: '900 days', detail: 'of drinking water for one person' },
      { Icon: BathtubIcon, headline: '34 bathtubs', detail: 'filled completely to the brim' },
      { Icon: FridgeIcon, headline: '2 weeks', detail: 'running a refrigerator nonstop' },
      { Icon: CarIcon, headline: '18 miles', detail: 'driven in an average gas car' },
    ],
  },
  {
    id: 'jersey',
    name: 'Polyester Jersey',
    detail: '180g polyester — literal crude oil',
    leadStatDisplay: '~5 kg CO2',
    leadStatValue: 5,
    leadLabel: 'CO2 avoided',
    leadUnit: ' kg',
    accentColor: '#22C55E',
    bgTint: '#F0FDF4',
    allStats: [
      { label: 'CO2', value: '~5 kg', icon: LeafIcon },
      { label: 'Energy', value: '35 kWh', icon: BoltIcon },
      { label: 'Water', value: '50 L', icon: WaterIcon },
    ],
    comparisons: [
      { Icon: LaptopIcon, headline: '3,500 hours', detail: 'of laptop use — nearly 5 months straight' },
      { Icon: PhoneIcon, headline: '3,000+ charges', detail: 'for a smartphone' },
      { Icon: BulbIcon, headline: '4 years', detail: 'burning an LED light nonstop' },
      { Icon: CarIcon, headline: '22 miles', detail: 'driven in an average gas car' },
    ],
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt / Hoodie',
    detail: '500g cotton blend',
    leadStatDisplay: '~6,000L',
    leadStatValue: 6000,
    leadLabel: 'water saved',
    leadUnit: 'L',
    accentColor: '#F59E0B',
    bgTint: '#FFFBEB',
    allStats: [
      { label: 'Water', value: '~6,000 L', icon: WaterIcon },
      { label: 'CO2', value: '~15 kg', icon: LeafIcon },
      { label: 'Energy', value: '25 kWh', icon: BoltIcon },
    ],
    comparisons: [
      { Icon: WaterIcon, headline: '5+ years', detail: 'of drinking water for one person' },
      { Icon: PoolIcon, headline: 'Half a pool', detail: 'of a backyard swimming pool filled' },
      { Icon: HomeIcon, headline: '1 full day', detail: 'of power for an average home' },
      { Icon: WashIcon, headline: '250 loads', detail: 'of laundry' },
    ],
  },
];

// Cumulative platform counter — TODO: Replace with live Supabase query
const PLATFORM_STATS = [
  { label: 'Liters of water saved', value: 127000, suffix: 'L', prefix: '' },
  { label: 'Kg of CO2 avoided', value: 840, suffix: ' kg', prefix: '' },
  { label: 'Items resold', value: 200, suffix: '+', prefix: '' },
];

// ─── Section: Scroll-triggered wrapper ───────────────────────────────────────

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating hero background ─────────────────────────────────────────────────

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Soft circles */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 420, height: 420, top: '-10%', right: '-5%', background: 'rgba(168,197,160,0.08)' }}
        animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 280, height: 280, bottom: '5%', left: '-6%', background: 'rgba(168,197,160,0.06)' }}
        animate={{ y: [0, 18, 0], x: [0, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 180, height: 180, top: '40%', left: '20%', background: 'rgba(193,122,90,0.05)' }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      {/* Leaf-like SVG accents */}
      <motion.svg
        viewBox="0 0 80 80"
        className="absolute opacity-10"
        style={{ width: 80, height: 80, top: '15%', left: '8%' }}
        animate={{ rotate: [0, 8, -4, 0], y: [0, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M40 5C20 20 5 35 10 55c5 15 25 20 40 10C65 55 75 35 60 15L40 5Z" fill="#A8C5A0" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 60 60"
        className="absolute opacity-10"
        style={{ width: 60, height: 60, bottom: '20%', right: '12%' }}
        animate={{ rotate: [0, -10, 5, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <path d="M30 4C15 14 4 25 8 40c4 12 20 16 32 8C52 40 58 25 46 12L30 4Z" fill="#A8C5A0" />
      </motion.svg>
    </div>
  );
}

// ─── Hero Stat Card ───────────────────────────────────────────────────────────

function HeroStatCard({
  item,
  index,
  inView,
  reducedMotion,
}: {
  item: (typeof ITEM_DATA)[0];
  index: number;
  inView: boolean;
  reducedMotion: boolean | null;
}) {
  const isWater = item.leadLabel === 'water saved';
  const countValue = useCountUp(item.leadStatValue, inView, reducedMotion, 1.6 + index * 0.2);

  const formatted = isWater
    ? `~${countValue.toLocaleString()}L`
    : `~${countValue.toLocaleString()} kg CO2`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!reducedMotion ? { y: -4, scale: 1.02 } : {}}
      className="relative bg-white/10 border border-white/15 rounded-lg p-6 backdrop-blur-sm text-left"
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
        {item.name}
      </div>
      <div
        className="text-3xl sm:text-4xl font-bold mb-1 leading-none"
        style={{ fontFamily: 'var(--font-fraunces)', color: item.accentColor }}
      >
        {formatted}
      </div>
      <div className="text-sm text-white/60">{item.leadLabel}</div>
      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40 leading-relaxed">
        {item.detail}
      </div>
    </motion.div>
  );
}

// ─── Comparison Card ──────────────────────────────────────────────────────────

function ComparisonCard({
  Icon,
  headline,
  detail,
  index,
  inView,
  reducedMotion,
  accentColor,
}: {
  Icon: React.ComponentType<IconProps>;
  headline: string;
  detail: string;
  index: number;
  inView: boolean;
  reducedMotion: boolean | null;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!reducedMotion ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } : {}}
      className="flex items-start gap-4 bg-white rounded-lg p-5 border border-gray-100 transition-shadow"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${accentColor}18` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor } as React.CSSProperties} />
      </div>
      <div>
        <div className="font-semibold text-gray-900 text-base" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {headline}
        </div>
        <div className="text-sm text-gray-500 leading-relaxed mt-0.5">{detail}</div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const reducedMotion = useReducedMotion();

  // Hero section inView
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  // Counter section inView
  const counterRef = useRef<HTMLDivElement>(null);
  const counterInView = useInView(counterRef, { once: true, margin: '-60px' });

  // Item sections inView refs
  const item0Ref = useRef<HTMLDivElement>(null);
  const item1Ref = useRef<HTMLDivElement>(null);
  const item2Ref = useRef<HTMLDivElement>(null);
  const item0InView = useInView(item0Ref, { once: true, margin: '-60px' });
  const item1InView = useInView(item1Ref, { once: true, margin: '-60px' });
  const item2InView = useInView(item2Ref, { once: true, margin: '-60px' });
  const itemInViews = [item0InView, item1InView, item2InView];
  const itemRefs = [item0Ref, item1Ref, item2Ref];

  // Platform counter values
  const waterCount = useCountUp(PLATFORM_STATS[0].value, counterInView, reducedMotion, 2.2);
  const co2Count = useCountUp(PLATFORM_STATS[1].value, counterInView, reducedMotion, 2.0);
  const itemCount = useCountUp(PLATFORM_STATS[2].value, counterInView, reducedMotion, 1.8);

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center px-6 py-24"
        style={{ background: '#1F4E33' }}
      >
        {!reducedMotion && <HeroBackground />}

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-white/20 rounded px-4 py-1.5 text-white/50 text-xs tracking-wider uppercase mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8C5A0]" />
            Sustainability-first marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            One resold camp tee
            <br />
            <span style={{ color: '#A8C5A0' }}>saves ~2,500 liters</span>
            <br />
            of water.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto mb-14 leading-relaxed"
          >
            Every piece of clothing that gets a second life is one less new garment manufactured,
            one less landfill, one more summer worn and loved. Camp Closet is a marketplace —
            but the mission is the planet.
          </motion.p>

          {/* Stat Cards */}
          <div
            className="grid sm:grid-cols-3 gap-4 mb-12 text-left"
          >
            {ITEM_DATA.map((item, i) => (
              <HeroStatCard
                key={item.id}
                item={item}
                index={i}
                inView={heroInView}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/camps"
              className="px-8 py-3.5 rounded text-sm font-semibold text-white transition-opacity hover:opacity-90 w-full sm:w-auto text-center"
              style={{ background: '#2d5016' }}
            >
              Browse Camps
            </Link>
            <Link
              href="/schools"
              className="px-8 py-3.5 rounded text-sm font-semibold text-white transition-opacity hover:opacity-90 w-full sm:w-auto text-center"
              style={{ background: '#1e3a5f' }}
            >
              Browse Schools
            </Link>
            <Link
              href="/submit"
              className="px-8 py-3.5 rounded border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
            >
              Sell an Item
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ CUMULATIVE COUNTER ════════════════════════════════════════════════ */}
      <section
        className="py-16 px-6 border-b border-gray-100"
        style={{ background: '#F5F1EA' }}
      >
        <div ref={counterRef} className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={counterInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-10"
          >
            Together, we've saved
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {/* Water */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={counterInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <div className="flex justify-center mb-3">
                <WaterIcon className="w-7 h-7 text-blue-400" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-fraunces)' }}>
                {waterCount.toLocaleString()}
                <span className="text-2xl">L</span>
              </div>
              <div className="text-sm text-gray-500">liters of water saved</div>
            </motion.div>
            {/* CO2 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={counterInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex justify-center mb-3">
                <LeafIcon className="w-7 h-7 text-green-500" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-fraunces)' }}>
                {co2Count.toLocaleString()}
                <span className="text-2xl"> kg</span>
              </div>
              <div className="text-sm text-gray-500">CO2 avoided</div>
            </motion.div>
            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={counterInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex justify-center mb-3">
                <LeafIcon className="w-7 h-7 text-amber-500" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-fraunces)' }}>
                {itemCount.toLocaleString()}
                <span className="text-2xl">+</span>
              </div>
              <div className="text-sm text-gray-500">items given a second life</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ WHAT IT ACTUALLY MEANS ════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">

          <RevealSection className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">The numbers made real</p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Put another way...
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Raw numbers don't land. These do. Every item you buy used instead of new keeps this
              much out of the world.
            </p>
          </RevealSection>

          {/* Item blocks */}
          <div className="space-y-20">
            {ITEM_DATA.map((item, itemIndex) => {
              const inView = itemInViews[itemIndex];
              return (
                <div key={item.id} ref={itemRefs[itemIndex]}>
                  {/* Item header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                  >
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h3
                        className="text-2xl sm:text-3xl font-bold text-gray-900"
                        style={{ fontFamily: 'var(--font-fraunces)' }}
                      >
                        {item.name}
                      </h3>
                      <span className="text-sm text-gray-400">{item.detail}</span>
                    </div>
                    {/* Mini stat row */}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {item.allStats.map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="flex items-center gap-1.5 text-sm text-gray-600"
                        >
                          <Icon className="w-4 h-4" style={{ color: item.accentColor } as React.CSSProperties} />
                          <span className="font-semibold">{value}</span>
                          <span className="text-gray-400">{label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Saving one of these from the bin means:
                    </p>
                  </motion.div>

                  {/* Comparison cards grid */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {item.comparisons.map(({ Icon, headline, detail }, i) => (
                      <ComparisonCard
                        key={headline}
                        Icon={Icon}
                        headline={headline}
                        detail={detail}
                        index={i}
                        inView={inView}
                        reducedMotion={reducedMotion}
                        accentColor={item.accentColor}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ THE SECOND LIFE ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: '#F5F1EA' }}>
        <div className="max-w-5xl mx-auto">
          <RevealSection className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C17A5A] mb-6">The story of a camp tee</p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              A camp tee isn&apos;t trash.
              <br />
              It&apos;s next summer&apos;s
              <br />
              favorite shirt.
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-16 mt-12">
            <RevealSection>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Your kid wore it every day at camp. It's sun-faded, a little soft, and it still
                  smells vaguely of sunscreen. It's also completely wearable. And somewhere across
                  town, another kid is heading to the same camp next summer and needs exactly this shirt.
                </p>
                <p>
                  That's what Camp Closet is. Not a landfill. Not a donation bin that never gets
                  checked. A direct path from one family's closet to another — where clothing gets
                  reloved instead of forgotten.
                </p>
              </div>
            </RevealSection>
            <RevealSection>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Every jersey that gets passed down instead of manufactured new is crude oil that
                  stays in the ground. Every sweatshirt that gets worn a second summer instead of
                  landfilled is 6,000 liters of water that didn't have to be used. That's not
                  abstract — that's real.
                </p>
                <p>
                  We use the word <em>reloved</em> because it's accurate. These aren't throwaway
                  things. They have camp names on them. Numbers. Colors. They mean something.
                  Passing them on is passing on that meaning.
                </p>
              </div>
            </RevealSection>
          </div>

          {/* Pull quote */}
          <RevealSection className="mt-16">
            <div
              className="border-l-4 pl-8 py-2"
              style={{ borderColor: '#A8C5A0' }}
            >
              <p
                className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                "Repurposed. Reloved. Second summer."
              </p>
              <p className="text-sm text-gray-400 mt-2">
                That's the whole idea. Buy used, sell used, and every transaction is a vote
                for the planet.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ WHY IT MATTERS ════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">The bigger picture</p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Fashion is the problem.
              <br />
              <span style={{ color: '#1F4E33' }}>Resale is the fix.</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              The facts are alarming. But every item resold is a step in the right direction.
            </p>
          </RevealSection>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                stat: '8%',
                label: 'of global greenhouse gas emissions',
                detail: 'come from the fashion industry. More than all aviation and shipping combined.',
                source: 'UN / ILO',
                color: '#1F4E33',
              },
              {
                stat: '81 lbs',
                label: 'thrown away per person, per year',
                detail: 'The average American discards 81 pounds of clothing annually — most of it still wearable.',
                source: 'EPA',
                color: '#C17A5A',
              },
              {
                stat: '20–30%',
                label: 'footprint reduction',
                detail: 'Extending a garment\'s life by just 9 months reduces its water, carbon, and waste footprint by 20–30%.',
                source: 'Ellen MacArthur Foundation',
                color: '#1e3a5f',
              },
            ].map(({ stat, label, detail, source, color }) => (
              <RevealSection key={stat}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={!reducedMotion ? { y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' } : {}}
                  className="rounded-lg p-7 border border-gray-100 bg-white h-full transition-shadow"
                >
                  <div
                    className="text-4xl sm:text-5xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-fraunces)', color }}
                  >
                    {stat}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-3">{label}</div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{detail}</p>
                  <div className="text-xs text-gray-300 uppercase tracking-widest">{source}</div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BROWSE CTA ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: '#1F4E33' }}>
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Your kid&apos;s old jersey
              <br />
              has another summer in it.
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
              Browse camps and schools to find what you need — or list what you&apos;ve outgrown.
              Every transaction saves water, energy, and CO2.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Camps card */}
            <motion.div whileHover={!reducedMotion ? { scale: 1.02 } : {}} transition={{ duration: 0.2 }}>
              <Link
                href="/camps"
                className="group relative overflow-hidden rounded-lg p-8 text-white block transition-shadow hover:shadow-xl"
                style={{ background: '#2d5016' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Camp Clothing</p>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  Browse Camps
                </h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  T-shirts, sweatshirts, jerseys, and more from 13+ summer camps.
                  Find gear for your camper or sell what they&apos;ve outgrown.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Explore camps
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>

            {/* Schools card */}
            <motion.div whileHover={!reducedMotion ? { scale: 1.02 } : {}} transition={{ duration: 0.2 }}>
              <Link
                href="/schools"
                className="group relative overflow-hidden rounded-lg p-8 text-white block transition-shadow hover:shadow-xl"
                style={{ background: '#1e3a5f' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">School Uniforms</p>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  Browse Schools
                </h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Polo shirts, khakis, dress shirts, and uniform staples from 20+ schools.
                  Uniform season doesn&apos;t have to mean buying new.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Explore schools
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </div>

          <RevealSection className="text-center mt-10">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white text-sm font-medium px-6 py-3 rounded transition-colors hover:bg-white/10"
            >
              Have something to sell? List it here
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </RevealSection>
        </div>
      </section>

    </div>
  );
}
