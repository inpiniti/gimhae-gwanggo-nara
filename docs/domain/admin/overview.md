# admin — 도메인 개요

## 정의

**관리자(Admin)** 는 사이트에 쓰기 권한을 가진 사람이다. 실질적으로 광고나라 사장님 1명(+ 필요 시 위임자 1명). 인증은 Supabase Auth에 위임하고, 이 도메인은 "누가 관리자인가"와 "관리자만 통과시키는 가드"만 책임진다.

## 분류

**일반 도메인(Generic)**. 도메인 로직 없음. 기성 솔루션(Supabase Auth) 사용.

## 유비쿼터스 언어

| 용어 | 정의 |
|---|---|
| Admin | `admins` 테이블에 `user_id`가 등록된 Supabase 사용자 |
| Session | Supabase Auth 세션 (쿠키, `@supabase/ssr`) |
| Guard | 서버 컴포넌트/서버 액션 진입 시 Admin 여부 검사 |
| `is_admin()` | Postgres 함수. RLS 정책에서 사용 |

## 모델

```
Admin
├─ userId (auth.users FK)
├─ displayName ("광고나라 사장님")
└─ createdAt
```

- 역할(role) 구분 없음. 관리자면 전권.
- 회원가입 UI 없음. 관리자 계정은 Supabase 대시보드에서 생성 후 `admins`에 수동 insert.

## 유스케이스
| 유스케이스 | 설명 |
|---|---|
| `signIn(email, password)` | Supabase Auth |
| `signOut()` | |
| `requireAdmin()` | 서버에서 세션 확인 → `admins` 조회 → 아니면 `/admin/login`으로 redirect (액션이면 throw) |
| `is_admin()` (SQL) | RLS용 |

## 관계
- work, category, comment의 모든 쓰기 유스케이스가 `requireAdmin()`을 전제.
- RLS 정책은 `is_admin()`으로 DB 레벨 이중 방어.

## 보안 정책
- 관리자 라우트 `/admin/**`: `robots noindex`, 미들웨어에서 세션 없으면 로그인으로.
- 비밀번호 최소 12자, Supabase 기본 rate limit 사용.
- 관리자 액션은 항상 서버 액션. 클라이언트에 service role 키 절대 노출 금지.
- v2: 이메일 OTP(매직링크) 전환 검토 — 사장님이 비밀번호 기억 안 해도 되도록.
