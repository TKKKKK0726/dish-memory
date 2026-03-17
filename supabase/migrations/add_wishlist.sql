-- Migration: Add wishlist support
-- Run this in the Supabase SQL Editor if you already set up the schema

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_wishlist boolean DEFAULT false NOT NULL;
