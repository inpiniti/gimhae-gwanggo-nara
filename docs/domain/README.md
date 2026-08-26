# 도메인 문서 (DDD)

각 도메인(바운디드 컨텍스트)은 폴더 하나로 관리하고, 아래 3종 문서를 둔다.

| 파일 | 내용 | 필수 |
|---|---|---|
| `overview.md` | 도메인 정의, 유비쿼터스 언어, 애그리거트/엔티티/VO, 도메인 이벤트, 다른 도메인과의 관계 | 필수 |
| `db.md` | 테이블 스키마, 인덱스, RLS, Storage | DB가 있는 도메인만 |
| `prd.md` | 유저 스토리, 기능 요구사항, 화면/UX, 수용 기준, 비범위 | 필수 |

> DB 스키마의 단일 출처(source of truth)는 각 도메인의 `db.md`이다. `docs/02-architecture.md`의 SQL은 요약본.

## 도메인 목록 및 분류

| 도메인 | 분류 | 한 줄 정의 | DB |
|---|---|---|---|
| [work](./work/) | **핵심(Core)** | 광고나라가 시공한 작업물 = 의뢰 가게 1건. 사진·위치·설명 포함 | ✅ |
| [category](./category/) | 지원(Supporting) | 작업 종류(간판, 현수막, 시트지…) 참조 데이터 | ✅ |
| [comment](./comment/) | 지원(Supporting) | 작업물에 달리는 비로그인 댓글 및 사장님 답글 | ✅ |
| [admin](./admin/) | 일반(Generic) | 사장님 인증/권한 (Supabase Auth) | ✅ |
| [business](./business/) | 지원(Supporting) | 광고나라 업체 자체 정보 (연락처, 주소, 소개) | ❌ 설정 파일 |
| [geo](./geo/) | 일반(Generic) | 주소→좌표 변환, 지도 타일, 지도 기본값 | ❌ 외부 API |

## 컨텍스트 맵

```
                 ┌───────────┐
                 │ category  │  (참조)
                 └─────┬─────┘
                       │ Work가 CategoryCode를 참조
                       ▼
┌──────────┐     ┌───────────┐     ┌───────────┐
│   geo    │────▶│   work    │◀────│  comment  │
│ 주소→좌표 │     │  (핵심)    │     │ work_id 참조│
└──────────┘     └─────┬─────┘     └───────────┘
                       │ 쓰기는 admin만
                       ▼
                 ┌───────────┐     ┌───────────┐
                 │   admin   │     │ business  │  (레이아웃/SEO/JSON-LD에 주입)
                 └───────────┘     └───────────┘
```

- **work ← geo**: Work 생성 시 `geo`가 주소를 `Location(lng, lat)`으로 변환. work는 geo의 구현(Kakao)을 모른다.
- **work ← category**: Work는 `CategoryCode[]`만 보유. 이름/색상은 category에서 조회.
- **comment → work**: comment는 `work_id`만 안다. Work 삭제 시 댓글 cascade.
- **admin**: 모든 쓰기 유스케이스의 전제조건. 도메인 로직 없음.
- **business**: 코드 상수/환경변수. 레이아웃, `/about`, JSON-LD가 소비.

## 유비쿼터스 언어 (전역)

| 용어 | 영문 | 정의 |
|---|---|---|
| 작업물 | Work | 광고나라가 한 가게에 해준 작업 묶음. 홈페이지의 기본 단위 |
| 가게 / 의뢰처 | Shop | 작업을 의뢰한 사업장. Work에 내장(별도 엔티티 아님) |
| 작업 종류 | Category | 간판, 현수막, 시트지(썬팅), LED, 실사출력, 명함, 전단지, 스티커 |
| 시트지(썬팅) | Sheet | 가게 유리창에 붙이는 시트 시공. 화면엔 두 표기 병기 |
| 작업 사진 | WorkImage | 작업물에 속한 사진. 커버 1장 |
| 위치 | Location | 경도/위도 값 객체 |
| 공개 | Published | 홈페이지에 노출되는 상태 |
| 노출 동의 | Consent | 가게 사장이 홈페이지 게시에 동의했는지 |
| 댓글 | Comment | 방문자가 작업물에 남긴 글 |
| 사장님 답글 | Owner Reply | `is_owner = true` 댓글 |
| 관리자 | Admin | 광고나라 사장님(및 위임자) |

## 코드 매핑 (예정)

```
lib/domain/
├─ work/        # types, queries, actions, slug 생성, 정책
├─ category/
├─ comment/     # 비밀번호 해시, rate limit 정책
├─ admin/       # 인증 가드
├─ business/    # 상수
└─ geo/         # kakao 어댑터, Location VO
```
