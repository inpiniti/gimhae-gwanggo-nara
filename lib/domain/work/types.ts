/** work 도메인 — docs/domain/work/overview.md */
import type { Location } from "@/lib/domain/geo/types";

/** 지도/표 목록용 (works_public_list 뷰) */
export type WorkListItem = {
  id: string;
  slug: string;
  shopName: string;
  address: string;
  addressDong: string | null;
  location: Location;
  summary: string | null;
  workedAt: string | null; // 'YYYY-MM-DD'
  coverUrl: string | null;
  categories: string[]; // CategoryCode[]
};

export type WorkImage = {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
  blurhash: string | null;
  isCover: boolean;
};

/** 상세용 */
export type WorkDetail = {
  id: string;
  slug: string;
  shopName: string;
  phone: string | null;
  address: string;
  addressDong: string | null;
  location: Location;
  summary: string | null;
  description: string | null;
  workedAt: string | null;
  updatedAt: string;
  categories: string[];
  images: WorkImage[];
};

export function formatWorkedAt(d: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${y}.${m}.${day}`;
}
