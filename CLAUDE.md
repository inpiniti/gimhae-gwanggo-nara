# 김해 광고나라 홈페이지

지도(mapcn/MapLibre) ↔ 테이블로 시공 사례를 보여주고, 클릭하면 우측 패널에 상세가 뜨는 포트폴리오 사이트. Next.js App Router + shadcn/ui + Supabase.

## 문서 먼저
- 전체 개요·플랜: `docs/README.md`
- **도메인 작업 전 반드시** `docs/domain/{domain}/overview.md` → `prd.md` → `db.md` 순으로 읽는다.
- 코드 규칙: `docs/10-conventions.md` (DDD 폴더, 서버 액션 6단계, 네이밍)
- 스키마 단일 출처는 `docs/domain/*/db.md`. 마이그레이션보다 문서를 먼저 고친다.

## 불변 규칙
- 쓰기는 서버 액션만. `SUPABASE_SERVICE_ROLE_KEY`, `KAKAO_REST_API_KEY`는 클라이언트 번들에 절대 포함 금지.
- 관리자 액션 첫 줄은 `requireAdmin()`. 공개 액션(댓글)은 honeypot + rate limit.
- `is_published = true` 는 `consent = true` 를 전제 (DB CHECK).
- 지도·라이트박스는 `next/dynamic({ ssr: false })`.
- 공개 페이지에서 외부 지오코딩 호출 금지 — 좌표는 DB 값만.
- UI 문구는 해요체, `lib/i18n/ko.ts` 에 모은다.
- **UI 작업 전 `toss-design` 스킬을 적용한다.** 포인트 컬러는 토스 블루 `#3182f6` 하나. 토큰은 `docs/08-design.md`.

## 도메인
`work`(핵심) · `category` · `comment` · `admin` · `business` · `geo` — `lib/domain/{domain}/` 과 `docs/domain/{domain}/` 1:1.
