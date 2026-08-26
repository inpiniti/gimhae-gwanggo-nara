# 09. 테스트 전략

1인 프로젝트이므로 **적게, 깨지면 아픈 곳만**. 세 층으로 나눈다.

## 1. 단위 테스트 (Vitest) — 도메인 순수 로직

| 대상 | 케이스 |
|---|---|
| `work/slug.ts` | 한글·공백·특수문자 정규화, 중복 시 `-2` 접미, 최대 길이 |
| `work/policies.ts` | `publish` 시 consent 없으면 거부, 카테고리 0개 거부, 커버 자동 지정 |
| `comment/password.ts` | bcrypt 해시/검증, 빈 비밀번호 거부 |
| `comment/rate-limit.ts` | 1분 3건, 1일 30건 경계값 |
| `geo/geojson.ts` | works → FeatureCollection 변환, 좌표 순서 [lng, lat] |
| `geo/viewport.ts` | `isInGimhae` 경계 |
| `geo/deeplink.ts` | 카카오/네이버 URL 인코딩 (한글 상호명) |
| `seo/metadata.ts` | title/description 생성, summary 없을 때 fallback, canonical |
| `seo/jsonld.ts` | LocalBusiness/ImageObject 스키마 필수 필드 |

## 2. 통합 테스트 (Vitest + Supabase local)

`supabase start` 로 띄운 로컬 DB에 대해 실행. CI에서는 GitHub Actions 서비스로 Supabase CLI 사용.

| 대상 | 케이스 |
|---|---|
| RLS | anon으로 `works` insert → 거부. anon select → published만. `is_admin()` 사용자 → 전체 |
| RLS | anon으로 `comments` 직접 insert → 거부. `comments_public` 뷰에 `password_hash` 없음 |
| DB 제약 | `is_published=true, consent=false` insert → CHECK 위반. 커버 2개 → unique 위반 |
| 서버 액션 `createComment` | honeypot 채움 → 저장 안 됨(200). rate limit 초과 → 오류. 정상 → 저장 + revalidate 호출됨(mock) |
| 서버 액션 `createWork` | 비관리자 세션 → throw. 관리자 → slug 생성, geo mock 호출, 저장 |
| `comment_rate_ok()` | SQL 함수 경계값 |

## 3. E2E (Playwright) — 핵심 사용자 흐름 5개

시드 데이터 5건으로 실행. 데스크탑(1280) + 모바일(390) 프로젝트.

1. **탐색**: `/` → 마커/행 클릭 → URL `/works/{slug}` + 패널 표시 → 뒤로가기 → 패널 닫힘.
2. **필터 유지**: 카테고리 칩 선택 → 테이블 전환 → 필터 유지 → 새로고침 → 유지.
3. **SEO 페이지**: `/works/{slug}` 직접 진입 → h1, `tel:` 링크, JSON-LD script, canonical 존재. `javaScriptEnabled: false` 로도 본문 존재.
4. **댓글**: 작성 → 목록 표시 → 잘못된 비밀번호 삭제 실패 → 올바른 비밀번호 삭제 성공.
5. **관리자**: 로그인 → 새 작업물(주소 검색 mock) → 사진 2장 업로드 → 공개 저장 → 공개 페이지에서 확인 → 비공개 전환 → 404.

## 4. 품질 게이트 (CI)

| 단계 | 도구 | 기준 |
|---|---|---|
| lint/type | eslint, `tsc --noEmit` | 오류 0 |
| unit/integration | vitest | 통과 |
| e2e | playwright (PR 프리뷰 URL 대상) | 통과 |
| Lighthouse | `@lhci/cli` on `/` 와 `/works/{seed}` | Performance ≥ 85, SEO = 100, A11y ≥ 90 |
| 번들 | `next build` 출력 | `/` First Load JS ≤ 250 KB (지도는 dynamic chunk 제외) |
| 보안 | `pnpm audit --audit-level=high`, 번들 내 service role 키 grep | 0건 |

## 5. 수동 검수 체크리스트 (배포 전)

- [ ] 실기기 iOS Safari / Android Chrome 에서 지도 드래그·핀치·마커 탭
- [ ] 카카오톡 링크 공유 미리보기
- [ ] 다크모드 지도 타일 전환
- [ ] 관리자 모바일에서 카메라 촬영 → 업로드
- [ ] Search Console URL 검사 "색인 가능"
