# admin — DB

```sql
create table admins (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '광고나라',
  created_at   timestamptz not null default now()
);

alter table admins enable row level security;

-- 본인 행만 읽기 (클라이언트에서 "내가 관리자인가" 확인용)
create policy admins_self_read on admins
  for select using (auth.uid() = user_id);

-- 쓰기는 대시보드/service role만 (정책 없음 = 거부)
```

## `is_admin()` 함수

```sql
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$ language sql stable security definer;

revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;
```

> `security definer`로 두는 이유: RLS가 걸린 `admins`를 정책 안에서 재귀 없이 읽기 위해.

## 초기 관리자 등록 절차

### 방법 A — 스크립트 (권장)
```bash
node scripts/create-admin.mjs <이메일> <비밀번호 8자+> [표시이름]
```
`.env.local`의 service role 키로 계정 생성(이메일 확인 완료 상태) + `admins` upsert. 같은 이메일이면 비밀번호 재설정.

### 방법 B — 대시보드
1. Supabase Dashboard → Authentication → Users → "Add user" (이메일/비밀번호, Auto Confirm).
2. SQL Editor:
   ```sql
   insert into admins (user_id, display_name)
   values ('<auth.users.id>', '광고나라 사장님');
   ```
3. `/admin/login`에서 로그인 확인.
