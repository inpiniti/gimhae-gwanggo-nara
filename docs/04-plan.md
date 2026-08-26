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
- [ ] `pnpm create next-app` (TS, Tailwind, App Router)
- [ ] `pnpm dlx shadcn@latest init` → button, card, table, dialog, sheet, badge, input, form, tabs, toggle-group 등
- [ ] `pnpm dlx shadcn@latest add @mapcn/map`
- [ ] Supabase 클라이언트 (`@supabase/ssr`), env 세팅
- [ ] 마이그레이션 0001: 02-architecture.md의 스키마 + RLS + Storage 버킷
- [ ] 시드 데이터 5건 (임시 좌표) 넣고 배포 확인
- [ ] `.env.example`, CI(lint·tsc·vitest), 프리뷰 `noindex` 헤더 (06-operations, 09-testing)

## Phase 2 — 메인 화면: 지도 + 테이블 + 상세 패널 (2~3일)
- [ ] 레이아웃: 좌(지도/테이블) + 우(패널) 2단, 모바일은 1단 + Sheet
- [ ] `WorkMap`: dynamic import, `MapClusterLayer`, 마커 클릭 → 라우팅
- [ ] `WorkTable`: shadcn Data Table, 정렬/필터/검색, 행 클릭 → 라우팅
- [ ] 뷰 토글 + 필터 상태를 URL 파라미터로 (`nuqs`)
- [ ] `@panel` 병렬 라우트 + `(.)works/[slug]` 인터셉트 → `WorkDetail` 패널 렌더
- [ ] `WorkDetail`: 상호·전화·주소·태그·설명·갤러리(라이트박스)
- [ ] 선택 시 지도 `flyTo` + 강조 마커
- [ ] 한글 지명 라벨 품질 확인 → 타일 소스 결정 (05-open-questions 참고)

## Phase 3 — SEO 상세 페이지 (1일)
- [ ] `/works/[slug]/page.tsx` 전체 페이지 (SSG + ISR)
- [ ] `generateMetadata`, JSON-LD, `opengraph-image.tsx`
- [ ] `sitemap.ts`, `robots.ts`
- [ ] 메인의 목록이 서버 HTML로 링크 노출되는지 확인
- [ ] Lighthouse 점검

## Phase 4 — 관리자 (2일)
- [ ] Supabase Auth 로그인, `admins` 테이블 + 가드
- [ ] 작업물 목록/등록/수정/삭제 폼 (react-hook-form + zod)
- [ ] 주소 검색(Kakao) → 좌표 자동 입력, 지도 핀 드래그 보정
- [ ] 다중 이미지 업로드 (브라우저 압축 → Storage), 정렬/커버 지정/alt 입력
- [ ] 저장 시 `revalidatePath`로 공개 페이지 즉시 갱신
- [ ] 모바일에서 사진 찍어 바로 등록되는지 실기기 테스트

## Phase 5 — 댓글 (1일)
- [ ] `CommentList` / `CommentForm` (닉네임+비밀번호+내용)
- [ ] 서버 액션: 검증, 허니팟, rate limit, bcrypt, insert, revalidate
- [ ] 비밀번호로 삭제
- [ ] 관리자 댓글 관리 (숨김/삭제/답글)
- [ ] 스팸 발생 시 Turnstile 추가 (옵션)

## Phase 6 — 마무리 & 오픈 (1일)
- [ ] `/about` 페이지 (연락처, 오시는 길, 취급 품목)
- [ ] 모바일 전화 플로팅 버튼, 카카오톡 채널 링크
- [ ] 실데이터 10~20건 입력 (사장님과 함께)
- [ ] 도메인 연결, Search Console·네이버 서치어드바이저 등록
- [ ] `/privacy` 페이지 (07-policy 1절)
- [ ] Google Business Profile · 네이버 스마트플레이스 · 카카오맵 등록 (03-seo 8절)
- [ ] 사장님용 1페이지 사용 설명서 (`docs/11-admin-guide.md`)

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
