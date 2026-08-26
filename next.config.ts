import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  // cacheComponents 는 켜지 않는다 — 기존 ISR 모델(revalidate/generateStaticParams) 사용 (docs/02-architecture.md)
  // OG 이미지 라우트가 런타임에 읽는 한글 폰트를 서버 번들에 포함
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/*"],
    "/works/[slug]/opengraph-image": ["./assets/fonts/*"],
  },
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
