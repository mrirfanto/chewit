-- Add last_studied_at column to decks table
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

ALTER TABLE decks ADD COLUMN last_studied_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX idx_decks_last_studied_at ON decks(last_studied_at DESC NULLS LAST);
