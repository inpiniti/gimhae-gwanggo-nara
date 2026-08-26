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
  -- 포인트 블루(#3182f6)와 겹치지 않는 보조 색. 뱃지는 연한 배경+진한 글자, 마커는 원색.
  ('sign',    '간판',        '#f04452', 10),
  ('banner',  '현수막',      '#ff9500', 20),
  ('sheet',   '시트지(썬팅)', '#00b8b8', 30),
  ('led',     'LED',        '#7c5cff', 40),
  ('print',   '실사출력',    '#03b26c', 50),
  ('card',    '명함',        '#4e5968', 60),
  ('flyer',   '전단지',      '#b5a300', 70),
  ('sticker', '스티커',      '#e8548c', 80),
  ('etc',     '기타',        '#8b95a1', 90);
```

## 삭제 정책
- `work_categories.category_code` FK는 `on delete restrict`. 관리자 UI에서는 삭제 대신 비활성화만 제공.
