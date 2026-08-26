# work — 도메인 개요

## 정의

**작업물(Work)** 은 광고나라가 **한 가게(의뢰처)** 에 해준 작업 묶음이다. 홈페이지의 모든 화면(지도 마커, 테이블 행, 상세 패널, SEO 페이지)은 Work 하나를 단위로 한다.

"작업을 맡기면 홈페이지에도 광고가 된다"는 서비스 컨셉의 실체가 이 도메인이다.

## 분류

**핵심 도메인(Core)**. 다른 모든 도메인은 이 도메인을 위해 존재한다.

## 유비쿼터스 언어

| 용어 | 정의 |
|---|---|
| Work | 애그리거트 루트. 가게 정보 + 위치 + 설명 + 사진 + 카테고리 |
| Shop | Work에 내장된 가게 정보 (상호명, 전화, 주소). 별도 엔티티로 분리하지 않음 — 같은 가게에 두 번 작업하면 Work 2개 |
| WorkImage | Work에 속한 사진. 순서와 커버 여부를 가짐 |
| Slug | SEO용 URL 식별자. 한글 허용. 생성 후 변경 가능 (v2: 이력 관리) |
| Location | `(lng, lat)` 값 객체. geo 도메인이 생성 |
| Published | `is_published = true`. 공개 목록/SEO에 포함 |
| Consent | 가게 사장 노출 동의. 동의 없으면 Published 불가 |
| Summary | 한 줄 요약. meta description 겸용 |
| WorkedAt | 작업일 (날짜) |

## 애그리거트

```
Work (root)
├─ id, slug
├─ shop: { name, phone?, address, addressDong? }
├─ location: Location { lng, lat }
├─ summary?, description?
├─ workedAt?
├─ isPublished, consent
├─ categories: CategoryCode[]        (category 도메인 참조, 값으로만)
└─ images: WorkImage[]               (엔티티, Work 생명주기에 종속)
     ├─ id, path, alt?, width?, height?
     ├─ sortOrder
     └─ isCover
```

### 불변식 (Invariants)
1. `isPublished = true` 이면 `consent = true` 여야 한다.
2. `categories`는 1개 이상.
3. `images` 중 `isCover = true` 는 최대 1개. 사진이 있으면 커버가 정확히 1개 (없으면 첫 번째를 커버로 자동 지정).
4. `slug`는 전역 유일. 형식: `{상호명}-{동}-{대표카테고리}`, 공백은 `-`, 중복 시 `-2`, `-3` 접미.
5. `location`은 유효한 범위 (경도 -180~180, 위도 -90~90). 실무적으로 김해 근방 아니면 경고.

## 도메인 이벤트

| 이벤트 | 발생 시점 | 소비자 |
|---|---|---|
| `WorkPublished` | 공개 상태로 저장됨 | ISR revalidate (`/`, `/works/[slug]`, sitemap) |
| `WorkUnpublished` | 비공개 전환 | ISR revalidate, sitemap 제외 |
| `WorkUpdated` | 내용 수정 | ISR revalidate |
| `WorkDeleted` | 삭제 | 댓글 cascade, Storage 사진 정리, revalidate |

(v1에서는 이벤트 버스 없이 서버 액션 내에서 순차 호출. 이름만 개념으로 유지.)

## 유스케이스

### 공개 (읽기)
- `listPublishedWorks(filter?)` — 지도/테이블용. 좌표+요약+커버 썸네일만.
- `getPublishedWorkBySlug(slug)` — 상세. 사진 전체, 카테고리 이름 포함.
- `listPublishedSlugs()` — `generateStaticParams`, sitemap.

### 관리자 (쓰기, admin 도메인 인증 전제)
- `createWork(input)` — geo로 좌표 변환, slug 생성, 불변식 검증.
- `updateWork(id, patch)`
- `publishWork(id)` / `unpublishWork(id)` — consent 검사.
- `deleteWork(id)`
- `addImages(workId, files[])` / `reorderImages` / `setCover` / `removeImage`

## 다른 도메인과의 관계

| 방향 | 도메인 | 방식 |
|---|---|---|
| 의존 | category | `CategoryCode` 값 참조. 존재 검증은 FK |
| 의존 | geo | `createWork` 시 주소→Location 변환 (포트 인터페이스 `Geocoder`) |
| 의존 | admin | 쓰기 유스케이스 가드 |
| 피의존 | comment | `work_id` FK |
| 피의존 | SEO/페이지 | slug, summary, images.alt 소비 |

## 정책 결정

- **Shop을 별도 애그리거트로 만들지 않는 이유**: 같은 가게 재작업은 드물고, 분리하면 관리자 입력이 복잡해진다. 필요해지면 `shop_name`+`address` 기준으로 나중에 추출 가능.
- **카테고리 다중 선택**: 간판+시트지 동시 시공이 흔함.
- **전화번호 nullable**: 가게가 공개 원치 않을 수 있음.
