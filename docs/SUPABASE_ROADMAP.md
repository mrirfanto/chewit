# Chewit — Supabase Integration Roadmap

> Atomic action items for database persistence with Supabase
> Each action item = one git commit
>
> **Goal:** Replace sessionStorage with Supabase for persistent, cross-device deck storage

---

## Phase 1: Database Setup
**Goal:** Supabase project created with tables and policies configured
**Time:** 1 session (~45 minutes)

- [x] **1.1** Create Supabase account and new project
- [x] **1.2** Get environment variables from Supabase dashboard
- [x] **1.3** Install @supabase/supabase-js package
- [x] **1.4** Create `lib/supabase.ts` with Supabase client initialization
- [x] **1.5** Create `decks` table in Supabase SQL Editor
- [x] **1.6** Create `flashcards` table with foreign key to decks
- [x] **1.7** Create `quiz_questions` table with JSONB for options
- [x] **1.8** Enable Row Level Security (RLS) on all tables
- [x] **1.9** Test database connection from Next.js
- [x] **1.10** Verify environment variables are loaded correctly

---

## Phase 2: Database Utilities
**Goal:** Create reusable functions for database operations
**Time:** 1 session (~1 hour)

- [x] **2.1** Create `lib/db.ts` file with database utilities
- [x] **2.2** Define TypeScript interfaces for database rows
- [x] **2.3** Implement `saveDeck()` function to insert deck with flashcards and questions
- [x] **2.4** Implement `getDeck()` function to fetch deck with related data
- [x] **2.5** Implement `listDecks()` function with aggregations
- [x] **2.6** Implement `deleteDeck()` function with cascade
- [x] **2.7** Add `generateTitle()` helper function for auto-naming decks
- [x] **2.8** Add error handling wrapper for database operations
- [x] **2.9** Add TypeScript types for deck with relations
- [x] **2.10** Export all functions and types from `lib/db.ts`

---

## Phase 3: Backend Integration
**Goal:** Update API route to save generated content to Supabase
**Time:** 1 session (~1 hour)

- [x] **3.1** Update `/api/generate` route to import database utilities
- [x] **3.2** Modify API response to include deck creation
- [x] **3.3** Call `saveDeck()` after successful generation
- [x] **3.4** Update API response to return deck ID
- [x] **3.5** Add error handling for database save failures
- [x] **3.6** Add loading state logging for database operations
- [x] **3.7** Update TypeScript types for API response
- [x] **3.8** Add validation that deck was saved successfully
- [x] **3.9** Store deck ID in sessionStorage for easy access
- [x] **3.10** Test full flow: generate → save → verify in Supabase dashboard

---

## Phase 4: Frontend — Deck List
**Goal:** Display saved decks on home page with load/delete actions
**Time:** 1 session (~1.5 hours)

- [x] **4.1** Create `components/decks/DeckList.tsx` component
- [x] **4.2** Add `useEffect` to load decks on component mount
- [x] **4.3** Create deck card component with metadata display
- [x] **4.4** Add loading skeleton for deck list
- [x] **4.5** Add empty state when no decks exist
- [x] **4.6** Add error state for failed loads
- [x] **4.7** Implement delete confirmation dialog
- [x] **4.8** Implement load deck functionality
- [x] **4.9** Add responsive grid layout for deck cards
- [x] **4.10** Integrate DeckList component into home page

---

## Phase 5: Frontend — Deck Management
**Goal:** Complete CRUD operations and polish deck management UX
**Time:** 1 session (~1 hour)

- [x] **5.1** Update `loadMockDataFromSession()` to handle deck ID
- [x] **5.2** Update flashcard page to load from deck ID if available
- [x] **5.3** Update quiz page to load from deck ID if available
- [x] **5.4** Update results page to show deck title
- [x] **5.5** Add "Back to My Decks" button on results page
- [x] **5.6** Add retry functionality with Supabase quiz loading
- [x] **5.9** Add deck title editing functionality
- [x] **5.10** Add deck count badge to home page header

---

## Phase 6: Error Handling & Polish
**Goal:** Robust error handling and excellent UX
**Time:** 1 session (~45 minutes)

- [x] **6.1** Add React Error Boundary to wrap deck operations
- [x] **6.2** Add toast notifications for successful operations
- [x] **6.5** Add loading states to all buttons that trigger DB operations
- [x] **6.7** Add input validation before database operations
- [x] **6.8** Add proper TypeScript error types

---

## Phase 7: Testing & Validation
**Goal:** Ensure everything works end-to-end
**Time:** 1 session (~45 minutes)

- [ ] **7.1** Test full flow: Generate → Save → Load → Study → Delete
- [ ] **7.2** Test with multiple decks (5-10 decks)
- [ ] **7.3** Test concurrent operations
- [ ] **7.4** Test with very large content (10,000 words)
- [ ] **7.5** Test retry wrong answers flow
- [ ] **7.6** Test edge cases in database
- [ ] **7.7** Verify data integrity in Supabase dashboard
- [ ] **7.8** Test mobile responsiveness of deck list
- [ ] **7.9** Test browser localStorage + Supabase together
- [ ] **7.10** Document any bugs or edge cases found

---

## Phase 8: Documentation & Cleanup
**Goal:** Update docs and clean up code
**Time:** 1 session (~30 minutes)

- [x] **8.1** Update STATUS.md with Supabase completion
- [x] **8.2** Update ROADMAP.md to skip localStorage phase
- [x] **8.4** Remove console.log statements from production code
- [x] **8.7** Add JSDoc comments to database utilities
- [x] **8.8** Run TypeScript compiler to check for errors
- [x] **8.9** Run ESLint and fix warnings
- [x] **8.10** Final commit: "feat: complete Supabase integration"

---

## Summary

### Total Implementation
- **8 Phases** (atomic tasks)
- **80 tasks** (each one git commit)
- **~6 hours** total work time

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

**Last Updated:** 2026-03-19
**Status:** 56/80 tasks complete (70%)
