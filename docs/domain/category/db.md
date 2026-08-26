# category — DB

```sql
create table categories (
  code        text primary key,
  name        text not null unique,
  color       text not null default '#64748b',   -- hex
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  constraint categories_code_format check (code ~ '^[a-z][a-z0-9_]{1,29}$'),
  constraint categories_color_format check (color ~ '^#[0-9a-fA-F]{6}$')
);

create index categories_active_sort_idx on categories (sort_order) where is_active;
```

## RLS

```sql
alter table categories enable row level security;
create policy categories_public_read on categories for select using (true);
create policy categories_admin_write on categories
  for all using (is_admin()) with check (is_admin());
```

## 시드

```sql
insert into categories (code, name, color, sort_order) values
  ('sign',    '간판',        '#e11d48', 10),
  ('banner',  '현수막',      '#f59e0b', 20),
  ('sheet',   '시트지(썬팅)', '#0ea5e9', 30),
  ('led',     'LED',        '#8b5cf6', 40),
  ('print',   '실사출력',    '#10b981', 50),
  ('card',    '명함',        '#64748b', 60),
  ('flyer',   '전단지',      '#84cc16', 70),
  ('sticker', '스티커',      '#ec4899', 80),
  ('etc',     '기타',        '#9ca3af', 90);
```

## 삭제 정책
- `work_categories.category_code` FK는 `on delete restrict`. 관리자 UI에서는 삭제 대신 비활성화만 제공.
