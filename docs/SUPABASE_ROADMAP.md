# Chewit — Supabase Integration Roadmap

> Atomic action items for database persistence with Supabase
> Each action item = one git commit
>
> **Goal:** Replace sessionStorage with Supabase for persistent, cross-device deck storage

---

## Phase 1: Database Setup
**Goal:** Supabase project created with tables and policies configured
**Time:** 1 session (~45 minutes)

- [ ] **1.1** Create Supabase account and new project
  ```
  1. Go to supabase.com
  2. Sign up/login
  3. Click "New Project"
  4. Name: "chewit" (or preferred name)
  5. Generate strong password (save it!)
  6. Choose region (default: Southeast Asia)
  7. Wait for provisioning (~2 min)
  ```

- [ ] **1.2** Get environment variables from Supabase dashboard
  ```
  Navigate to: Settings → API
  Copy these values to .env.local:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  ```

- [ ] **1.3** Install @supabase/supabase-js package
  ```bash
  npm install @supabase/supabase-js
  ```

- [ ] **1.4** Create `lib/supabase.ts` with Supabase client initialization
  ```typescript
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  export const supabase = createClient(supabaseUrl, supabaseKey);
  ```

- [ ] **1.5** Create `decks` table in Supabase SQL Editor
  ```sql
  CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    source_text TEXT NOT NULL,
    topic_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_decks_created_at ON decks(created_at DESC);
  ```

- [ ] **1.6** Create `flashcards` table with foreign key to decks
  ```sql
  CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
  CREATE UNIQUE INDEX idx_flashcards_deck_position ON flashcards(deck_id, position);
  ```

- [ ] **1.7** Create `quiz_questions` table with JSONB for options
  ```sql
  CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    answer INTEGER NOT NULL CHECK (answer BETWEEN 0 AND 3),
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_quiz_questions_deck_id ON quiz_questions(deck_id);
  CREATE UNIQUE INDEX idx_quiz_questions_deck_position ON quiz_questions(deck_id, position);
  ```

- [ ] **1.8** Enable Row Level Security (RLS) on all tables
  ```sql
  ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

  -- Allow public access (will add auth later)
  CREATE POLICY "Enable all access for users" ON decks FOR ALL USING (true);
  CREATE POLICY "Enable all access for users" ON flashcards FOR ALL USING (true);
  CREATE POLICY "Enable all access for users" ON quiz_questions FOR ALL USING (true);
  ```

- [ ] **1.9** Test database connection from Next.js
  ```typescript
  // Create test route or console.log in page
  import { supabase } from '@/lib/supabase';

  const { data, error } = await supabase.from('decks').select('*').limit(1);
  console.log('Supabase connection test:', { data, error });
  ```

- [ ] **1.10** Verify environment variables are loaded correctly
  ```typescript
  // Add console.log to lib/supabase.ts
  console.log('Supabase URL configured:', !!supabaseUrl);
  console.log('Anon key configured:', !!supabaseKey);
  ```

---

## Phase 2: Database Utilities
**Goal:** Create reusable functions for database operations
**Time:** 1 session (~1 hour)

- [ ] **2.1** Create `lib/db.ts` file with database utilities
  ```typescript
  import { supabase } from './supabase';
  import { Flashcard, Question } from '@/types';

  // Function signatures will be added in subsequent tasks
  ```

- [ ] **2.2** Define TypeScript interfaces for database rows
  ```typescript
  interface DeckRow {
    id: string;
    title: string;
    source_text: string;
    topic_name: string | null;
    created_at: string;
    updated_at: string;
  }

  interface FlashcardRow {
    id: string;
    deck_id: string;
    front: string;
    back: string;
    position: number;
    created_at: string;
  }

  interface QuizQuestionRow {
    id: string;
    deck_id: string;
    question: string;
    options: string[];
    answer: number;
    position: number;
    created_at: string;
  }
  ```

- [ ] **2.3** Implement `saveDeck()` function to insert deck with flashcards and questions
  ```typescript
  interface SaveDeckParams {
    title: string;
    source_text: string;
    topic_name?: string;
    flashcards: Omit<Flashcard, 'id'>[];
    quiz_questions: Omit<Question, 'id'>[];
  }

  export async function saveDeck(params: SaveDeckParams): Promise<DeckRow> {
    // Implementation:
    // 1. Insert deck
    // 2. Insert flashcards with deck_id
    // 3. Insert quiz_questions with deck_id
    // 4. Return created deck
  }
  ```

