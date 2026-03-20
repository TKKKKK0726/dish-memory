-- Add image URL column to visit_dishes for per-dish photo uploads.
-- Images are stored in the 'dish-images' Supabase Storage bucket.

ALTER TABLE visit_dishes ADD COLUMN image_url text;
