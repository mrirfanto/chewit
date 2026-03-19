CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deck_tags (
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (deck_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_deck_tags_deck_id ON deck_tags(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_tags_tag_id ON deck_tags(tag_id);

INSERT INTO tags (name) VALUES
  ('JavaScript'), ('TypeScript'), ('React'), ('CSS'),
  ('HTML'), ('Node.js'), ('System Design'), ('Performance'),
  ('Accessibility'), ('Testing'), ('Git'), ('Browser APIs')
ON CONFLICT (name) DO NOTHING;
