import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_ADMIN_PASSWORD:    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "",
    NEXT_PUBLIC_PAYPAL_CLIENT_ID:  process.env.PAYPAL_CLIENT_ID ?? "",
    NEXT_PUBLIC_PAYPAL_ENV:        process.env.PAYPAL_ENVIRONMENT ?? "sandbox",
  },
};

export default nextConfig;
