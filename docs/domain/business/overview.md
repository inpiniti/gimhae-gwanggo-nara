# business — 도메인 개요

## 정의

**업체(Business)** 는 광고나라 자신의 정보다. 상호, 연락처, 주소, 소개, 영업시간, 취급 품목, 소셜/메신저 링크. 레이아웃 헤더·푸터, `/about`, JSON-LD `LocalBusiness`, OG 기본 이미지, 전화 플로팅 버튼이 소비한다.

## 분류

**지원 도메인(Supporting)**. 변경 빈도가 매우 낮아 **DB 없이 코드 상수 + 환경변수**로 관리한다. 사장님이 직접 바꿀 일이 생기면 v2에서 `site_settings` 테이블로 승격.

## 유비쿼터스 언어

| 용어 | 정의 |
|---|---|
| Business | 광고나라 업체 정보 값 객체 (싱글턴) |
| Contact | 전화(대표/휴대폰), 카카오톡 채널, 이메일 |
| Hours | 영업시간 (요일별) |
| Services | 취급 품목 — category 도메인의 활성 목록과 동일하게 유지 |

## 모델 (`lib/domain/business/business.ts`)

```ts
export const business = {
  name: '김해 광고나라',
  legalName: '광고나라',
  phone: '055-338-5204',
  mobile: '010-9399-5204',
  address: {
    full: '경상남도 김해시 활천로36번길 20-1',
    region: '경상남도',
    locality: '김해시',
    street: '활천로36번길 20-1',
    postalCode: '',          // 확인 필요
  },
  location: { lng: 0, lat: 0 },   // geo로 1회 변환 후 하드코딩
  hours: [
    { days: '월–금', open: '09:00', close: '18:00' },
    { days: '토', open: '09:00', close: '13:00' },
  ],                                // 확인 필요
  kakaoChannelUrl: '',              // 확인 필요
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  description: '김해 간판·현수막·시트지(썬팅)·LED·실사출력·명함·전단지·스티커 전문',
} as const
```

## 관계
- → 레이아웃/푸터/`/about`: 표시.
- → SEO: `LocalBusiness` JSON-LD, 기본 `title`/`description`, OG 기본 이미지.
- → geo: 초기 위치를 업체 주소 기준으로 잡을 때 참조 (기본은 김해시청).
- → category: `Services` 목록은 category 활성 목록을 런타임에 조회 (중복 관리 안 함).

## 확인 필요 (05-open-questions와 동기화)
- 주소 정확성, 우편번호
- 영업시간
- 카카오톡 채널 유무
- 사업자등록번호 표기 여부 (푸터 관행)
