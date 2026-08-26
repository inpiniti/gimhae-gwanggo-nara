# 06. 운영 / 배포 / 보안

## 1. 환경 변수

| 변수 | 범위 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | canonical, sitemap, OG 절대 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | 공개 읽기 (RLS 적용) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | 댓글 쓰기, 관리자 액션, Storage 정리 |
| `KAKAO_REST_API_KEY` | **server only** | 주소 검색 |
| `NEXT_PUBLIC_MAP_STYLE_URL` | public | 타일 스타일 (미설정 시 mapcn 기본 CARTO) |
| `COMMENT_IP_SALT` | server only | IP 해시 salt |
| `COMMENT_TURNSTILE` / `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | 선택 | 스팸 방지 |
| `NEXT_PUBLIC_ANALYTICS` | public | 애널리틱스 on/off |

- `.env.example`을 저장소에 커밋, 실제 값은 Vercel 환경변수에만.
- `NEXT_PUBLIC_` 접두사 없는 키는 절대 클라이언트 컴포넌트에서 import 금지 (`server-only` 패키지로 강제).

## 2. 환경 구성

| 환경 | Supabase | Vercel | 용도 |
|---|---|---|---|
| local | `supabase start` (Docker) | `next dev` | 개발. 마이그레이션·시드 자동 |
| preview | prod 프로젝트 공유 (읽기 위주) 또는 별도 브랜치 DB | PR 프리뷰 | 검수. `robots noindex` 헤더 강제 |
| production | prod 프로젝트 | main 브랜치 | 실서비스 |

- 프리뷰 URL이 구글에 색인되지 않도록 `VERCEL_ENV !== 'production'` 이면 전역 `X-Robots-Tag: noindex`.

## 3. 배포 절차

1. PR → Vercel 프리뷰 자동 배포 → 프리뷰에서 확인.
2. 마이그레이션이 있으면 **머지 전에** `supabase db push` (prod) — 스키마가 코드보다 먼저.
3. main 머지 → 자동 프로덕션 배포.
4. 배포 후 체크: `/`, `/works/{아무 slug}`, `/sitemap.xml`, `/admin/login` 200 확인.

## 4. 무료 한도와 용량 계획

| 서비스 | 무료 한도 | 예상 사용 (작업물 300건, 사진 1,500장 기준) |
|---|---|---|
| Supabase DB | 500 MB | < 20 MB |
| Supabase Storage | 1 GB | 1,500장 × ~250 KB(WebP 1600px) ≈ 375 MB |
| Supabase egress | 5 GB/월 | 이미지는 Vercel `next/image` 캐시가 흡수 → 실제 egress 낮음 |
| Vercel bandwidth | 100 GB/월 | 충분 |
| Vercel image optimization | 1,000 원본/월 (Hobby) | **주의**: 사진 수가 늘면 초과 가능 → `next/image` `loader`를 Supabase Image Transformation으로 교체하거나 업로드 시 썸네일(400px)도 함께 생성해 목록에서 사용 |
| Kakao Local | 일 30만 회 | 관리자만 호출, 무시 가능 |

- **Supabase Free는 7일 비활성 시 일시정지**된다. 방문이 적은 사이트에선 실제 위험 → Vercel Cron으로 1일 1회 헬스 쿼리(`select 1`) 실행하거나 Pro($25/월) 전환.

## 5. 백업 / 복구

- Supabase 자동 백업은 Pro부터. Free 티어에서는 **주 1회 `pg_dump`** 를 GitHub Actions 스케줄로 실행해 private 저장소/Drive에 보관.
- Storage 사진: 월 1회 `supabase storage` CLI로 로컬 동기화 (사장님 PC 또는 외장하드).
- 복구 시나리오: 새 Supabase 프로젝트 → 마이그레이션 적용 → dump 복원 → Storage 업로드 → env 교체.

## 6. 모니터링

| 항목 | 도구 | 비용 |
|---|---|---|
| 방문/페이지 | Vercel Web Analytics | 무료 |
| 전화 클릭, 길찾기 클릭, 공유 클릭 | 커스텀 이벤트 (`track('call_click', { slug })`) | 무료 |
| 검색 유입/색인 상태 | Google Search Console, 네이버 서치어드바이저 | 무료 |
| 런타임 에러 | Sentry Free (5k events/월) — 선택 | 무료 |
| 가동 상태 | UptimeRobot 5분 핑 (Supabase 일시정지 방지 겸용) | 무료 |

## 7. 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 서버 액션/Route Handler에서만. 번들에 포함되는지 `next build` 후 grep으로 확인.
- [ ] 모든 테이블 RLS 활성화. anon 키로 `insert` 시도 → 거부되는지 테스트.
- [ ] 서버 액션 진입부에 `requireAdmin()` (관리자) 또는 zod 검증(댓글). 클라이언트 값 신뢰 금지.
- [ ] 업로드 검증: MIME `image/*`만, 개당 10 MB 이하, 서버에서 확장자 재검사. Storage 정책으로 관리자 외 업로드 차단.
- [ ] **EXIF 제거**: 브라우저 압축 단계에서 EXIF(특히 GPS)를 제거하고 회전(orientation)은 적용 후 저장.
- [ ] CSP 헤더: `img-src 'self' {supabase} data: blob:`, `connect-src` 에 타일 도메인·Supabase, `worker-src 'self' blob:` (MapLibre).
- [ ] 관리자 로그인 실패 rate limit (Supabase 기본) + `/admin` `noindex`.
- [ ] 댓글 본문 렌더 시 HTML escape. markdown은 관리자 설명(`description`)에만 허용하고 `rehype-sanitize` 적용.
- [ ] 의존성 취약점: `pnpm audit` 를 CI에 포함.

## 8. 장애 대응 (Runbook)

| 증상 | 확인 | 조치 |
|---|---|---|
| 사이트 전체 500 | Vercel 로그, Supabase 상태 | Supabase 일시정지면 대시보드에서 재개 |
| 지도만 안 뜸 | 콘솔 — 워커/타일 404 | 워커 자체 호스팅 경로, 타일 URL/약관 변경 확인 → env 교체 |
| 사진 안 보임 | Storage 정책, 이미지 최적화 한도 | 한도 초과면 loader 교체 (4절) |
| 댓글 스팸 폭주 | `comments` 최근 100건 | `COMMENT_TURNSTILE=1` 활성화, 관리자에서 일괄 숨김 |
| 새 글이 구글에 안 뜸 | Search Console 색인 상태 | URL 검사 → 색인 요청, sitemap 재제출 |
