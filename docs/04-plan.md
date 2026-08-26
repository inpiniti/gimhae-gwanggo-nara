# 04. 구현 플랜

전체 6단계. 각 단계는 배포 가능한 상태로 끝낸다. 1인 작업 기준 예상 기간 병기.

## Phase 0 — 준비 (0.5일)
- [ ] 도메인 결정 (기존 사이트 도메인 살릴 수 있는지 확인 → 아니면 신규 `.kr`/`.com`)
- [ ] Supabase 프로젝트 생성, Vercel 프로젝트 연결
- [ ] Kakao Developers 앱 생성 (주소 검색용 REST 키)
- [x] 지도 타일: CARTO 확정 / 지오코더: Kakao 확정 (2026-08-26)
- [ ] 05-open-questions 항목을 사장님과 30분 통화로 일괄 확정
- [ ] 사장님에게 초기 데이터 요청: 최근 작업 10~20건 (상호명, 주소, 사진, 작업 종류)
- [ ] 업체 로고/컬러 확보 (없으면 심플한 텍스트 로고로 시작)

## Phase 1 — 스캐폴딩 (1일)
- [x] `pnpm create next-app` (Next 16.3, TS, Tailwind v4, App Router) — 2026-08-26
- [x] `shadcn init -d` (v4 base-nova) → button, card, table, dialog, sheet, badge, input, textarea, label, tabs, toggle-group, skeleton, separator, tooltip, dropdown-menu, checkbox, select, sonner, scroll-area
- [x] `shadcn add @mapcn/map` + MapLibre 워커 `public/` 자체 호스팅
- [x] 토스 토큰(`globals.css`), Pretendard(`next/font/local`), 루트 레이아웃
- [x] Supabase 클라이언트 3종 (`lib/supabase/{client,server,admin}.ts`), `proxy.ts` 세션 갱신 + `/admin` 가드, `.env.example`
- [x] `supabase/migrations/0001_init.sql` (admin→category→work→comment, RLS, Storage 정책), `supabase/seed.sql` 5건
- [x] `types/supabase.ts` 수기 작성 — **프로젝트 링크 후 `supabase gen types` 로 재생성 필요**
- [x] `lib/domain/{business,geo}` 초기 코드, `next.config.ts` (remotePatterns, 프리뷰 noindex)
- [ ] Supabase 원격에 마이그레이션 적용 (`supabase link` 는 로그인 필요 → 사용자 실행) 후 시드
- [ ] Vercel 연결 및 첫 배포 확인
- [ ] CI(lint·tsc·vitest) 워크플로 (09-testing)

