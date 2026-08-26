import "server-only";

import type { Geocoder, GeocodeResult } from "./types";

type KakaoAddressDoc = {
  address_name: string;
  x: string; // lng
  y: string; // lat
  road_address?: { address_name: string; region_3depth_name?: string } | null;
  address?: { address_name: string; region_3depth_name?: string } | null;
};

/**
 * Kakao Local API 주소 검색 어댑터 (docs/domain/geo/overview.md)
 * 관리자 서버 액션에서만 호출. 결과 좌표는 DB에 저장한다.
 */
export const kakaoGeocoder: Geocoder = {
  async geocode(query: string): Promise<GeocodeResult[]> {
    const key = process.env.KAKAO_REST_API_KEY;
    if (!key) throw new Error("KAKAO_REST_API_KEY 가 설정되지 않았어요");

    const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
    url.searchParams.set("query", query);
    url.searchParams.set("size", "5");

    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`카카오 주소 검색 실패 (${res.status})`);

    const json = (await res.json()) as { documents: KakaoAddressDoc[] };
    return json.documents.map((d) => ({
      roadAddress: d.road_address?.address_name ?? d.address_name,
      jibunAddress: d.address?.address_name,
      dong: d.road_address?.region_3depth_name || d.address?.region_3depth_name || undefined,
      location: { lng: Number(d.x), lat: Number(d.y) },
    }));
  },
};
