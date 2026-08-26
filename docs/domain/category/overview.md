# category — 도메인 개요

## 정의

**작업 종류(Category)** 는 광고나라가 취급하는 작업 유형의 참조 데이터다. Work가 1개 이상 참조하며, 필터·뱃지·마커 색상·SEO 키워드에 쓰인다.

## 분류

**지원 도메인(Supporting)**. 로직이 거의 없는 참조 데이터지만, 사장님이 항목을 추가/이름 변경할 수 있어야 하므로 코드 상수가 아닌 테이블로 둔다.

## 유비쿼터스 언어

| 용어 | 정의 |
|---|---|
| Category | 작업 종류. `code`(불변 식별자) + `name`(표시명) |
| CategoryCode | Work가 참조하는 값. 예: `sign`, `banner`, `sheet` |
| 대표 카테고리 | Work의 카테고리 중 첫 번째(`sort_order` 최소). 마커 색상·slug·title에 사용 |

## 초기 데이터

| code | name | color | 비고 |
|---|---|---|---|
| `sign` | 간판 | `#e11d48` | 채널·돌출·파나플렉스 등 |
| `banner` | 현수막 | `#f59e0b` | |
| `sheet` | 시트지(썬팅) | `#0ea5e9` | 유리창 시트 시공 |
| `led` | LED | `#8b5cf6` | |
| `print` | 실사출력 | `#10b981` | |
| `card` | 명함 | `#64748b` | |
| `flyer` | 전단지 | `#84cc16` | |
| `sticker` | 스티커 | `#ec4899` | |
| `etc` | 기타 | `#9ca3af` | |

## 불변식
1. `code`는 생성 후 불변 (URL·slug·필터 파라미터에 노출됨).
2. `name`은 유일.
3. Work가 참조 중인 Category는 삭제 불가 (FK restrict). 대신 `is_active = false`로 숨김.

## 관계
- work → category: `work_categories.category_code` FK.
- 공개 UI: 필터 칩, 뱃지, 마커 색상.
- SEO: `name`이 title/keywords에 포함. v2에서 `/category/[code]` 랜딩 페이지.
