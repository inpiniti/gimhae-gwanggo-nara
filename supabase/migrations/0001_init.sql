-- 0001_init.sql — docs/domain/*/db.md 를 순서대로 합친 초기 스키마
-- 순서: admin → category → work → comment

-- =====================================================================
-- admin  (docs/domain/admin/db.md)
-- =====================================================================
create table admins (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '광고나라',
  created_at   timestamptz not null default now()
);

alter table admins enable row level security;

create policy admins_self_read on admins
  for select using (auth.uid() = user_id);

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$ language sql stable security definer;

revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

-- =====================================================================
-- category  (docs/domain/category/db.md)
-- =====================================================================
create table categories (
  code        text primary key,
  name        text not null unique,
  color       text not null default '#64748b',
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  constraint categories_code_format  check (code ~ '^[a-z][a-z0-9_]{1,29}$'),
  constraint categories_color_format check (color ~ '^#[0-9a-fA-F]{6}$')
);

create index categories_active_sort_idx on categories (sort_order) where is_active;

alter table categories enable row level security;
create policy categories_public_read on categories for select using (true);
create policy categories_admin_write on categories
  for all using (is_admin()) with check (is_admin());

-- =====================================================================
-- work  (docs/domain/work/db.md)
-- =====================================================================
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
  thumb_path  text,
  blurhash    text,
  sort_order  int not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);

create unique index work_images_one_cover on work_images (work_id) where is_cover;

create index works_published_worked_at_idx on works (worked_at desc) where is_published;
create index works_slug_idx on works (slug);
create index work_images_work_sort_idx on work_images (work_id, sort_order);
create index work_categories_category_idx on work_categories (category_code);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger works_set_updated_at
  before update on works
  for each row execute function set_updated_at();

create view works_public_list as
select
  w.id, w.slug, w.shop_name, w.address, w.address_dong,
  w.lng, w.lat, w.summary, w.worked_at,
  (select coalesce(i.thumb_path, i.path)
     from work_images i
    where i.work_id = w.id
    order by i.is_cover desc, i.sort_order
    limit 1) as cover_path,
  array(select category_code from work_categories c where c.work_id = w.id) as categories
from works w
where w.is_published;

alter table works enable row level security;
alter table work_categories enable row level security;
alter table work_images enable row level security;

create policy works_public_read on works
  for select using (is_published);
create policy work_categories_public_read on work_categories
  for select using (exists (select 1 from works w where w.id = work_id and w.is_published));
create policy work_images_public_read on work_images
  for select using (exists (select 1 from works w where w.id = work_id and w.is_published));

create policy works_admin_all on works
  for all using (is_admin()) with check (is_admin());
create policy work_categories_admin_all on work_categories
  for all using (is_admin()) with check (is_admin());
create policy work_images_admin_all on work_images
  for all using (is_admin()) with check (is_admin());

-- Storage 버킷
insert into storage.buckets (id, name, public)
values ('works', 'works', true)
on conflict (id) do nothing;

create policy works_storage_public_read on storage.objects
  for select using (bucket_id = 'works');
create policy works_storage_admin_write on storage.objects
  for insert with check (bucket_id = 'works' and is_admin());
create policy works_storage_admin_update on storage.objects
  for update using (bucket_id = 'works' and is_admin());
create policy works_storage_admin_delete on storage.objects
  for delete using (bucket_id = 'works' and is_admin());

-- =====================================================================
-- comment  (docs/domain/comment/db.md)
-- =====================================================================
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

alter table comments enable row level security;

create policy comments_public_read on comments
  for select using (
    not is_hidden
    and exists (select 1 from works w where w.id = work_id and w.is_published)
  );

create policy comments_admin_all on comments
  for all using (is_admin()) with check (is_admin());

create view comments_public as
select id, work_id, nickname, body, is_owner, created_at
from comments
where not is_hidden;

create or replace function comment_rate_ok(p_ip_hash text) returns boolean as $$
  select
    (select count(*) from comments where ip_hash = p_ip_hash and created_at > now() - interval '1 minute') < 3
    and
    (select count(*) from comments where ip_hash = p_ip_hash and created_at > now() - interval '1 day') < 30;
$$ language sql security definer;
