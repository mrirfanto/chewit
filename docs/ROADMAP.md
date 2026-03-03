# Chewit — Implementation Roadmap

> Atomic action items organized into single-work-session phases
> Each action item = one git commit
>
> **UI/UX-First Approach:** Phase 2 builds the entire study flow with mock data before touching the API. This validates the user experience works well before investing in backend integration.

---

## Phase 0: Foundation Setup
**Goal:** Project scaffolded with all dependencies installed and basic routing structure
**Time:** 1 session (~2 hours)

- [ ] **0.1** Initialize Next.js 14 project with TypeScript and Tailwind
  ```bash
  npx create-next-app@latest chewit --typescript --tailwind --app --eslint
  ```
- [ ] **0.2** Install shadcn/ui and initialize components
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] **0.3** Add essential shadcn components (Button, Card, Input, Textarea, Progress)
  ```bash
  npx shadcn-ui@latest add button card input textarea progress
  ```
- [ ] **0.4** Create `.env.local` with ANTHROPIC_API_KEY placeholder and add to `.gitignore`
- [ ] **0.5** Install Anthropic SDK
  ```bash
  npm install @anthropic-ai/sdk
  ```
- [ ] **0.6** Define TypeScript types in `types/index.ts` (Flashcard, Question, Deck)
- [ ] **0.7** Create route structure: empty pages for `/`, `/study/flashcards`, `/study/quiz`, `/study/results`
- [ ] **0.8** Add simple navigation header component with logo/title

---

## Phase 1: Home Page + Content Input
**Goal:** Users can paste text and see character count
**Time:** 1 session (~2 hours)

- [ ] **1.1** Create centered layout container for home page
- [ ] **1.2** Add textarea component with placeholder text and max-length validation
- [ ] **1.3** Implement character/word count indicator (recommended: 500–5000 words)
- [ ] **1.4** Add "Generate Flashcards" button with disabled state for empty/short input
- [ ] **1.5** Add "Clear" button to reset textarea
- [ ] **1.6** Style the input form with card component and proper spacing
- [ ] **1.7** Add validation: show error if input < 200 words or > 10000 words
- [ ] **1.8** Add loading spinner component (hidden by default)

---

## Phase 2: UI/UX with Mock Data
**Goal:** Build entire study flow with static data to validate UX before API integration
**Time:** 2 sessions (~4 hours)

- [ ] **2.1** Create mock data file with sample flashcards and quiz questions
- [ ] **2.2** Create flashcard card component with front/back faces
- [ ] **2.3** Display current card index and total count ("Card 3 of 10")
- [ ] **2.4** Add "Previous" and "Next" navigation buttons
- [ ] **2.5** Implement card state: current index, track visited cards
- [ ] **2.6** Add progress bar component showing visited/total cards
- [ ] **2.7** Handle edge cases: disable Previous on first card, Next on last
- [ ] **2.8** Style flashcard with proper aspect ratio and centering
- [ ] **2.9** Create card front/back face structure with CSS 3D preserve-3d
- [ ] **2.10** Add flip state (boolean) to flashcard component
- [ ] **2.11** Implement CSS rotation on flip state change with 0.6s ease
- [ ] **2.12** Add backface-visibility to hide opposite side during rotation
- [ ] **2.13** Add click handler to toggle flip on card click
- [ ] **2.14** Add keyboard handler: Space bar toggles flip
- [ ] **2.15** Reset flip to false when navigating to next/previous card
- [ ] **2.16** Add "Click to reveal" hint text that disappears after first flip
- [ ] **2.17** Create quiz layout: question text + 4 option buttons
- [ ] **2.18** Display current question index ("Question 2 of 5")
- [ ] **2.19** Implement quiz state: current index, selected answer, score tracking
- [ ] **2.20** Add click handler for option buttons (selects answer)
- [ ] **2.21** Style options as clickable buttons with hover states
- [ ] **2.22** Handle question navigation: show questions sequentially
- [ ] **2.23** Add visual feedback: highlight correct option in green on selection
- [ ] **2.24** Add visual feedback: highlight wrong selection in red, reveal correct
- [ ] **2.25** Track incorrect answers (store question + correct answer)
- [ ] **2.26** Calculate running score as user progresses
- [ ] **2.27** Add "Next" button (appears after selecting answer)
- [ ] **2.28** On last question, change "Next" button to "See Results"
- [ ] **2.29** Create results page layout with score display
- [ ] **2.30** Display final score (X/5 with percentage)
- [ ] **2.31** Add score band indicator: 🏆 Excellent / 👍 Good / 🔄 Review
- [ ] **2.32** List incorrect questions with correct answers shown
- [ ] **2.33** Add action buttons: "Back to Home", "Try Again"
- [ ] **2.34** Add "Take the Quiz →" button on flashcards page (shows after viewing all cards)
- [ ] **2.35** Add navigation flow: flashcards → quiz → results → home
- [ ] **2.36** Add "Back to Flashcards" link on quiz page
- [ ] **2.37** Test full study flow with mock data: home → flashcards → quiz → results
- [ ] **2.38** Add session timer (display only, starts on first flashcard)
- [ ] **2.39** Display time taken on results screen
- [ ] **2.40** Add shuffle button to randomize flashcard order

