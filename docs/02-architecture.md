# 02. 아키텍처

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router) + TypeScript** | SSG/ISR로 SEO, Intercepting Routes로 "패널 ↔ 전체 페이지" 구현 용이 |
| UI | **shadcn/ui + Tailwind CSS v4** | 사용자 지정. mapcn/ReUI 모두 shadcn 레지스트리 기반이라 자연스럽게 결합 |
| 지도 | **mapcn** (`@mapcn/map`, MapLibre GL) | 사용자 지정. API 키 불필요, CARTO 무료 타일, 라이트/다크 자동 |
| 테이블 | **shadcn Data Table (TanStack Table)** 기본, 필요 시 **ReUI Data Grid** | 처음엔 shadcn 공식 Data Table로 충분. 가상화/고급 필터 필요해지면 ReUI로 교체 |
| DB / Auth / Storage | **Supabase** (Postgres + Auth + Storage) | 무료 티어, RLS, 이미지 스토리지 한 번에 해결 |
| 배포 | **Vercel** | Next.js 최적, ISR 지원, 무료 |
| 주소→좌표 | **Kakao Local API** (주소 검색) — 관리자 화면에서만 호출 | 한국 주소 정확도. 결과 좌표를 DB에 저장하므로 공개 페이지에선 호출 없음 |
| 이미지 처리 | 업로드 시 브라우저에서 리사이즈(`browser-image-compression`) → Supabase Storage → `next/image` | Storage 용량 절약 |
| 폼/검증 | react-hook-form + zod | shadcn Form 표준 조합 |
| 상태 | URL 검색 파라미터(`nuqs`) | 필터/뷰/선택 상태를 URL에 두면 공유·뒤로가기·SEO 모두 유리 |

### mapcn 설치/사용 요약 (조사 결과)
- 설치: `pnpm dlx shadcn@latest add @mapcn/map` → `components/ui/map.tsx` 생성, `maplibre-gl` 자동 설치
- 주요 컴포넌트: `Map`, `MapMarker`(+`MarkerContent`, `MarkerLabel`, `MarkerPopup`), `MapPopup`, `MapControls`, `MapClusterLayer`, `MapGeoJSON`, `MapRoute`, `useMap`
- 기본 타일: CARTO 무료 (라이트/다크 자동 전환), API 키 불필요
- Web Worker: 기본 unpkg 로드 → 프로덕션에선 `public/`에 복사 후 `MapLibreGL.setWorkerUrl("/maplibre-gl-worker.mjs")` 권장

## 2. 폴더 구조 (초안)

```
gimhae-gwanggo-nara/
├─ docs/
├─ app/
│  ├─ layout.tsx                 # 루트 레이아웃, 폰트, 메타 기본값
│  ├─ page.tsx                   # 메인: 지도/테이블 + 상세 패널 슬롯
│  ├─ @panel/                    # 병렬 라우트 — 우측 상세 패널
│  │  ├─ default.tsx             # 선택 없음 → 업체 소개 카드
│  │  └─ (.)works/[slug]/page.tsx  # Intercepting: 메인에서 클릭 시 패널로
│  ├─ works/[slug]/
│  │  ├─ page.tsx                # 전체 상세 페이지 (SSG, SEO)
│  │  └─ opengraph-image.tsx     # OG 이미지 자동 생성
│  ├─ about/page.tsx
│  ├─ admin/
│  │  ├─ layout.tsx              # 인증 가드
│  │  ├─ page.tsx                # 작업물 목록
│  │  ├─ works/new/page.tsx
│  │  ├─ works/[id]/edit/page.tsx
│  │  └─ comments/page.tsx
│  ├─ sitemap.ts
│  └─ robots.ts
├─ components/
│  ├─ ui/                        # shadcn + mapcn(map.tsx) 생성 컴포넌트
│  ├─ works/
│  │  ├─ work-map.tsx            # 'use client', dynamic import, 마커/클러스터
│  │  ├─ work-table.tsx          # Data Table
│  │  ├─ work-detail.tsx         # 상세 (패널/전체 공용)
│  │  ├─ work-gallery.tsx
│  │  └─ view-toggle.tsx
│  ├─ comments/
│  │  ├─ comment-list.tsx
│  │  └─ comment-form.tsx
│  └─ admin/
├─ lib/
│  ├─ supabase/{client,server,admin}.ts
│  ├─ domain/                    # DDD — docs/domain/* 과 1:1 (자세한 규칙은 10-conventions.md)
│  │  ├─ work/      {types,queries,actions,slug,policies}.ts
│  │  ├─ category/  {types,queries,actions}.ts
│  │  ├─ comment/   {types,queries,actions,password,rate-limit}.ts
│  │  ├─ admin/     {guard,actions}.ts
│  │  ├─ business/  business.ts
│  │  └─ geo/       {types,kakao,geojson,deeplink,viewport}.ts
│  └─ seo/          {metadata,jsonld}.ts
├─ supabase/
│  └─ migrations/
├─ public/
└─ types/
```

## 3. 데이터 모델

> 스키마의 단일 출처는 `docs/domain/*/db.md`이다. 아래는 요약본.

