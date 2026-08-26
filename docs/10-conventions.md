# 10. 개발 컨벤션

## 1. DDD 폴더 규칙

```
lib/domain/{domain}/
├─ types.ts        # 엔티티/VO 타입, zod 스키마 (DB row ↔ 도메인 타입 매핑 포함)
├─ queries.ts      # 읽기. 서버 전용. Supabase 호출은 여기서만
├─ actions.ts      # 쓰기. 'use server'. 첫 줄에서 인증/검증
├─ policies.ts     # 불변식·정책 (순수 함수, DB 의존 없음)
└─ *.ts            # 도메인 특화 유틸 (slug, password, geojson …)
```

규칙
- **도메인 간 import는 `types.ts`와 공개 함수만.** 다른 도메인의 `queries/actions` 내부 구현이나 Supabase 테이블을 직접 참조하지 않는다.
  - 예: `comment/actions.ts`는 `work/queries.ts`의 `isWorkPublished(id)`를 쓰지, `works` 테이블을 직접 select하지 않는다.
- 외부 서비스(Kakao, Storage)는 해당 도메인 안의 어댑터로 감싸고 인터페이스(포트)를 `types.ts`에 둔다.
- `components/`는 도메인별 하위 폴더 (`components/work`, `components/comment` …). UI는 도메인 로직을 import 하되, 도메인은 UI를 모른다.
- `app/`은 라우팅과 조립만. 비즈니스 로직을 page.tsx에 쓰지 않는다.
- `docs/domain/{domain}/` 문서와 `lib/domain/{domain}/` 코드는 이름을 맞춘다. 도메인이 생기거나 사라지면 둘 다 갱신.

## 2. 서버 액션 규칙

```ts
'use server'
export async function publishWork(input: unknown) {
  await requireAdmin()                       // 1. 인증 (관리자 액션)
  const data = PublishWorkInput.parse(input) // 2. zod 검증
  assertPublishable(work)                    // 3. 정책 (policies.ts)
  await db...                                // 4. 저장 (service role 또는 세션 클라이언트)
  revalidatePath(...)                        // 5. 캐시 무효화
  return { ok: true }                        // 6. 직렬화 가능한 결과. throw 대신 { ok:false, error } 도 허용
}
```

- 공개 액션(댓글)은 1번 대신 honeypot + rate limit.
- 액션은 **얇게**. 로직은 policies/queries로.

## 3. 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 파일 | kebab-case | `work-table.tsx`, `rate-limit.ts` |
| 컴포넌트 | PascalCase, 도메인 접두 | `WorkTable`, `CommentForm` |
| 도메인 타입 | PascalCase 단수 | `Work`, `WorkImage`, `Comment` |
| DB row 타입 | `{Table}Row` | `WorksRow` (supabase gen types) |
| zod 스키마 | `{Name}Schema` / 입력은 `{Action}Input` | `WorkSchema`, `CreateWorkInput` |
| 서버 액션 | 동사+명사 | `createWork`, `hideComment` |
| URL 파라미터 | 짧은 소문자 | `?view=table&cat=sign,sheet&q=` |
| DB | snake_case, 테이블 복수형 | `work_images` |

## 4. DB 마이그레이션

- `supabase/migrations/NNNN_{설명}.sql`, 4자리 순번. `0001_init.sql` 은 도메인별 `db.md`를 순서(category → admin → work → comment)로 합친 것.
- 스키마 변경 시 **`docs/domain/*/db.md` 먼저 수정 → 마이그레이션 작성** 순서. 둘이 다르면 db.md가 정답.
- `supabase gen types typescript` 결과는 `types/supabase.ts` 에 커밋.
- 롤백 마이그레이션은 만들지 않는다 (앞으로만). 실수는 새 마이그레이션으로 교정.

## 5. Git

- 브랜치: `main`(prod), `feat/{domain}-{설명}`, `fix/…`, `docs/…`
- 커밋: Conventional Commits. scope는 도메인명.
  - `feat(work): 작업물 등록 폼`
  - `fix(comment): rate limit 경계값`
  - `docs(seo): 색인 흐름 추가`
- PR 템플릿: 변경 도메인, 스크린샷(UI), 마이그레이션 유무, 체크리스트(테스트·문서 갱신).

## 6. 코드 스타일

- TypeScript strict. `any` 금지 (`unknown` + zod).
- 서버 컴포넌트 기본, `'use client'`는 상호작용 필요한 말단만.
- 지도·라이트박스처럼 무거운 클라이언트 모듈은 `next/dynamic`.
- 문자열 UI 문구는 `lib/i18n/ko.ts` 한 곳에 모은다 (다국어 목적이 아니라 문구 일관성·해요체 검수용).
- 날짜는 `date-fns` + `ko` 로케일, 표시는 `2026.08.26`.

## 7. 문서 갱신 규칙

- 기능이 바뀌면 같은 PR에서 해당 `docs/domain/*/prd.md` 의 요구사항 ID를 갱신한다.
- 결정 사항(라이브러리 교체, 정책 변경)은 `docs/adr/NNNN-{제목}.md` 로 남긴다. (형식: 배경 / 결정 / 대안 / 결과)