## Phase 2 — 메인 화면: 지도 + 테이블 + 상세 패널 (2~3일)
- [x] 레이아웃: `app/(home)/layout.tsx` 좌(지도/표) + 우(`@panel`) 2단, 모바일은 바텀시트(`DetailPanel`)
- [x] `WorkMap`: dynamic import, 작업물별 `MapMarker`(카테고리 색), 클릭 → 라우팅. **클러스터링은 보류** — mapcn `MapClusterLayer`가 단일 색만 지원해 카테고리 색 구분과 양립 불가. 마커 200건 넘으면 재검토
- [x] `WorkTable`: shadcn Table + 클라이언트 정렬. TanStack/ReUI 는 100건 넘을 때 교체
- [x] 뷰 토글 + 카테고리/검색 상태를 URL 파라미터로 (`nuqs`: `view`, `cat`, `q`)
- [x] `@panel` 병렬 라우트 + `(.)works/[slug]` 인터셉트 → `WorkDetail` 패널, 닫기 = 뒤로가기
- [x] `WorkDetail`: 상호·전화·주소·태그·요약·설명·갤러리(라이트박스)·댓글 목록(읽기)·액션(전화/주소복사/카카오맵/네이버지도/링크복사)
- [x] 선택 시 지도 `flyTo` + 강조 마커, 표 ↔ 지도 hover 양방향 하이라이트
- [x] `/works/[slug]` 전체 페이지 + `generateMetadata`(Phase 3 선행)
- [x] 공개 읽기는 쿠키 없는 `createPublicClient` → `/` ISR 60s 유지
- [ ] 한글 지명 라벨 품질 확인 → 타일 소스 결정 (05-open-questions #3)
- [ ] 실기기 모바일 확인 (바텀시트, 지도 제스처)

## Phase 3 — SEO 상세 페이지 (1일)
- [x] `/works/[slug]/page.tsx` 전체 페이지 (SSG + ISR)
- [x] `generateMetadata`, JSON-LD(`LocalBusiness` 전역 + `CreativeWork`/`ImageObject`/`BreadcrumbList` 상세), `opengraph-image.tsx`(기본 + 작업물별, Pretendard OTF 임베드, 커버 사진 배경)
- [x] `sitemap.ts`, `robots.ts`
- [x] 메인의 목록이 서버 HTML로 링크 노출되는지 확인 (sr-only 링크 목록)
- [ ] Lighthouse 점검 (배포 후)

## Phase 4 — 관리자 (2일)
- [x] Supabase Auth 로그인(`/admin/login`), `requireAdmin()` 가드, `/admin/forbidden`, `scripts/create-admin.mjs`
- [x] 작업물 목록/등록/수정/삭제 (`saveWork`·`setWorkPublished`·`deleteWork`, zod `WorkInput`). react-hook-form 은 쓰지 않고 useState 폼 — 필드 수가 적어 충분
- [x] 주소 검색(Kakao `geocodeAddress`) → 주소·동·좌표 자동, 지도 핀 드래그 보정, 김해 밖 경고
- [x] 다중 이미지 업로드 (browser-image-compression → 1600px/400px WebP, EXIF 제거) → Storage 직접 업로드, 순서/대표/alt
- [x] slug 자동 생성 + 수정 가능 + 서버 중복 처리(`-2` 접미)
- [x] 저장/공개 토글/삭제 시 `revalidateWork()` 로 공개 페이지 즉시 갱신 — 브라우저 E2E 확인 (등록 → 메인 노출 → 사진 업로드 → 삭제)
- [x] 카테고리 관리(추가/색상/활성), 댓글 관리(숨김/삭제/사장님 답글) — Phase 5 관리자 부분 선행
- [ ] 모바일에서 사진 찍어 바로 등록되는지 실기기 테스트
- [ ] 삭제 확인을 `window.confirm` 대신 Dialog 로 (토스 패턴)

## Phase 5 — 댓글 (1일)
- [x] `CommentList` / `CommentForm` (닉네임+비밀번호+내용, honeypot)
- [x] 서버 액션 `createComment`: zod, honeypot(조용히 성공), `comment_rate_ok` RPC, "광고나라" 닉네임 사칭 방지, bcrypt, IP 해시, revalidate
- [x] `deleteOwnComment` 비밀번호 검증 삭제 (Dialog, 보조 버튼 "닫기")
- [x] 관리자 댓글 관리 (숨김/삭제/답글) — Phase 4 에서 선행
- [x] IP 해시 30일 후 삭제 — `/api/keepalive` cron 이 함께 처리
- [ ] 스팸 발생 시 Turnstile 추가 (옵션, env 플래그만 예약)

## Phase 6 — 마무리 & 오픈 (1일)
- [x] `/about` 페이지 (연락처, 영업시간, 오시는 길, 취급 품목, 카카오톡 채널 버튼은 URL 설정 시 표시)
- [x] 헤더 전화 CTA(모바일은 "전화하기" 버튼) — 별도 플로팅 버튼은 헤더 CTA 로 대체
- [x] `/privacy` 페이지 (07-policy 1절), 푸터(소개/개인정보/관리자 링크, 저작권)
- [x] `/api/keepalive` + `vercel.json` cron (Supabase 일시정지 방지 + IP 해시 정리). Vercel 에 `CRON_SECRET` 설정 권장
- [x] 사장님용 사용 설명서 `docs/11-admin-guide.md`
- [ ] 실데이터 10~20건 입력 (사장님과 함께)
- [ ] **배포(사용자 직접)**: Vercel 연결, env(`NEXT_PUBLIC_SITE_URL` 실제 도메인, `COMMENT_IP_SALT`, `CRON_SECRET`), 도메인 연결
- [ ] 배포 후: Search Console·네이버 서치어드바이저 sitemap 제출, Google Business Profile · 네이버 스마트플레이스 · 카카오맵 등록 (03-seo 8절)
- [ ] `business.ts` 확인 필요 항목 채우기 (우편번호, 영업시간, 카카오채널, 사업자번호)

## 이후 (v2 후보)
- 네이버 지도/카카오맵 "길찾기" 딥링크
- 카테고리별 랜딩 페이지 (`/category/간판`) — 롱테일 SEO
- 고객 후기 별점
- 견적 문의 폼
- slug 변경 리다이렉트 이력
- 인스타그램 연동 (사진 자동 크로스 포스팅)

## 마일스톤 요약

| 마일스톤 | 내용 | 누적 |
|---|---|---|
| M1 | 시드 데이터로 지도·테이블·패널 동작 (Phase 0~2) | ~4일 |
| M2 | 검색 노출 가능한 상세 페이지 (Phase 3) | ~5일 |
| M3 | 사장님이 직접 등록 가능 (Phase 4) | ~7일 |
| M4 | 댓글 + 오픈 (Phase 5~6) | ~9일 |
