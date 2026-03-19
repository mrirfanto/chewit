ALTER TABLE decks ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_decks_pinned ON decks(pinned) WHERE pinned = true;