---

## Phase 3: API Route + Claude Integration
**Goal:** Backend generates flashcards and quiz from input text
**Time:** 1 session (~3 hours)

- [ ] **3.1** Create `/api/generate/route.ts` with basic POST handler structure
- [ ] **3.2** Add Zod validation schema for request body (sourceText, optional topicName)
- [ ] **3.3** Create flashcard generation prompt with strict JSON output instructions
- [ ] **3.4** Create MCQ quiz generation prompt with strict JSON output instructions
- [ ] **3.5** Implement Anthropic client initialization with API key from env
- [ ] **3.6** Build flashcard generation function with retry logic (max 2 attempts)
- [ ] **3.7** Build MCQ quiz generation function with retry logic (max 2 attempts)
- [ ] **3.8** Add JSON parsing with markdown code-block cleanup (handles ```json wrapper)
- [ ] **3.9** Add response validation against TypeScript schemas
- [ ] **3.10** Return structured response: `{ flashcards, quiz }` or error with details
- [ ] **3.11** Test endpoint with curl/Postman using real API key

---

## Phase 4: Connect Frontend to API
**Goal:** Replace mock data with real API-generated content
**Time:** 1 session (~2 hours)

- [ ] **4.1** Add form submission handler to home page
- [ ] **4.2** Call `/api/generate` on form submit with error handling
- [ ] **4.3** Show loading state during generation (spinner + "Generating..." text)
- [ ] **4.4** Store generated data in sessionStorage (temporary, survives redirect)
- [ ] **4.5** Handle API errors: show user-friendly error message with retry button
- [ ] **4.6** On success, redirect to `/study/flashcards`
- [ ] **4.7** Update flashcard page to load from sessionStorage instead of mock data
- [ ] **4.8** Update quiz page to load from sessionStorage instead of mock data
- [ ] **4.9** Update results page to load from sessionStorage instead of mock data
- [ ] **4.10** Test full flow: paste text → generate → flashcards → quiz → results

---

## Phase 5: localStorage Persistence
**Goal:** Save decks so they survive page refresh
**Time:** 1 session (~2 hours)

- [ ] **5.1** Create localStorage utility functions with try-catch error handling
- [ ] **5.2** Generate unique ID for each deck (use crypto.randomUUID())
- [ ] **5.3** Save generated deck to localStorage on API success
- [ ] **5.4** Load saved decks from localStorage on home page mount
- [ ] **5.5** Display saved decks as list of cards on home page
- [ ] **5.6** Add "Load" button on each saved deck card
- [ ] **5.7** Add "Delete" button on each saved deck card
- [ ] **5.8** Handle localStorage quota exceeded error with user message
- [ ] **5.9** Handle localStorage unavailable (private browsing) gracefully
- [ ] **5.10** Add deck auto-title (first 5 words of content) if no topic provided

---

## Phase 6: Deck Management Polish
**Goal:** Improve saved deck experience
**Time:** 1 session (~1.5 hours)

- [ ] **6.1** Show deck metadata: creation date, flashcard count, quiz count
- [ ] **6.2** Add empty state when no decks saved ("Your first deck will appear here")
- [ ] **6.3** Store last accessed timestamp on deck
- [ ] **6.4** Sort decks by last accessed (most recent first)
- [ ] **6.5** Add confirmation dialog before deleting deck
- [ ] **6.6** Add "Continue Studying" auto-load for most recent deck
- [ ] **6.7** Handle deck versioning (add version field to schema)
- [ ] **6.8** Add data migration function for future schema changes

---

## Phase 7: Retry Wrong Answers
**Goal:** Allow users to retry only questions they missed
**Time:** 1 session (~1 hour)

- [ ] **7.1** Track incorrect answer indices during quiz
- [ ] **7.2** Pass incorrect answers to results page via sessionStorage
- [ ] **7.3** Add "Retry Wrong Answers" button on results page
- [ ] **7.4** Filter quiz to only incorrect questions on retry
- [ ] **7.5** Handle edge case: all correct → hide retry button
- [ ] **7.6** Handle edge case: all wrong → retry full quiz
- [ ] **7.7** Reset score tracking for retry session
- [ ] **7.8** Test retry flow with mixed results

---

## Phase 8: Error Handling & Edge Cases
**Goal:** Graceful error handling throughout the app
**Time:** 1 session (~2 hours)

- [ ] **8.1** Add React Error Boundary at root level
- [ ] **8.2** Add error fallback UI component
- [ ] **8.3** Show user-friendly error page with "Go Home" button
- [ ] **8.4** Add API timeout handling (30 second limit)
- [ ] **8.5** Show timeout error with "Try Again" button
- [ ] **8.6** Handle malformed JSON with specific error message
- [ ] **8.7** Add retry button that re-calls API with same input
- [ ] **8.8** Validate input length on client before API call
- [ ] **8.9** Show loading skeleton during API call (better than spinner)
- [ ] **8.10** Add environment variable check on app start (warn if missing API key)

---

## Phase 9: Mobile Responsiveness
**Goal:** App works well on mobile browsers
**Time:** 1 session (~1.5 hours)

- [ ] **9.1** Test home page on mobile viewport
- [ ] **9.2** Make textarea full width with proper padding on mobile
- [ ] **9.3** Adjust flashcard size for mobile screens (max-width: 90vw)
- [ ] **9.4** Make quiz option buttons full width on mobile
- [ ] **9.5** Increase touch target sizes (min 44px for buttons)
- [ ] **9.6** Test flashcard flip gesture on mobile
- [ ] **9.7** Adjust font sizes for mobile readability
- [ ] **9.8** Prevent zoom on double-tap for buttons
- [ ] **9.9** Test on actual mobile device (iOS Safari + Chrome)
- [ ] **9.10** Fix any overflow or layout issues found

---

## Phase 10: Polish & Animations
**Goal:** Add visual polish and micro-interactions
**Time:** 1 session (~2 hours)

- [ ] **10.1** Add page transition animations (fade in)
- [ ] **10.2** Add button hover effects (slight lift + shadow)
- [ ] **10.3** Add loading skeleton components for better perceived performance
- [ ] **10.4** Animate progress bar fill on flashcards page
- [ ] **10.5** Add success animation when completing quiz
- [ ] **10.6** Add subtle card hover effects on saved decks
- [ ] **10.7** Improve color contrast for accessibility
- [ ] **10.8** Add focus states for keyboard navigation
- [ ] **10.9** Polish typography (line height, letter spacing)
- [ ] **10.10** Add favicon and page title

---

## Phase 11: Deployment
**Goal:** Deploy to Vercel and test in production
**Time:** 1 session (~1 hour)

- [ ] **11.1** Create GitHub repository and push code
- [ ] **11.2** Connect GitHub repo to Vercel
- [ ] **11.3** Set `ANTHROPIC_API_KEY` in Vercel environment variables
- [ ] **11.4** Deploy to Vercel (production environment)
- [ ] **11.5** Test deployed version with real content
- [ ] **11.6** Verify API route works in production
- [ ] **11.7** Test localStorage persistence in production
- [ ] **11.8** Test on mobile device (not just responsive dev tools)
- [ ] **11.9** Check for console errors in production
- [ ] **11.10** Set custom domain (optional)

---

## Phase 12: Post-Launch Validation
**Goal:** Use the app personally and fix critical issues
**Time**: 1 session (~2 hours)

- [ ] **12.1** Generate flashcards from actual content you want to learn
- [ ] **12.2** Complete full study session: flashcards + quiz
- [ ] **12.3** Test retry wrong answers flow
- [ ] **12.4** Create multiple decks and test switching
- [ ] **12.5** Test on different browsers (Chrome, Firefox, Safari)
- [ ] **12.6** Fix any critical bugs found during testing
- [ ] **12.7** Add basic error tracking (console.error with context)
- [ ] **12.8** Document API key setup in README
- [ ] **12.9** Add screenshot to README
- [ ] **12.10** Celebrate — you shipped! 🎉

---

## Notes

### Commit Convention
Each action item should be one atomic commit with a clear message:
```bash
git commit -m "feat: add flashcard flip animation with CSS 3D transform"
```

### Session Length
- Each phase is designed for **1 work session** (2–3 hours for part-time)
- Exception: Phase 2 is **2 sessions** (~4 hours) to build entire UI/UX with mock data
- Can combine multiple phases if you have more time
- Can split phases if needed

### Key Workflow Change
- **Phase 1**: Build input form
- **Phase 2**: Build ENTIRE UI/UX with mock data (flashcards → quiz → results flow)
- **Phase 3**: Implement API backend
- **Phase 4**: Wire up real API to replace mock data
- **Phase 5-12**: Persistence, polish, deployment

This approach validates UX before investing in API integration.

### Mock Mode Option
During development, add a mock mode to avoid burning API calls:
```typescript
// In /api/generate/route.ts
const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
if (USE_MOCK) return MOCK_FLASHCARDS_QUIZ;
```

---

**Total Estimated Time:** ~26 hours over 13 sessions
**At 10 hours/week:** ~2.5 weeks to MVP
**At 15 hours/week:** ~1.75 weeks to MVP
