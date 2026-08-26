/** geo 도메인 — docs/domain/geo/overview.md */

/** 좌표 값 객체. 순서는 항상 [lng, lat] (MapLibre/GeoJSON 관례) */
export type Location = { lng: number; lat: number };

export type GeocodeResult = {
  roadAddress: string;
  jibunAddress?: string;
  dong?: string;
  location: Location;
};

/** 포트 — 구현은 kakao.ts */
export interface Geocoder {
  geocode(query: string): Promise<GeocodeResult[]>;
}

export const GIMHAE_DEFAULT_VIEWPORT = {
  center: { lng: 128.8894, lat: 35.2285 } as Location, // 김해시청
  zoom: 12,
} as const;

/** 경고용 대략 범위 (저장은 허용) */
export const GIMHAE_BOUNDS = {
  minLng: 128.7,
  maxLng: 129.05,
  minLat: 35.1,
  maxLat: 35.4,
} as const;

export function isInGimhae({ lng, lat }: Location): boolean {
  return (
    lng >= GIMHAE_BOUNDS.minLng &&
    lng <= GIMHAE_BOUNDS.maxLng &&
    lat >= GIMHAE_BOUNDS.minLat &&
    lat <= GIMHAE_BOUNDS.maxLat
  );
}

export function toLngLat(loc: Location): [number, number] {
  return [loc.lng, loc.lat];
}
