# Chewit — Supabase Integration Plan

> **Goal:** Replace sessionStorage with Supabase for persistent, cross-device storage
> **Status:** Planning
> **Created:** 2026-03-06

---

## Table of Contents

1. [Why Supabase?](#why-supabase)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [Supabase Setup](#supabase-setup)
5. [Implementation Phases](#implementation-phases)
6. [Security Considerations](#security-considerations)
7. [Migration Strategy](#migration-strategy)

---

## Why Supabase?

### Advantages Over localStorage

| Feature | localStorage | Supabase |
|---------|-------------|----------|
| **Storage Limit** | 5-10 MB | 1 GB (free tier) |
| **Persistence** | Per browser, can be cleared | Cloud database, permanent |
| **Cross-Device** | ❌ No | ✅ Yes |
| **Backend** | ❌ None needed | ✅ PostgreSQL + Auth |
| **Real-time** | ❌ No | ✅ Yes |
| **Querying** | ❌ Manual key-value | ✅ Powerful SQL |
| **Cost** | Free | Free tier generous |

### Why Supabase Over Firebase?

- **PostgreSQL** vs NoSQL — familiar SQL queries
- **Built-in Auth** — easy user authentication later
- **Row Level Security** — data security at DB level
- **Real-time subscriptions** — potential for future features
- **Open source** — self-hostable if needed

---

## Architecture Overview

### Current State (SessionStorage)

```
Home Page → API Generate → SessionStorage → Study Pages
                              ↓
                         Lost on refresh
```

### Future State (Supabase)

```
Home Page → API Generate → Supabase DB → Study Pages
                          ↓
                    Stored permanently
                          ↓
                    Accessible from any device
```

---

## Database Schema

### Tables

#### 1. `decks` Table
```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source_text TEXT NOT NULL,
  topic_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: NULL for anonymous users
);

-- Indexes
CREATE INDEX idx_decks_created_at ON decks(created_at DESC);
CREATE INDEX idx_decks_user_id ON decks(user_id);
```

#### 2. `flashcards` Table
```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
);

-- Indexes
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE UNIQUE INDEX idx_flashcards_deck_position ON flashcards(deck_id, position);
```

#### 3. `quiz_questions` Table
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 strings
  answer INTEGER NOT NULL CHECK (answer BETWEEN 0 AND 3),
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
);

-- Indexes
CREATE INDEX idx_quiz_questions_deck_id ON quiz_questions(deck_id);
CREATE UNIQUE INDEX idx_quiz_questions_deck_position ON quiz_questions(deck_id, position);
```

#### 4. `quiz_scores` Table (Optional - for later)
```sql
CREATE TABLE quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  incorrect_answers JSONB, -- Array of question indices
  time_taken INTEGER, -- Seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
);

-- Indexes
CREATE INDEX idx_quiz_scores_deck_id ON quiz_scores(deck_id);
CREATE INDEX idx_quiz_scores_created_at ON quiz_scores(created_at DESC);
```

### Relationships

```
decks (1) ----< (N) flashcards
  |
  +----< (N) quiz_questions
  |
  +----< (N) quiz_scores (future)
```

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `chewit` (or your preferred name)
4. Database Password: Generate strong password, save it!
5. Region: Choose closest to your users (default: Southeast Asia)
6. Wait for project provisioning (~2 minutes)

### 2. Get Environment Variables

From Supabase dashboard → Settings → API:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Keep secret!
```

### 3. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 4. Create Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## Implementation Phases

### Phase 1: Database Setup (30 min)

**Tasks:**
- [ ] Create Supabase project
- [ ] Set up environment variables
- [ ] Install @supabase/supabase-js
- [ ] Create database tables (SQL or UI)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Test database connection

**Deliverable:**
- Database schema created in Supabase
- Environment variables configured
- Supabase client initialized

---

### Phase 2: Backend Integration (1 hour)

**Tasks:**
- [ ] Create `lib/supabase.ts` with client
- [ ] Create `lib/db.ts` with database functions:
  - `saveDeck(deckData)` - Insert deck + flashcards + questions
  - `getDeck(id)` - Fetch deck with related data
  - `listDecks()` - Get all decks (sorted by created_at)
  - `deleteDeck(id)` - Remove a deck
- [ ] Update `/api/generate` route to save to Supabase
- [ ] Add error handling for DB failures

**API Changes:**

```typescript
// After generating flashcards + quiz
const deckData = {
  title: topicName || generateTitle(sourceText),
  source_text: sourceText,
  topic_name: topicName,
  flashcards: generatedFlashcards,
  quiz_questions: generatedQuiz,
};

const savedDeck = await saveDeck(deckData);
return NextResponse.json({ deckId: savedDeck.id, ...deckData });
```

**Deliverable:**
- Database utility functions
- API route saves to Supabase
- Deck ID returned to frontend

---

### Phase 3: Frontend Updates (1.5 hours)

**Tasks:**

#### 3.1 Update Home Page
- [ ] Display saved decks list
- [ ] Add "Load" button to each deck
- [ ] Add "Delete" button with confirmation
- [ ] Show empty state when no decks
- [ ] Add loading states for DB operations

#### 3.2 Update Study Pages
- [ ] Load from Supabase instead of sessionStorage
- [ ] Handle deck not found errors
- [ ] Add "Save this Deck" button (for generated but unsaved)

#### 3.3 Create Deck List Component

```typescript
// components/decks/DeckList.tsx
interface Deck {
  id: string;
  title: string;
  created_at: string;
  flashcards_count: number;
  quiz_count: number;
}

function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const data = await listDecks();
    setDecks(data);
  };

  return (
    <div className="grid gap-4">
      {decks.map(deck => (
        <Card key={deck.id}>
          <h3>{deck.title}</h3>
          <p>{deck.flashcards_count} flashcards • {deck.quiz_count} questions</p>
          <Button onClick={() => loadDeck(deck.id)}>Study</Button>
          <Button onClick={() => deleteDeck(deck.id)}>Delete</Button>
        </Card>
      ))}
    </div>
  );
}
```

**Deliverable:**
- Home page shows saved decks
- Study pages load from DB
- Full CRUD operations working

---

### Phase 4: Polish & Error Handling (30 min)

**Tasks:**
- [ ] Add loading skeletons
- [ ] Handle network errors gracefully
- [ ] Add retry logic for failed DB operations
- [ ] Show user-friendly error messages
- [ ] Add success notifications (toast)
- [ ] Test on mobile

**Deliverable:**
- Robust error handling
- Good UX for all states
- Mobile responsive

---

### Phase 5: Testing (30 min)

**Tasks:**
- [ ] Create deck → save → load → study → delete
- [ ] Test with multiple decks
- [ ] Test pagination (if many decks)
- [ ] Test offline behavior (what if no internet?)
- [ ] Test concurrent saves
- [ ] Verify data integrity

**Deliverable:**
- All flows tested
- Known issues documented
- Ready for production

---

## Security Considerations

### Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- For now, allow all public access (anon key)
-- We'll add authentication later
CREATE POLICY "Public access for anon users" ON decks
  FOR ALL USING (true);

CREATE POLICY "Public access for anon users" ON flashcards
  FOR ALL USING (true);

CREATE POLICY "Public access for anon users" ON quiz_questions
  FOR ALL USING (true);

CREATE POLICY "Public access for anon users" ON quiz_scores
  FOR ALL USING (true);
```

### Future: Add Authentication

When ready to add user accounts:

```sql
-- Enable RLS for user-owned data
CREATE POLICY "Users can view own decks" ON decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON decks
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Migration Strategy

### Current Flow

```
User generates content
  ↓
Saved to sessionStorage
  ↓
Study session
  ↓
Lost on refresh
```

### New Flow

```
User generates content
  ↓
Saved to Supabase (permanent)
  ↓
Deck ID returned
  ↓
Study session (load from DB by ID)
  ↓
Deck persists across sessions
```

### Backward Compatibility

- Keep sessionStorage as cache
- If Supabase fails, fallback to sessionStorage
- Show warning if DB unavailable

---

## Database Utility Functions

### lib/db.ts

```typescript
import { supabase } from './supabase';
import { Flashcard, Question } from '@/types';

interface SaveDeckParams {
  title: string;
  source_text: string;
  topic_name?: string;
  flashcards: Omit<Flashcard, 'id'>[];
  quiz_questions: Omit<Question, 'id'>[];
}

export async function saveDeck(params: SaveDeckParams) {
  // 1. Create deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({
      title: params.title,
      source_text: params.source_text,
      topic_name: params.topic_name,
    })
    .select()
    .single();

  if (deckError) throw deckError;

  // 2. Create flashcards
  const flashcardsWithDeckId = params.flashcards.map((fc, index) => ({
    deck_id: deck.id,
    front: fc.front,
    back: fc.back,
    position: index,
  }));

  const { error: flashcardsError } = await supabase
    .from('flashcards')
    .insert(flashcardsWithDeckId);

  if (flashcardsError) throw flashcardsError;

  // 3. Create quiz questions
  const questionsWithDeckId = params.quiz_questions.map((q, index) => ({
    deck_id: deck.id,
    question: q.question,
    options: q.options,
    answer: q.answer,
    position: index,
  }));

  const { error: questionsError } = await supabase
    .from('quiz_questions')
    .insert(questionsWithDeckId);

  if (questionsError) throw questionsError;

  return deck;
}

export async function getDeck(deckId: string) {
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select(`
      *,
      flashcards (*),
      quiz_questions (*)
    `)
    .eq('id', deckId)
    .single();

  if (deckError) throw deckError;

  return deck;
}

export async function listDecks() {
  const { data, error } = await supabase
    .from('decks')
    .select(`
      id,
      title,
      created_at,
      flashcards (count),
      quiz_questions (count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

export async function deleteDeck(deckId: string) {
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId);

  if (error) throw error;
}
```

---

## API Route Updates

### /api/generate/route.ts

```typescript
import { saveDeck } from '@/lib/db';

// After generating flashcards and quiz
const deckData = {
  title: validated.topicName || generateTitle(validated.sourceText),
  source_text: validated.sourceText,
  topic_name: validated.topicName,
  flashcards: flashcards,
  quiz_questions: quiz,
};

// Save to Supabase
const savedDeck = await saveDeck(deckData);

// Return deck ID
return NextResponse.json({
  deckId: savedDeck.id,
  flashcards,
  quiz,
});

// Helper function
function generateTitle(sourceText: string): string {
  // Generate title from first few words
  const words = sourceText.trim().split(/\s+/).slice(0, 5);
  return words.join(' ') + '...';
}
```

---

## Time Estimate

| Phase | Time | Difficulty |
|-------|------|------------|
| 1. Database Setup | 30 min | Easy |
| 2. Backend Integration | 1 hour | Medium |
| 3. Frontend Updates | 1.5 hours | Medium |
| 4. Polish & Error Handling | 30 min | Easy |
| 5. Testing | 30 min | Easy |
| **Total** | **4 hours** | |

---

## Success Criteria

- [ ] Decks are saved to Supabase after generation
- [ ] Saved decks appear on home page
- [ ] Clicking a deck loads it for studying
- [ ] Decks persist across browser sessions
- [ ] Can delete unwanted decks
- [ ] Error handling for network failures
- [ ] Mobile responsive deck list

---

## Next Steps After Supabase

Once Supabase is working:

1. **Add Authentication** (Supabase Auth)
   - User sign up/login
   - User-specific decks
   - Row level security

2. **Add Score History**
   - Save quiz scores to `quiz_scores` table
   - Show progress over time
   - Compare attempts

3. **Add Real-time Features**
   - Subscribe to deck changes
   - Live updates across devices

4. **Deploy to Production**
   - Vercel deployment
   - Environment variables
   - Test with real users

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Supabase downtime | Low | Fallback to sessionStorage |
| Free tier limits | Low | Monitor usage, upgrade if needed |
| Complex queries | Low | Use Supabase's query builder |
| Migration issues | Low | Keep sessionStorage as cache |

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Starter](https://supabase.com/docs/guides/with-nextjs)

---

**Status:** 📝 Planning — Ready to begin implementation
**Last Updated:** 2026-03-06
