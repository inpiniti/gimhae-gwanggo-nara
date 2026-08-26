import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  // cacheComponents 는 켜지 않는다 — 기존 ISR 모델(revalidate/generateStaticParams) 사용 (docs/02-architecture.md)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/webp"],
  },
  async headers() {
    const isProd = process.env.VERCEL_ENV === "production";
    return [
      // 프리뷰/개발 환경은 색인 금지 (docs/06-operations.md)
      ...(isProd
        ? []
        : [{ source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]),
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
