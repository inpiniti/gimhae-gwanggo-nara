/**
 * 사이트 절대 URL.
 * 1) NEXT_PUBLIC_SITE_URL (비어 있으면 무시)
 * 2) Vercel 프로덕션 도메인 / 프리뷰 URL (자동 주입)
 * 3) localhost
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

/**
 * business 도메인 — 광고나라 업체 정보 (docs/domain/business/overview.md)
 * 단일 출처. 헤더/푸터/about/JSON-LD 가 모두 여기서 읽는다.
 * "확인 필요" 표시 항목은 05-open-questions 확정 후 갱신.
 */
export const business = {
  name: "김해 광고나라",
  legalName: "광고나라",
  phone: "055-338-5204",
  mobile: "010-9399-5204",
  address: {
    full: "경상남도 김해시 활천로36번길 20-1",
    region: "경상남도",
    locality: "김해시",
    street: "활천로36번길 20-1",
    postalCode: "", // 확인 필요
  },
  // geo로 1회 변환 후 하드코딩. 현재는 김해시청 근사값 (확인 필요)
  location: { lng: 128.8894, lat: 35.2285 },
  hours: [
    { days: "월–금", open: "09:00", close: "18:00" },
    { days: "토", open: "09:00", close: "13:00" },
  ], // 확인 필요
  kakaoChannelUrl: "", // 확인 필요 — 비어 있으면 버튼 미표시
  businessNumber: "", // 확인 필요 — 비어 있으면 푸터 미표시
  siteUrl: resolveSiteUrl(),
  description:
    "김해 간판·현수막·시트지(썬팅)·LED·실사출력·명함·전단지·스티커 전문. 시공 사례를 지도에서 확인하세요.",
  slogan: "김해 간판·현수막·시트지 전문",
} as const;

export type Business = typeof business;

/** tel: 링크용 (하이픈 제거) */
export const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;