- [ ] **2.4** Implement `getDeck()` function to fetch deck with related data
  ```typescript
  export async function getDeck(deckId: string): Promise<DeckWithRelations> {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        *,
        flashcards (*),
        quiz_questions (*)
      `)
      .eq('id', deckId)
      .single();

    if (error) throw error;
    return data;
  }
  ```

- [ ] **2.5** Implement `listDecks()` function with aggregations
  ```typescript
  export async function listDecks(): Promise<DeckSummary[]> {
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
  ```

- [ ] **2.6** Implement `deleteDeck()` function with cascade
  ```typescript
  export async function deleteDeck(deckId: string): Promise<void> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) throw error;
  }
  ```

- [ ] **2.7** Add `generateTitle()` helper function for auto-naming decks
  ```typescript
  function generateTitle(sourceText: string): string {
    const words = sourceText.trim().split(/\s+/).slice(0, 5);
    const title = words.join(' ');
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }
  ```

- [ ] **2.8** Add error handling wrapper for database operations
  ```typescript
  export class DatabaseError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'DatabaseError';
    }
  }

  function handleDatabaseError(error: any): never {
    console.error('Database error:', error);
    throw new DatabaseError(
      error.message || 'Database operation failed',
      error.code || 'DB_ERROR'
    );
  }
  ```

- [ ] **2.9** Add TypeScript types for deck with relations
  ```typescript
  interface DeckWithRelations extends DeckRow {
    flashcards: FlashcardRow[];
    quiz_questions: QuizQuestionRow[];
  }

  interface DeckSummary {
    id: string;
    title: string;
    created_at: string;
    flashcards: { count: number };
    quiz_questions: { count: number };
  }
  ```

- [ ] **2.10** Export all functions and types from `lib/db.ts`
  ```typescript
  export type { DeckRow, FlashcardRow, QuizQuestionRow, DeckWithRelations, DeckSummary };
  export { saveDeck, getDeck, listDecks, deleteDeck, generateTitle };
  export { DatabaseError };
  ```

---

## Phase 3: Backend Integration
**Goal:** Update API route to save generated content to Supabase
**Time:** 1 session (~1 hour)

- [ ] **3.1** Update `/api/generate` route to import database utilities
  ```typescript
  import { saveDeck, generateTitle } from '@/lib/db';
  ```

- [ ] **3.2** Modify API response to include deck creation
  ```typescript
  // After generating flashcards and quiz
  const deckData = {
    title: validated.topicName || generateTitle(validated.sourceText),
    source_text: validated.sourceText,
    topic_name: validated.topicName,
    flashcards: flashcards.map(fc => ({
      front: fc.front,
      back: fc.back
    })),
    quiz_questions: quiz,
  };
  ```

- [ ] **3.3** Call `saveDeck()` after successful generation
  ```typescript
  const savedDeck = await saveDeck(deckData);
  ```

- [ ] **3.4** Update API response to return deck ID
  ```typescript
  return NextResponse.json({
    deckId: savedDeck.id,
    flashcards,
    quiz,
  });
  ```

- [ ] **3.5** Add error handling for database save failures
  ```typescript
  try {
    const savedDeck = await saveDeck(deckData);
  } catch (dbError) {
    console.error('Failed to save deck:', dbError);
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_ERROR',
          message: 'Generated content but failed to save to database',
          details: dbError.message
        }
      },
      { status: 500 }
    );
  }
  ```

- [ ] **3.6** Add loading state logging for database operations
  ```typescript
  console.log('Saving deck to database...');
  const savedDeck = await saveDeck(deckData);
  console.log('Deck saved:', savedDeck.id);
  ```

- [ ] **3.7** Update TypeScript types for API response
  ```typescript
  interface GenerateResponse {
    deckId: string;
    flashcards: Flashcard[];
    quiz: Question[];
  }
  ```

- [ ] **3.8** Add validation that deck was saved successfully
  ```typescript
  if (!savedDeck || !savedDeck.id) {
    throw new Error('Failed to save deck: No ID returned');
  }
  ```

- [ ] **3.9** Store deck ID in sessionStorage for easy access
  ```typescript
  // In home page handleGenerate, update session storage
  const sessionData = {
    deckId: data.deckId,
    flashcards: data.flashcards,
    quiz: data.quiz,
  };
  sessionStorage.setItem('chewit_study_data', JSON.stringify(sessionData));
  ```

- [ ] **3.10** Test full flow: generate → save → verify in Supabase dashboard
  ```
  1. Generate flashcards from content
  2. Check Supabase dashboard → Table Editor → decks
  3. Verify row was created
  4. Check flashcards and quiz_questions tables
  5. Verify related data was inserted
  ```

---

## Phase 4: Frontend — Deck List
**Goal:** Display saved decks on home page with load/delete actions
**Time:** 1 session (~1.5 hours)

- [ ] **4.1** Create `components/decks/DeckList.tsx` component
  ```typescript
  interface DeckListProps {
    onLoadDeck: (deckId: string) => void;
  }

  export function DeckList({ onLoadDeck }: DeckListProps) {
    const [decks, setDecks] = useState<DeckSummary[]>([]);
    const [loading, setLoading] = useState(true);
    // Implementation...
  }
  ```

- [ ] **4.2** Add `useEffect` to load decks on component mount
  ```typescript
  useEffect(() => {
    async function loadDecks() {
      try {
        const data = await listDecks();
        setDecks(data);
      } catch (error) {
        console.error('Failed to load decks:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDecks();
  }, []);
  ```

- [ ] **4.3** Create deck card component with metadata display
  ```typescript
  function DeckCard({ deck, onLoad, onDelete }: DeckCardProps) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold">{deck.title}</h3>
        <p className="text-sm text-slate-500">
          {deck.flashcards.count} flashcards • {deck.quiz_questions.count} questions
        </p>
        <p className="text-xs text-slate-400">
          {new Date(deck.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onLoad(deck.id)}>Study</Button>
          <Button variant="outline" onClick={() => onDelete(deck.id)}>Delete</Button>
        </div>
      </Card>
    );
  }
  ```

- [ ] **4.4** Add loading skeleton for deck list
  ```typescript
  {loading ? (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  ) : (
    <div className="grid gap-4">
      {decks.map(deck => <DeckCard key={deck.id} deck={deck} />)}
    </div>
  )}
  ```

- [ ] **4.5** Add empty state when no decks exist
  ```typescript
  {!loading && decks.length === 0 && (
    <Card className="p-12 text-center">
      <p className="text-slate-500">No decks yet. Generate your first deck to get started!</p>
    </Card>
  )}
  ```

- [ ] **4.6** Add error state for failed loads
  ```typescript
  const [error, setError] = useState<string | null>(null);

  {error && (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )}
  ```

- [ ] **4.7** Implement delete confirmation dialog
  ```typescript
  const handleDelete = async (deckId: string, deckTitle: string) => {
    const confirmed = confirm(`Delete "${deckTitle}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteDeck(deckId);
      // Refresh list
      const updated = await listDecks();
      setDecks(updated);
    } catch (error) {
      setError('Failed to delete deck');
    }
  };
  ```

- [ ] **4.8** Implement load deck functionality
  ```typescript
  const handleLoadDeck = async (deckId: string) => {
    try {
      setLoading(true);
      const deck = await getDeck(deckId);

      // Save to sessionStorage
      const sessionData = {
        deckId: deck.id,
        flashcards: deck.flashcards,
        quiz: deck.quiz_questions,
      };
      sessionStorage.setItem('chewit_study_data', JSON.stringify(sessionData));

      // Navigate to flashcards
      router.push('/study/flashcards');
    } catch (error) {
      setError('Failed to load deck');
    } finally {
      setLoading(false);
    }
  };
  ```

- [ ] **4.9** Add responsive grid layout for deck cards
  ```typescript
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {decks.map(deck => <DeckCard key={deck.id} deck={deck} />)}
  </div>
  ```

- [ ] **4.10** Integrate DeckList component into home page
  ```typescript
  // In app/page.tsx
  import { DeckList } from '@/components/decks/DeckList';

  // Add DeckList section below the input form
  <section className="mt-12">
    <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Decks</h2>
    <DeckList
      onLoadDeck={(deckId) => {
        // Load deck and navigate to study
      }}
    />
  </section>
  ```

---

## Phase 5: Frontend — Deck Management
**Goal:** Complete CRUD operations and polish deck management UX
**Time:** 1 session (~1 hour)

- [ ] **5.1** Update `loadMockDataFromSession()` to handle deck ID
  ```typescript
  // In mocks/data.ts
  export function loadDeckFromSession(): { deckId?: string } | null {
    if (typeof window === 'undefined') return null;

    const data = sessionStorage.getItem('chewit_study_data');
    if (!data) return null;

    return JSON.parse(data);
  }
  ```

- [ ] **5.2** Update flashcard page to load from deck ID if available
  ```typescript
  // In app/study/flashcards/page.tsx
  useEffect(() => {
    const sessionData = loadDeckFromSession();
    if (sessionData?.flashcards) {
      setFlashcards(sessionData.flashcards);
    } else {
      router.push('/');
    }
  }, [router]);
  ```

- [ ] **5.3** Update quiz page to load from deck ID if available
  ```typescript
  // In app/study/quiz/page.tsx
  useEffect(() => {
    const sessionData = loadDeckFromSession();
    if (sessionData?.quiz) {
      setQuestions(sessionData.quiz);
    } else {
      router.push('/');
    }
  }, [router]);
  ```

- [ ] **5.4** Update results page to show deck title
  ```typescript
  // In app/study/results/page.tsx
  const [deckTitle, setDeckTitle] = useState<string>('');

  useEffect(() => {
    const sessionData = loadDeckFromSession();
    if (sessionData?.deckId) {
      // Optionally fetch deck metadata
      setDeckTitle('Deck Title'); // or fetch from DB
    }
  }, []);
  ```

- [ ] **5.5** Add "Back to My Decks" button on results page
  ```typescript
  <Button variant="ghost" onClick={() => router.push('/')}>
    <Home className="w-4 h-4 mr-2" />
    Back to My Decks
  </Button>
  ```

- [ ] **5.6** Add retry functionality with Supabase quiz loading
  ```typescript
  // When retrying wrong answers, reload specific deck
  const handleRetryWrong = async () => {
    const sessionData = loadDeckFromSession();
    if (!sessionData?.deckId) return;

    const deck = await getDeck(sessionData.deckId);
    const wrongQuestions = deck.quiz_questions.filter(q =>
      results.incorrectAnswers.includes(q.position)
    );

    // Save filtered questions and navigate
    const retryData = {
      ...sessionData,
      quiz: wrongQuestions,
    };
    sessionStorage.setItem('chewit_study_data', JSON.stringify(retryData));
    router.push('/study/quiz');
  };
  ```

- [ ] **5.7** Add optimistic delete to DeckList (remove from UI immediately)
  ```typescript
  const handleDeleteOptimistic = async (deckId: string) => {
    // Remove from UI immediately
    setDecks(prev => prev.filter(d => d.id !== deckId));

    try {
      await deleteDeck(deckId);
    } catch (error) {
      // Revert on error
      setError('Failed to delete deck');
      // Reload to restore state
      const updated = await listDecks();
      setDecks(updated);
    }
  };
  ```

- [ ] **5.8** Add "Delete All Decks" button for easy cleanup
  ```typescript
  const handleDeleteAll = async () => {
    const confirmed = confirm('Delete ALL decks? This cannot be undone.');
    if (!confirmed) return;

    try {
      await Promise.all(decks.map(deck => deleteDeck(deck.id)));
      setDecks([]);
    } catch (error) {
      setError('Failed to delete decks');
    }
  };
  ```

- [ ] **5.9** Add deck title editing functionality
  ```typescript
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEdit = async (deckId: string, newTitle: string) => {
    const { error } = await supabase
      .from('decks')
      .update({ title: newTitle })
      .eq('id', deckId);

    if (!error) {
      // Refresh list
      const updated = await listDecks();
      setDecks(updated);
    }
  };
  ```

- [ ] **5.10** Add deck count badge to home page header
  ```typescript
  // In home page, show number of saved decks
  <Badge variant="secondary">
    {decks.length} {decks.length === 1 ? 'Deck' : 'Decks'}
  </Badge>
  ```

---

## Phase 6: Error Handling & Polish
**Goal:** Robust error handling and excellent UX
**Time:** 1 session (~45 minutes)

- [ ] **6.1** Add React Error Boundary to wrap deck operations
  ```typescript
  // components/ErrorBoundary.tsx
  class DeckErrorBoundary extends React.Component {
    // Catch errors in deck operations
  }
  ```

- [ ] **6.2** Add toast notifications for successful operations
  ```bash
  npm install react-hot-toast
  ```
  ```typescript
  import toast from 'react-hot-toast';

  toast.success('Deck saved successfully!');
  toast.error('Failed to save deck');
  ```

- [ ] **6.3** Add retry logic for failed database operations
  ```typescript
  async function operationWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 2
  ): Promise<T> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries) throw error;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
    throw new Error('Operation failed after retries');
  }
  ```

- [ ] **6.4** Handle offline mode gracefully
  ```typescript
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  {!isOnline && (
    <Alert>Offline mode. Check your connection.</Alert>
  )}
  ```

- [ ] **6.5** Add loading states to all buttons that trigger DB operations
  ```typescript
  <Button
    onClick={handleLoad}
    disabled={loading}
    className="min-h-[44px]"
  >
    {loading ? <Loader2 className="animate-spin" /> : 'Study'}
  </Button>
  ```

- [ ] **6.6** Add database size monitoring
  ```typescript
  // Log storage usage
  const { count } = await supabase
    .from('decks')
    .select('*', { count: 'exact', head: true });

  console.log(`Total decks: ${count}`);
  ```

- [ ] **6.7** Add input validation before database operations
  ```typescript
  if (!deckId || deckId === 'undefined') {
    throw new Error('Invalid deck ID');
  }
  ```

- [ ] **6.8** Add proper TypeScript error types
  ```typescript
  export class DatabaseError extends Error {
    constructor(message: string, public code: string, public originalError?: unknown) {
      super(message);
      this.name = 'DatabaseError';
    }
  }
  ```

- [ ] **6.9** Add error messages that suggest user actions
  ```typescript
  if (error.code === '23505') {
    return 'Database is full. Please delete some old decks.';
  }
  if (error.code === '23503') {
    return 'Connection issue. Please check your internet.';
  }
  ```

- [ ] **6.10** Test all error states (offline, DB full, network timeout)
  ```
  1. Test with no internet connection
  2. Test with invalid deck ID
 3. Test rapid delete operations
  4. Test with very large content
  5. Test concurrent operations
  ```

---

## Phase 7: Testing & Validation
**Goal:** Ensure everything works end-to-end
**Time:** 1 session (~45 minutes)

- [ ] **7.1** Test full flow: Generate → Save → Load → Study → Delete
  ```
  1. Generate flashcards from content
  2. Verify deck appears in list
  3. Click "Study" to load deck
 4. Complete flashcard review
  5. Complete quiz
  6. View results
   7. Return home and verify deck still exists
  8. Delete deck
  9. Verify it's removed from list
  ```

- [ ] **7.2** Test with multiple decks (5-10 decks)
  ```
  1. Generate multiple different decks
  2. Verify all appear in deck list
  3. Switch between decks
  4. Study multiple decks in sequence
  5. Verify correct data loads each time
  ```

- [ ] **7.3** Test concurrent operations
  ```
  1. Generate deck A
  2. While A is generating, start deck B
  3. Verify both save correctly
  4. Delete deck A while studying deck B
  5. Verify no conflicts
  ```

- [ ] **7.4** Test with very large content (10,000 words)
  ```
  1. Paste maximum length content
  2. Generate and save
  3. Verify database accepts it
  4. Load and study normally
  ```

- [ ] **7.5** Test retry wrong answers flow
  ```
  1. Generate deck and take quiz
  2. Get some questions wrong
  3. Click "Retry Wrong Answers"
  4. Verify only wrong questions load
   5. Complete retry successfully
  ```

- [ ] **7.6** Test edge cases in database
  ```
  1. Load non-existent deck ID
  2. Delete already deleted deck
  3. Save deck with empty title
  4. Save deck with special characters in title
  ```

- [ ] **7.7** Verify data integrity in Supabase dashboard
  ```
  1. Check Table Editor → decks
  2. Verify all data looks correct
  3. Check foreign key relationships
  4. Verify cascade delete works
  ```

- [ ] **7.8** Test mobile responsiveness of deck list
  ```
  1. Open on mobile viewport
  2. Verify cards stack vertically
  3. Test touch targets (min 44px)
  4. Verify delete button accessible
  ```

- [ ] **7.9** Test browser localStorage + Supabase together
  ```
  1. Clear localStorage
  2. Generate new deck
  3. Refresh page
  4. Verify deck still loads from Supabase
  5. Verify sessionStorage re-populates
  ```

- [ ] **7.10** Document any bugs or edge cases found
  ```
  Update docs/ISSUES.md or docs/STATUS.md with:
  - Bugs found
  - How they were resolved
  - Any remaining issues
  - Lessons learned
  ```

---

## Phase 8: Documentation & Cleanup
**Goal:** Update docs and clean up code
**Time:** 1 session (~30 minutes)

- [ ] **8.1** Update STATUS.md with Supabase completion
  ```
  - Mark phases as complete
  - Update progress to 87/153 tasks (57%)
  - Add session log entries
  ```

- [ ] **8.2** Update ROADMAP.md to skip localStorage phase
  ```
  - Mark Phase 5 (localStorage) as "SKIPPED"
  - Note decision to use Supabase instead
  - Reference SUPABASE_PLAN.md
  ```

- [ ] **8.3** Add README section on Supabase setup
  ```markdown
  ## Database Setup

  1. Create Supabase project
  2. Run SQL scripts from docs/database.sql
  3. Add environment variables
   ```
  ```

- [ ] **8.4** Remove console.log statements from production code
  ```typescript
  // Remove or comment out debugging logs
  // console.log('Raw flashcard response:', ...);
  ```

- [ ] **8.5** Add TypeScript strict mode checks for database code
  ```typescript
  // Ensure all DB functions have proper types
  // No 'any' types in database operations
  ```

- [ ] **8.6** Clean up unused imports
  ```typescript
  // Remove any unused imports in DB files
  // Organize imports by type
  ```

- [ ] **8.7** Add JSDoc comments to database utilities
  ```typescript
  /**
   * Saves a deck with flashcards and quiz questions to Supabase
   * @param params - Deck data including title, content, flashcards, quiz
   * @returns Created deck with ID
   * @throws DatabaseError if save fails
   */
  export async function saveDeck(params: SaveDeckParams): Promise<DeckRow>
  ```

- [ ] **8.8** Run TypeScript compiler to check for errors
  ```bash
  npx tsc --noEmit
  ```

- [ ] **8.9** Run ESLint and fix warnings
  ```bash
  npm run lint
  ```

- [ ] **8.10** Final commit: "feat: complete Supabase integration"
  ```bash
  git add .
  git commit -m "feat: complete Supabase integration

  All 8 phases (80 tasks) complete
  - Database setup with tables and RLS
  - Database utilities for CRUD operations
  - API route integration
  - Deck list component
  - Full CRUD functionality
  - Error handling and retry logic
  - Tested end-to-end

  Progress: 87/153 tasks (57%)
  Time: ~6 hours"
  ```

---

## Summary

### Total Implementation
- **8 Phases** (atomic tasks)
- **80 tasks** (each one git commit)
- **~6 hours** total work time
- **57% of MVP complete** (87/153 tasks)

### What You Get
✅ Persistent deck storage (PostgreSQL database)
✅ Cross-device access to your decks
✅ Scalable to millions of decks
✅ Ready for future features (auth, sharing, real-time)
✅ Production-ready database with proper error handling

### Next After Supabase
- Add authentication (Supabase Auth)
- Add score history tracking
- Deploy to Vercel
- Share with friends!

---

**Last Updated:** 2026-03-06
**Status:** 📝 Ready to begin implementation
