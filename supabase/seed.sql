-- 개발용 시드. 카테고리는 운영에서도 사용 (docs/domain/category/db.md)
insert into categories (code, name, color, sort_order) values
  ('sign',    '간판',        '#f04452', 10),
  ('banner',  '현수막',      '#ff9500', 20),
  ('sheet',   '시트지(썬팅)', '#00b8b8', 30),
  ('led',     'LED',        '#7c5cff', 40),
  ('print',   '실사출력',    '#03b26c', 50),
  ('card',    '명함',        '#4e5968', 60),
  ('flyer',   '전단지',      '#b5a300', 70),
  ('sticker', '스티커',      '#e8548c', 80),
  ('etc',     '기타',        '#8b95a1', 90)
on conflict (code) do nothing;

-- 예시 작업물 5건 (김해 시내 임시 좌표)
with w as (
  insert into works (slug, shop_name, phone, address, address_dong, lng, lat, summary, description, worked_at, is_published, consent)
  values
    ('예시식당-삼안동-간판',   '예시식당',   '055-000-0001', '경상남도 김해시 활천로36번길 20-1', '삼안동', 128.8894, 35.2285, '채널간판 신규 제작', '갈바 프레임에 LED 채널 문자를 올렸어요. 야간 시인성이 좋아요.', '2026-08-01', true, true),
    ('예시카페-내외동-시트지', '예시카페',   null,           '경상남도 김해시 내외동 1000',       '내외동', 128.8620, 35.2330, '유리창 시트지(썬팅) 시공', '오후 햇빛이 강한 매장이라 반투명 시트로 눈부심을 줄였어요.', '2026-07-20', true, true),
    ('예시학원-장유-현수막',   '예시학원',   '055-000-0003', '경상남도 김해시 장유로 200',        '장유동', 128.8080, 35.1930, '개원 현수막 3종', null, '2026-07-10', true, true),
    ('예시미용실-북부동-led',  '예시미용실', null,           '경상남도 김해시 북부동 500',        '북부동', 128.8700, 35.2500, 'LED 돌출간판 교체', null, '2026-06-30', true, true),
    ('예시비공개-외동-명함',   '예시비공개', null,           '경상남도 김해시 외동 10',           '외동',   128.8760, 35.2230, '명함 500매 (비공개 예시)', null, '2026-06-01', false, false)
  returning id, slug
)
insert into work_categories (work_id, category_code)
select id, case
  when slug like '%간판'   then 'sign'
  when slug like '%시트지' then 'sheet'
  when slug like '%현수막' then 'banner'
  when slug like '%led'    then 'led'
  else 'card' end
from w;

-- 첫 작업물에 시트지도 함께 시공한 것으로 (다중 카테고리 예시)
insert into work_categories (work_id, category_code)
select id, 'sheet' from works where slug = '예시식당-삼안동-간판'
on conflict do nothing;

-- 예시 댓글 (비밀번호 '1234' 의 bcrypt 해시 — 개발용)
insert into comments (work_id, nickname, password_hash, body, is_owner)
select id, '단골손님', '$2b$10$Buv5S8j.OUVCNWXOPBVEguRIBXBOwePXXajvs9fTcVB1eCr0fKZRq', '간판 진짜 잘 나왔어요!', false
from works where slug = '예시식당-삼안동-간판';

insert into comments (work_id, nickname, password_hash, body, is_owner)
select id, '광고나라', null, '감사합니다. 야간에 더 예쁘게 보일 거예요.', true
from works where slug = '예시식당-삼안동-간판';
