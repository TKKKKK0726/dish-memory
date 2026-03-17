-- DishLog Seed Data — South Bay Area
-- 1. Go to Supabase → Authentication → Users → copy your User UID
-- 2. Replace YOUR-USER-UUID-HERE below with that value
-- 3. Paste this entire script into the Supabase SQL Editor and click Run

DO $seed$
DECLARE
  uid uuid := 'YOUR-USER-UUID-HERE';

  r1 uuid := 'a1000000-0000-0000-0000-000000000001';
  r2 uuid := 'a1000000-0000-0000-0000-000000000002';
  r3 uuid := 'a1000000-0000-0000-0000-000000000003';
  r4 uuid := 'a1000000-0000-0000-0000-000000000004';
  r5 uuid := 'a1000000-0000-0000-0000-000000000005';

  v1a uuid := 'b1000000-0000-0000-0000-000000000001';
  v1b uuid := 'b1000000-0000-0000-0000-000000000002';
  v2a uuid := 'b1000000-0000-0000-0000-000000000003';
  v3a uuid := 'b1000000-0000-0000-0000-000000000004';
  v4a uuid := 'b1000000-0000-0000-0000-000000000005';
  v4b uuid := 'b1000000-0000-0000-0000-000000000006';
  v5a uuid := 'b1000000-0000-0000-0000-000000000007';

BEGIN

-- ─────────────────────────────────────────
-- Restaurants
-- ─────────────────────────────────────────
INSERT INTO restaurants (id, user_id, name, cuisine, location, price_range, notes, created_at, updated_at) VALUES
  (r1, uid, 'Din Tai Fung',        'Taiwanese',       'Cupertino, CA',     '$$',   'Famous for xiao long bao. Always a line but worth it.',                   now() - interval '60 days', now() - interval '5 days'),
  (r2, uid, 'Ramen Nagi',          'Japanese',        'Santa Clara, CA',   '$',    'Rich, customizable broth. Great for a quick solo meal.',                  now() - interval '45 days', now() - interval '10 days'),
  (r3, uid, 'Plumed Horse',        'American',        'Saratoga, CA',      '$$$$', 'Upscale special-occasion spot. Excellent wine list.',                     now() - interval '30 days', now() - interval '3 days'),
  (r4, uid, 'Orens Hummus Shop',   'Israeli',         'Sunnyvale, CA',     '$$',   'Casual and fresh. Great for a healthy weekday lunch.',                    now() - interval '20 days', now() - interval '15 days'),
  (r5, uid, 'Cascal',              'Latin American',  'Mountain View, CA', '$$$',  'Lively tapas bar. Fun for groups. Good cocktails.',                       now() - interval '14 days', now() - interval '7 days');

-- ─────────────────────────────────────────
-- Visits
-- ─────────────────────────────────────────
INSERT INTO visits (id, restaurant_id, date, overall_rating, ambiance_rating, service_rating, would_return, notes, created_at) VALUES
  (v1a, r1, current_date - 5,  5, 3, 4, true,  'Came on a Tuesday, wait was only 20 min. Dumplings were perfect.',         now() - interval '5 days'),
  (v1b, r1, current_date - 40, 4, 3, 3, true,  'Weekend wait was 1 hour. Food still great but the wait is painful.',       now() - interval '40 days'),
  (v2a, r2, current_date - 10, 4, 3, 4, true,  'Got the King broth. Solid ramen, fast service, good value.',               now() - interval '10 days'),
  (v3a, r3, current_date - 3,  5, 5, 5, true,  'Anniversary dinner. Impeccable from start to finish.',                    now() - interval '3 days'),
  (v4a, r4, current_date - 15, 3, 3, 3, false, 'Food was fresh but portions felt small for the price. Would try once.',   now() - interval '15 days'),
  (v4b, r4, current_date - 35, 4, 3, 4, true,  'Second visit, ordered more sides. Much more satisfying.',                 now() - interval '35 days'),
  (v5a, r5, current_date - 7,  4, 5, 4, true,  'Great energy. Ordered too many tapas but no regrets.',                    now() - interval '7 days');

-- ─────────────────────────────────────────
-- Visit Dishes
-- ─────────────────────────────────────────
INSERT INTO visit_dishes (id, visit_id, dish_name, rating, would_reorder, notes) VALUES
  -- Din Tai Fung visit 1
  (gen_random_uuid(), v1a, 'Xiao Long Bao',         5, true,  'Thin skin, perfect soup-to-meat ratio. Get two orders.'),
  (gen_random_uuid(), v1a, 'Truffle Fried Rice',    5, true,  'Rich and fragrant. Surprisingly light.'),
  (gen_random_uuid(), v1a, 'Cucumber Salad',        4, true,  'Refreshing contrast to the heavier dishes.'),
  (gen_random_uuid(), v1a, 'Taro Xiao Long Bao',    3, false, 'Interesting but the savory ones are far better.'),
  -- Din Tai Fung visit 2
  (gen_random_uuid(), v1b, 'Xiao Long Bao',         5, true,  'Consistent as always.'),
  (gen_random_uuid(), v1b, 'Pork Chop Fried Rice',  3, false, 'Too salty. Stick to the truffle version.'),

  -- Ramen Nagi
  (gen_random_uuid(), v2a, 'King Broth Ramen',      4, true,  'Deep, rich tonkotsu. Noodles perfectly springy.'),
  (gen_random_uuid(), v2a, 'Chashu Bun',            4, true,  'Soft bun, melt-in-mouth pork. Good starter.'),
  (gen_random_uuid(), v2a, 'Gyoza',                 2, false, 'Frozen-tasting. Skip these.'),

  -- Plumed Horse
  (gen_random_uuid(), v3a, 'Wagyu Beef Tenderloin', 5, true,  'Best steak I have had in the South Bay. Perfectly seared.'),
  (gen_random_uuid(), v3a, 'Foie Gras Torchon',     5, true,  'Silky and decadent. Great with the brioche.'),
  (gen_random_uuid(), v3a, 'Chocolate Souffle',     4, true,  'Order at the start of the meal. Worth the wait.'),
  (gen_random_uuid(), v3a, 'Burrata Salad',         3, false, 'Fine but unremarkable. Skip for another starter.'),

  -- Orens Hummus visit 1
  (gen_random_uuid(), v4a, 'Classic Hummus',        3, false, 'Good but portion was small for the price.'),
  (gen_random_uuid(), v4a, 'Falafel Plate',         3, false, 'Dry inside. Not as good as expected.'),
  -- Orens Hummus visit 2
  (gen_random_uuid(), v4b, 'Mushroom Hummus',       4, true,  'Much better than the classic. Earthy and creamy.'),
  (gen_random_uuid(), v4b, 'Chicken Shawarma Bowl', 5, true,  'Tender, well-spiced. This is the move.'),
  (gen_random_uuid(), v4b, 'Pita Bread',            4, true,  'Fresh and warm. Get extra.'),

  -- Cascal
  (gen_random_uuid(), v5a, 'Patatas Bravas',        5, true,  'Crispy outside, fluffy inside. Addictive aioli.'),
  (gen_random_uuid(), v5a, 'Grilled Octopus',       5, true,  'Perfectly charred. Best dish of the night.'),
  (gen_random_uuid(), v5a, 'Lamb Skewers',          4, true,  'Juicy and well-seasoned. Good portion.'),
  (gen_random_uuid(), v5a, 'Churros',               2, false, 'Undercooked dough inside. Skip dessert here.');

END $seed$;