```sql
-- 작업 카테고리 (enum 대신 테이블: 관리자 UI에서 추가 가능)
create table categories (
  code        text primary key,        -- 'sign', 'banner', 'sheet', ...
  name        text not null,           -- '간판', '현수막', '시트지(썬팅)'
  color       text,                    -- 마커 색상
  sort_order  int default 0
);

-- 작업물 = 의뢰한 가게 1건
create table works (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,      -- SEO URL (한글 허용)
  shop_name     text not null,             -- 상호명
  phone         text,                      -- 가게 전화번호 (공개 원치 않으면 null)
  address       text not null,             -- 도로명 주소
  address_dong  text,                      -- '삼안동' 등 (테이블 표시/필터용)
  lng           double precision not null,
  lat           double precision not null,
  summary       text,                      -- 한 줄 요약 (meta description 겸용)
  description   text,                      -- 상세 설명 (markdown)
  worked_at     date,                      -- 작업일
  is_published  boolean default true,
  consent       boolean default false,     -- 고객 노출 동의
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 작업물 ↔ 카테고리 (한 가게에 간판+썬팅 동시 작업 가능)
create table work_categories (
  work_id       uuid references works(id) on delete cascade,
  category_code text references categories(code),
  primary key (work_id, category_code)
);

-- 사진
create table work_images (
  id          uuid primary key default gen_random_uuid(),
  work_id     uuid references works(id) on delete cascade,
  path        text not null,               -- Supabase Storage 경로
  alt         text,                        -- SEO용 대체 텍스트
  width       int,
  height      int,
  sort_order  int default 0,
  is_cover    boolean default false
);

-- 댓글
create table comments (
  id            uuid primary key default gen_random_uuid(),
  work_id       uuid references works(id) on delete cascade,
  nickname      text not null,
  password_hash text not null,             -- bcrypt
  body          text not null,
  is_owner      boolean default false,     -- 광고나라 답글
  is_hidden     boolean default false,
  ip_hash       text,                      -- rate limit용
  created_at    timestamptz default now()
);

-- 관리자
create table admins (
  user_id uuid primary key references auth.users(id)
);

create index on works (is_published, worked_at desc);
create index on comments (work_id, created_at desc);
```

### RLS 정책 요약
- `works`, `work_images`, `work_categories`, `categories`: anon **select** (단 `is_published = true`).
- `comments`: anon select (`is_hidden = false`), insert/delete는 **서버 액션(service role)** 경유 — 비밀번호 검증과 rate limit을 서버에서 처리.
- 관리자 쓰기: `auth.uid()`가 `admins` 테이블에 있는 경우만.

### Storage
- 버킷 `works` (public). 경로: `works/{work_id}/{uuid}.webp`
- 업로드 전 브라우저에서 긴 변 1600px, WebP, 품질 80으로 압축.

## 4. 라우팅 & 상태

| URL | 렌더링 | 설명 |
|---|---|---|
| `/` | SSR/ISR (60s) | 목록 데이터 서버에서 fetch → 지도/테이블에 props 전달 |
| `/?view=table&cat=sign&q=식당` | 〃 | 뷰/필터/검색은 URL 파라미터 (`nuqs`) |
| `/works/[slug]` (메인에서 클릭) | 클라이언트 전환, 인터셉트 → 우측 패널 | 뒤로가기로 패널 닫힘 |
| `/works/[slug]` (직접 진입) | **SSG + ISR** | 전체 페이지, 완전한 HTML → SEO |
| `/admin/**` | 동적, 인증 필요 | `noindex` |

- 지도 컴포넌트는 `next/dynamic(() => import(...), { ssr: false })`로 로드 (MapLibre는 `window` 필요).
- 목록 데이터는 서버 컴포넌트에서 한 번 fetch 후 지도·테이블이 공유. 수백 건 수준까지는 전체를 한 번에 내려도 문제 없음 (좌표+요약만, 이미지는 썸네일 URL 1개).
- 상세 패널 데이터는 인터셉트 라우트의 서버 컴포넌트에서 fetch → 사진·댓글 포함.

## 5. 댓글 작성 흐름

```
[CommentForm] --server action--> validate(zod)
                                  → honeypot 검사
                                  → ip_hash 기준 1분 3건 제한 (DB 카운트, 추후 Upstash Redis)
                                  → bcrypt(password)
                                  → insert (service role)
                                  → revalidatePath('/works/[slug]')
```

## 6. 지도 세부

- `Map` 초기 뷰: 김해시청 `[128.8894, 35.2285]`, zoom 12.
- `MapClusterLayer`에 GeoJSON FeatureCollection 전달, 클러스터 클릭 시 확대, 개별 포인트 클릭 시 `router.push('/works/[slug]')`.
- 선택된 작업물은 별도 `MapMarker`로 강조 + `flyTo`.
- 타일: 기본 CARTO(라이트/다크 자동). **한글 지명 라벨 품질**이 부족하면 대안: OSM 한국어 스타일, VWorld(국토부, 무료 키), MapTiler 무료 티어. 결정은 프로토타입 후.
- MapLibre 워커는 기본 unpkg → 안정성 위해 `public/`에 복사해 `setWorkerUrl` 사용 (mapcn 문서 권장).
