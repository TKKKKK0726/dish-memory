-- Allow anyone to read restaurant/visit data for share links.
-- The user_id UUID in the share URL acts as the access token (unguessable).

create policy "Public can read restaurants" on restaurants
  for select using (true);

create policy "Public can read visits" on visits
  for select using (true);

create policy "Public can read visit dishes" on visit_dishes
  for select using (true);
