-- 지도 마커 라벨에 전화번호 표시 (docs/domain/work/db.md 뷰 갱신)
-- CREATE OR REPLACE VIEW 는 컬럼을 끝에 추가하는 것만 허용하므로 phone 을 마지막에 둔다.
create or replace view works_public_list as
select
  w.id, w.slug, w.shop_name, w.address, w.address_dong,
  w.lng, w.lat, w.summary, w.worked_at,
  (select coalesce(i.thumb_path, i.path)
     from work_images i
    where i.work_id = w.id
    order by i.is_cover desc, i.sort_order
    limit 1) as cover_path,
  array(select category_code from work_categories c where c.work_id = w.id) as categories,
  w.phone
from works w
where w.is_published;
