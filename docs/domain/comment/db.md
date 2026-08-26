# comment — DB

```sql
create table comments (
  id            uuid primary key default gen_random_uuid(),
  work_id       uuid not null references works(id) on delete cascade,
  nickname      text not null,
  password_hash text,
  body          text not null,
  is_owner      boolean not null default false,
  is_hidden     boolean not null default false,
  ip_hash       text,
  created_at    timestamptz not null default now(),

  constraint comments_nickname_len check (char_length(nickname) between 1 and 20),
  constraint comments_body_len     check (char_length(body) between 1 and 500),
  constraint comments_owner_pw
    check ((is_owner and password_hash is null) or (not is_owner and password_hash is not null))
);

create index comments_work_created_idx on comments (work_id, created_at);
create index comments_iphash_created_idx on comments (ip_hash, created_at desc) where ip_hash is not null;
```

## RLS

```sql
alter table comments enable row level security;

-- 공개 읽기: 숨김 아님 + 부모 Work가 공개
create policy comments_public_read on comments
  for select using (
    not is_hidden
    and exists (select 1 from works w where w.id = work_id and w.is_published)
  );

-- anon/authenticated의 직접 insert/update/delete 없음.
-- 방문자 쓰기는 서버 액션이 service role로 수행.

-- 관리자
create policy comments_admin_all on comments
  for all using (is_admin()) with check (is_admin());
```

> `password_hash`, `ip_hash` 컬럼은 공개 select에서 노출되지 않도록 **뷰**를 통해 읽는다.

```sql
create view comments_public as
select id, work_id, nickname, body, is_owner, created_at
from comments
where not is_hidden;
```

## Rate limit (v1: DB 카운트)

```sql
-- 서버 액션에서 호출
create or replace function comment_rate_ok(p_ip_hash text) returns boolean as $$
  select
    (select count(*) from comments where ip_hash = p_ip_hash and created_at > now() - interval '1 minute') < 3
    and
    (select count(*) from comments where ip_hash = p_ip_hash and created_at > now() - interval '1 day') < 30;
$$ language sql security definer;
```

## 개인정보 보존
- `ip_hash`는 30일 경과 후 null 처리 (Supabase cron 또는 Vercel cron).

```sql
update comments set ip_hash = null
where ip_hash is not null and created_at < now() - interval '30 days';
```
