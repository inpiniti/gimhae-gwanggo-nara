import { business } from "@/lib/domain/business/business";
import { OG_SIZE, renderOg } from "@/lib/seo/og";

export const alt = `${business.name} — ${business.slogan}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderOg({
    title: business.slogan,
    subtitle: "시공 사례를 지도에서 확인하세요",
    tags: ["간판", "현수막", "시트지(썬팅)"],
  });
}
