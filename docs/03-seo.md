# 03. SEO 전략

목표: **"김해 OO가게 간판"**, **"김해 현수막"**, **"김해 시트지 시공"** 같은 검색에서 작업물 상세 페이지와 메인이 노출된다.

## 1. 렌더링

- `/works/[slug]`는 `generateStaticParams`로 **빌드 시 정적 생성** + `revalidate = 3600`(ISR). 새 작업물 등록 시 관리자 액션에서 `revalidatePath`/`revalidateTag` 호출해 즉시 반영.
- 메인 `/`도 서버 렌더. 지도는 클라이언트 전용이지만, **테이블(목록)은 서버 HTML로도 출력**되도록 하여 크롤러가 모든 작업물 링크를 발견하게 한다. (지도 뷰가 기본이어도 접근성 숨김 목록으로 링크 제공)
- 관리자 라우트는 `robots: { index: false }`.

## 1-1. 게시 → 색인 흐름 (admin 등록 후 구글 노출까지)

```
admin이 작업물 저장 (is_published = true, RLS: is_admin() 만 허용)
  → DB insert
  → 서버 액션에서 revalidatePath('/works/[slug]'), revalidatePath('/'), revalidatePath('/sitemap.xml')
  → /works/[slug] 첫 요청 시 on-demand 정적 생성 (dynamicParams = true 유지 필수)
  → sitemap.xml 에 새 URL 포함 (lastModified = updated_at)
  → 메인 테이블의 서버 HTML 링크로도 크롤러가 발견
  → Google / 네이버가 크롤링 → 색인
```

- **색인 시점은 검색엔진이 결정**한다 (보통 며칠~몇 주). 빠르게 반영하려면 Search Console → URL 검사 → "색인 생성 요청"을 수동 실행. 관리자 화면에 해당 URL로 가는 바로가기 버튼을 둔다.
- Google Indexing API는 채용공고·라이브 이벤트 페이지 전용이라 사용하지 않는다.
- 비공개 전환/삭제 시: revalidate + sitemap 제외 + 페이지는 404(`notFound()`) 반환 → 구글이 자연스럽게 색인 해제.

## 2. URL / slug

- 형식: `/works/{상호명}-{동}-{카테고리}` 예) `/works/홍콩반점-삼안동-간판`
- **한글 slug 허용** (Next.js/Google 모두 문제 없음, 검색 의도와 일치). 관리자 화면에서 자동 생성 + 수정 가능, 중복 시 `-2` 접미.
- slug 변경 시 이전 slug → 301 리다이렉트 테이블 유지 (`work_slug_history`) — v2.

## 3. 메타데이터 (`generateMetadata`)

| 항목 | 값 |
|---|---|
| `title` | `{상호명} {카테고리} 시공 사례 \| 김해 광고나라` |
| `description` | `works.summary` (없으면 "{주소} {상호명}의 {카테고리} 작업. 김해 간판·현수막·시트지 전문 광고나라 055-338-5204") |
| `openGraph.images` | 커버 사진 (없으면 `opengraph-image.tsx`로 상호명+카테고리 자동 생성) |
| `alternates.canonical` | `https://{domain}/works/{slug}` |
| `keywords` | 김해, 카테고리명, 동 이름, 상호명 |

## 4. 구조화 데이터 (JSON-LD)

### 사이트 전체 (layout)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "김해 광고나라",
  "telephone": "+82-55-338-5204",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KR",
    "addressRegion": "경상남도",
    "addressLocality": "김해시",
    "streetAddress": "활천로36번길 20-1"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 0, "longitude": 0 },
  "url": "https://{domain}",
  "priceRange": "₩₩"
}
```

### 상세 페이지
- `ImageObject` 배열 (각 사진, `caption` = alt)
- `BreadcrumbList` (홈 > 카테고리 > 상호명)
- 선택: `CreativeWork` (headline, dateCreated=worked_at, creator=광고나라)
- 댓글은 `Comment` 스키마로 포함 가능 (v2).

## 5. sitemap / robots

- `app/sitemap.ts`: `/`, `/about`, 모든 공개 `/works/[slug]` (`lastModified = updated_at`).
- `app/robots.ts`: `/admin` disallow, sitemap 위치 명시.
- Google Search Console + **네이버 서치어드바이저** 등록 (국내 검색은 네이버 비중 큼).

## 6. 이미지 SEO

- 모든 사진 `alt` 필수 — 관리자 업로드 시 기본값 `{상호명} {카테고리} 사진 {n}` 자동 채우고 수정 가능.
- `next/image` + WebP, 상세는 원본 비율 유지, 목록은 썸네일.
- 파일명도 의미 있게 (`홍콩반점-간판-1.webp`) — Storage 경로에 반영.

## 7. 콘텐츠 팁 (사장님용)

- 설명에 **동네 이름 + 작업 종류 + 소재**를 자연스럽게 포함 (예: "삼안동 홍콩반점 채널간판 교체, 갈바 프레임 + LED 모듈").
- 작업일 기록 → 최신성 신호.
- 고객이 댓글로 후기 남기면 콘텐츠 자동 증가.

## 8. 로컬 SEO — 사이트 밖에서 해야 하는 것

"김해 간판" 같은 지역 검색은 사이트 자체보다 **지도/플레이스 등록**이 노출에 더 크게 작용한다. 오픈과 동시에 진행.

| 채널 | 할 일 | 효과 |
|---|---|---|
| **Google Business Profile** | 업체 등록, 카테고리 "간판 제작업체", 웹사이트 URL, 사진 10장+, 영업시간 | 구글 검색·지도 우측 패널 노출. 사이트 링크 유입 |
| **네이버 스마트플레이스** | 동일 등록 + 홈페이지 링크 | 네이버 검색·지도 노출 (국내 1위) |
| **카카오맵 매장관리** | 등록 + 링크 | 카카오맵/카카오톡 |
| 네이버 서치어드바이저 | sitemap 제출, 소유 확인 | 네이버 웹문서 색인 |
| Bing Webmaster | sitemap 제출 (5분) | 부수 효과 |

- 사이트의 `LocalBusiness` JSON-LD와 위 프로필의 **상호·주소·전화(NAP)가 글자 단위로 일치**해야 한다. `docs/domain/business/`의 `business.ts`를 단일 출처로 삼는다.
- 플레이스 사진은 사이트 작업물 사진을 재활용. 프로필 게시물에 새 작업물 링크를 주기적으로 올리면 유입 증가.

## 9. 한글 URL 주의점

- 한글 slug는 브라우저 주소창엔 한글로 보이지만 공유 시 `%ED%99%8D...` 로 인코딩되어 길어진다. 카카오톡 공유는 OG 미리보기가 있어 문제 없고, 문자 메시지로 보낼 땐 길다. 필요하면 `/w/{short_id}` 단축 리다이렉트를 v2에 추가.
- `generateStaticParams` 반환 시 `decodeURIComponent`/`encodeURIComponent` 일관성 유지 (Next.js는 params를 디코드된 상태로 전달).

## 10. 체크리스트

- [ ] Lighthouse SEO 100 / Performance 90+
- [ ] 상세 페이지 JS 꺼도 본문·사진·연락처 보임
- [ ] `og:image` 미리보기 (카카오톡 공유 디버거)
- [ ] Search Console에서 sitemap 제출 및 색인 확인
