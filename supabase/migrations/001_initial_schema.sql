-- Chewit Initial Database Schema
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ DECKS TABLE ============
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source_text TEXT NOT NULL,
  topic_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID -- Optional: NULL for anonymous users
);

-- Indexes for decks
CREATE INDEX idx_decks_created_at ON decks(created_at DESC);
CREATE INDEX idx_decks_user_id ON decks(user_id);

-- ============ FLASHCARDS TABLE ============
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for flashcards
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE UNIQUE INDEX idx_flashcards_deck_position ON flashcards(deck_id, position);

-- ============ QUIZ_QUESTIONS TABLE ============
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 strings
  answer INTEGER NOT NULL CHECK (answer BETWEEN 0 AND 3),
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz_questions
CREATE INDEX idx_quiz_questions_deck_id ON quiz_questions(deck_id);
CREATE UNIQUE INDEX idx_quiz_questions_deck_position ON quiz_questions(deck_id, position);

-- ============ QUIZ_SCORES TABLE (Optional - for later) ============
CREATE TABLE quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  incorrect_answers JSONB, -- Array of question indices
  time_taken INTEGER, -- Seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz_scores
CREATE INDEX idx_quiz_scores_deck_id ON quiz_scores(deck_id);
CREATE INDEX idx_quiz_scores_created_at ON quiz_scores(created_at DESC);

-- ============ ROW LEVEL SECURITY ============
-- Enable RLS on all tables
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (anon key)
-- We'll add proper authentication later
CREATE POLICY "Public access for anon users" ON decks
  FOR ALL USING (true);

CREATE POLICY "Public access for anon users" ON flashcards
  FOR ALL USING (true);

CREATE POLICY "Public access for anon users" ON quiz_questions
  FOR ALL USING (true);

CREATE POLICY "Public access for anon users" ON quiz_scores
  FOR ALL USING (true);

-- ============ HELPER FUNCTIONS ============
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to decks table
CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ SUCCESS ============
-- Tables created successfully!
-- Verify: SELECT * FROM decks;
