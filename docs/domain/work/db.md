# work — DB

## 테이블

```sql
create table works (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  shop_name     text not null,
  phone         text,
  address       text not null,
  address_dong  text,
  lng           double precision not null,
  lat           double precision not null,
  summary       text,
  description   text,
  worked_at     date,
  is_published  boolean not null default false,
  consent       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint works_publish_requires_consent
    check (is_published = false or consent = true),
  constraint works_lng_range check (lng between -180 and 180),
  constraint works_lat_range check (lat between -90 and 90)
);

create table work_categories (
  work_id       uuid not null references works(id) on delete cascade,
  category_code text not null references categories(code) on delete restrict,
  primary key (work_id, category_code)
);

create table work_images (
  id          uuid primary key default gen_random_uuid(),
  work_id     uuid not null references works(id) on delete cascade,
  path        text not null,
  alt         text,
  width       int,
  height      int,
  thumb_path  text,                          -- 400px 썸네일 (목록/테이블용, Vercel 이미지 최적화 한도 절약)
  blurhash    text,                          -- 로딩 placeholder
  sort_order  int not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 커버는 work당 최대 1개
create unique index work_images_one_cover
  on work_images (work_id) where is_cover;
```

## 인덱스

```sql
create index works_published_worked_at_idx
  on works (worked_at desc) where is_published;
create index works_slug_idx on works (slug);
create index work_images_work_sort_idx on work_images (work_id, sort_order);
create index work_categories_category_idx on work_categories (category_code);
```

## 트리거

```sql
-- updated_at 자동 갱신
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger works_set_updated_at
  before update on works
  for each row execute function set_updated_at();
```

## 뷰 (목록 조회 최적화)

```sql
-- 지도/테이블용: 커버 썸네일 + 카테고리 코드 배열
create view works_public_list as
select
  w.id, w.slug, w.shop_name, w.address, w.address_dong,
  w.lng, w.lat, w.summary, w.worked_at,
  (select path from work_images i where i.work_id = w.id order by is_cover desc, sort_order limit 1) as cover_path,
  array(select category_code from work_categories c where c.work_id = w.id) as categories,
  w.phone                                    -- 0002: 지도 마커 라벨용
from works w
where w.is_published;
```

## RLS

```sql
alter table works enable row level security;
alter table work_categories enable row level security;
alter table work_images enable row level security;

-- 공개 읽기
create policy works_public_read on works
  for select using (is_published);
create policy work_categories_public_read on work_categories
  for select using (exists (select 1 from works w where w.id = work_id and w.is_published));
create policy work_images_public_read on work_images
  for select using (exists (select 1 from works w where w.id = work_id and w.is_published));

-- 관리자 전체 권한 (admin 도메인의 is_admin() 사용)
create policy works_admin_all on works
  for all using (is_admin()) with check (is_admin());
create policy work_categories_admin_all on work_categories
  for all using (is_admin()) with check (is_admin());
create policy work_images_admin_all on work_images
  for all using (is_admin()) with check (is_admin());
```

## Storage

- 버킷: `works` (public read)
- 경로: `{work_id}/{uuid}.webp` (원본 1600px), `{work_id}/{uuid}.thumb.webp` (400px)
- 업로드 전 브라우저에서 EXIF 제거(GPS 포함), orientation 적용, blurhash 계산.
- 정책: select는 공개, insert/update/delete는 `is_admin()`
- 클라이언트 업로드 전 처리: 긴 변 1600px, WebP, quality 80. 원본 보관 안 함.
- Work 삭제 시 서버 액션에서 해당 prefix 객체 일괄 삭제.

## 시드 (개발용)

```sql
insert into works (slug, shop_name, phone, address, address_dong, lng, lat, summary, worked_at, is_published, consent)
values
  ('예시식당-삼안동-간판', '예시식당', '055-000-0000', '경상남도 김해시 활천로36번길 20-1', '삼안동', 128.8894, 35.2285, '채널간판 신규 제작', '2026-08-01', true, true);
```
