# geo — 도메인 개요

## 정의

**지리(Geo)** 는 주소 ↔ 좌표 변환, 지도 표시 기본값, 지도 타일/스타일, 외부 지도 앱 딥링크를 담당한다. work 도메인은 `Location` 값 객체와 `Geocoder` 포트만 알고, Kakao/MapLibre 같은 구현은 이 도메인 안에 감춘다.

## 분류

**일반 도메인(Generic)**. 외부 API(Kakao Local, CARTO 타일)의 어댑터.

## 유비쿼터스 언어

| 용어 | 정의 |
|---|---|
| Location | `{ lng: number, lat: number }` 값 객체. 순서는 **[lng, lat]** (MapLibre/GeoJSON 관례) |
| Geocoder | 포트. `geocode(address) → { location, roadAddress, dong }` |
| Viewport | 지도 초기 상태 `{ center: Location, zoom }` |
| Dong | 행정동/법정동 이름 (예: "삼안동"). 테이블 표시·필터용 |
| Tile Style | MapLibre 스타일 URL. 기본 CARTO |
| Deep Link | 카카오맵/네이버지도 앱·웹으로 여는 URL |

## 모델

```ts
// lib/domain/geo/types.ts
export type Location = { lng: number; lat: number }

export interface Geocoder {
  geocode(query: string): Promise<GeocodeResult[]>
}
export type GeocodeResult = {
  roadAddress: string      // 도로명
  jibunAddress?: string    // 지번
  dong?: string            // 법정동
  location: Location
}

export const GIMHAE_DEFAULT_VIEWPORT = {
  center: { lng: 128.8894, lat: 35.2285 },   // 김해시청
  zoom: 12,
}
export const GIMHAE_BOUNDS = {               // 경고용 대략 범위
  minLng: 128.70, maxLng: 129.05, minLat: 35.10, maxLat: 35.40,
}
```

## 구현

| 포트 | 어댑터 | 비고 |
|---|---|---|
| `Geocoder` | `KakaoGeocoder` (Kakao Local REST `/v2/local/search/address.json`) | 서버 액션에서만 호출, REST 키는 서버 env |
| 지도 렌더 | mapcn (`components/ui/map.tsx`, MapLibre) | 클라이언트 전용 |
| 타일 | CARTO 기본 → 한글 라벨 미흡 시 교체 | `NEXT_PUBLIC_MAP_STYLE_URL` env로 스타일 URL 주입 |
| 딥링크 | `kakaoMapUrl(name, loc)`, `naverMapUrl(name, loc)` | 순수 함수 |

## 유스케이스
- `geocode(address)` — 관리자 Work 폼에서 주소 입력 후 후보 목록 표시 → 선택.
- `isInGimhae(location)` — 범위 밖이면 관리자에게 경고 (저장은 허용).
- `toGeoJSON(works[])` — `MapClusterLayer` 입력 변환.
- `mapDeepLinks(work)` — 상세 화면 "길찾기" 버튼.

## 관계
- work → geo: `Geocoder`, `Location`, `toGeoJSON`.
- business → geo: 업체 위치 1회 변환.

## 정책
- 공개 페이지에서는 **외부 지오코딩 호출 없음**. 좌표는 항상 DB에 저장된 값 사용.
- Kakao 키는 서버 전용. 클라이언트에는 노출하지 않음.
- MapLibre 워커는 `public/maplibre-gl-worker.mjs`로 자체 호스팅 (unpkg 의존 제거).
- 타일 제공자 변경은 env 하나로 가능해야 함.
