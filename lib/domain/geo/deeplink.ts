import type { Location } from "./types";

/** 카카오맵 — 장소 이름 + 좌표로 열기 */
export function kakaoMapUrl(name: string, { lng, lat }: Location): string {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}

/** 카카오맵 길찾기 */
export function kakaoMapRouteUrl(name: string, { lng, lat }: Location): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
}

/** 네이버지도 — 좌표로 열기 (웹) */
export function naverMapUrl(name: string, { lng, lat }: Location): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name)}?c=${lng},${lat},15,0,0,0,dh`;
}
