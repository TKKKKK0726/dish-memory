-- DishLog Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Restaurants table
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  cuisine text,
  location text,
  price_range text check (price_range in ('$', '$$', '$$$', '$$$$')),
  notes text,
  is_wishlist boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Visits table
create table visits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  date date not null,
  overall_rating int check (overall_rating between 1 and 5),
  ambiance_rating int check (ambiance_rating between 1 and 5),
  service_rating int check (service_rating between 1 and 5),
  would_return boolean default false not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Visit dishes table
create table visit_dishes (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits(id) on delete cascade not null,
  dish_name text not null,
  rating int check (rating between 1 and 5),
  would_reorder boolean default true not null,
  notes text
);

-- Row Level Security: users can only access their own data

alter table restaurants enable row level security;
create policy "Users manage own restaurants" on restaurants
  for all using (auth.uid() = user_id);

alter table visits enable row level security;
create policy "Users manage own visits" on visits
  for all using (
    restaurant_id in (
      select id from restaurants where user_id = auth.uid()
    )
  );

alter table visit_dishes enable row level security;
create policy "Users manage own visit dishes" on visit_dishes
  for all using (
    visit_id in (
      select v.id from visits v
      join restaurants r on v.restaurant_id = r.id
      where r.user_id = auth.uid()
    )
  );
