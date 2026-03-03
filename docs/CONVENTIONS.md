# Chewit — Development Conventions

> Coding standards, file organization, and development workflow

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [File Naming Conventions](#file-naming-conventions)
3. [Code Style Guide](#code-style-guide)
4. [Component Conventions](#component-conventions)
5. [Testing Strategy](#testing-strategy)
6. [Git Conventions](#git-conventions)
7. [Environment Variables](#environment-variables)
8. [API Route Conventions](#api-route-conventions)

---

## Project Structure

```
chewit/
├── app/                      # Next.js App Router
│   ├── (routes)/            # Route groups (if needed)
│   ├── api/                 # API routes
│   │   └── generate/        # Generation endpoint
│   ├── study/               # Study mode routes
│   ├── error.tsx            # Global error boundary
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components (don't edit)
│   ├── flashcards/          # Flashcard-specific components
│   ├── quiz/                # Quiz-specific components
│   └── shared/              # Shared/reusable components
├── lib/                     # Utility functions
│   ├── utils.ts             # General utilities
│   ├── storage.ts           # localStorage utilities
│   └── api.ts               # API client functions
├── types/                   # TypeScript types
│   └── index.ts             # All type definitions
├── mocks/                   # Mock data for development
│   └── data.ts              # Sample flashcards, quiz, etc.
├── hooks/                   # Custom React hooks
│   └── useFlashcards.ts     # Example custom hook
├── styles/                  # Global styles
│   └── globals.css          # Tailwind + custom CSS
├── .env.local               # Environment variables (gitignored)
├── next.config.js           # Next.js config
├── tailwind.config.ts       # Tailwind config
└── tsconfig.json            # TypeScript config
```

### Folder Organization Principles

1. **Colocation:** Keep related files close
   - Component-specific hooks go in same folder as component
   - If hook is used by 3+ components, move to `/hooks`

2. **Feature-based grouping:**
   - `/components/flashcards` for flashcard UI
   - `/components/quiz` for quiz UI
   - Not `/components/cards` and `/components/questions`

3. **Clear separation:**
   - `/lib` for pure functions (no React dependencies)
   - `/components` for React components
   - `/hooks` for React hooks only

---

## File Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Flashcard.tsx`, `QuizOption.tsx` |
| Utilities | camelCase | `formatDate.ts`, `storage.ts` |
| Hooks | camelCase with `use` prefix | `useFlashcards.ts`, `useQuiz.ts` |
| Types | camelCase | `types/index.ts` (all in one file) |
| Constants | PascalCase or SCREAMING_SNAKE_CASE | `MockData.ts` or `CONSTANTS.ts` |
| API Routes | lowercase | `route.ts` (in `/api/generate/route.ts`) |

### Component Files

**Multi-file components:** If a component has:
- 1-2 helpers: keep in same file
- 3+ helpers: create `ComponentName.tsx` + `ComponentName.utils.ts`

**Example:**
```
components/flashcards/
├── Flashcard.tsx           # Main component
├── Flashcard.utils.ts      # Helper functions
└── Flashcard.test.tsx      # Tests (if any)
```

### Index Files

Use `index.ts` for exports only when:
- Exporting 3+ items from a folder
- Creating a clean import path

**Don't overuse:**
```typescript
// Bad
components/flashcards/index.ts  // Just exports Flashcard.tsx

// Good
components/flashcards/Flashcard.tsx  // Import directly
```

**Good use case:**
```typescript
// types/index.ts
export type Flashcard = { ... }
export type Question = { ... }
export type Deck = { ... }

// Clean import: import { Flashcard, Deck } from '@/types'
```

---

## Code Style Guide

### TypeScript

**1. Type Definitions**
```typescript
// Prefer interface for objects, type for unions
interface Flashcard {
  id: string;
  front: string;
  back: string;
}

type Answer = 'correct' | 'incorrect' | 'unanswered';
```

**2. Avoid `any`**
```typescript
// Bad
function parseData(data: any) { ... }

// Good
function parseData(data: unknown) {
  if (typeof data === 'string') { ... }
}

// Better: Use Zod for runtime validation
import { z } from 'zod';
const FlashcardSchema = z.object({ ... });
```

**3. Function parameters**
```typescript
// Prefer object params for 3+ arguments
// Bad
function createCard(front: string, back: string, id: string, order: number) { ... }

// Good
function createCard({ front, back, id, order }: CreateCardParams) { ... }
```

### React

**1. Component structure**
```typescript
// Order:
// 1. Types/interfaces
// 2. Props definition
// 3. Component function
// 4. Hooks (in order: useState, useEffect, useRef, custom hooks)
// 5. Event handlers
// 6. Render helpers
// 7. Return statement

interface FlashcardProps {
  card: Flashcard;
  onFlip?: () => void;
}

export function Flashcard({ card, onFlip }: FlashcardProps) {
  // Hooks
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Event handlers
  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  // Render helpers
  const cardContent = isFlipped ? card.back : card.front;

  // Return
  return (
    <div ref={cardRef} onClick={handleClick}>
      {cardContent}
    </div>
  );
}
```

**2. Component exports**
```typescript
// Named export (preferred)
export function Flashcard() { ... }

// Default export (okay for pages)
export default function HomePage() { ... }
```

**3. Props destructuring**
```typescript
// Destructure in signature
export function Quiz({ question, options, onSelect }: QuizProps) { ... }

// Not in body
export function Quiz(props: QuizProps) {
  const { question, options, onSelect } = props;  // Don't do this
}
```

### CSS / Tailwind

**1. Tailwind first, custom CSS second**
```typescript
// Prefer Tailwind classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">

// Use custom CSS only for:
// - Complex animations
// - Browser-specific workarounds
// - 3D transforms
```

**2. Class organization**
```typescript
// Order: layout → spacing → visual → interactive
<div className="
  flex items-center justify-center    // Layout
  p-6 gap-4                           // Spacing
  bg-white text-gray-900 rounded-lg   // Visual
  hover:bg-gray-50 active:scale-95    // Interactive
">
```

**3. Conditional classes**
```typescript
// Use clsx or class-variance-authority
import { clsx } from 'clsx';

<div className={clsx(
  'base classes',
  isFlipped && 'flipped classes',
  isLoading && 'opacity-50'
)}>
```

---

## Component Conventions

### Component Categories

**1. Page Components** (`app/`)
- Live in `/app` directory
- Handle routing and layout
- Can be server components (if no interactivity)

**2. Feature Components** (`/components/feature-name`)
- Domain-specific: Flashcard, Quiz, Results
- Business logic + UI

**3. UI Components** (`/components/ui`)
- shadcn/ui components (don't modify)
- Generic: Button, Input, Card

**4. Shared Components** (`/components/shared`)
- Used across features: Header, Navigation, ErrorBoundary

### Component Props Pattern

```typescript
// Separate "controlled" vs "uncontrolled" props
interface FlashcardProps {
  // Data (required)
  card: Flashcard;

  // State (controlled by parent)
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;

  // Events (optional callbacks)
  onFlip?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;

  // Options
  showHint?: boolean;
  className?: string;
}
```

### Component Composition

```typescript
// Prefer composition over prop drilling
// Bad: Pass all quiz state down
<Quiz question={q} options={opts} score={s} onAnswer={fn} />

// Good: Quiz manages its own state internally
<Quiz quizData={quizData} onComplete={handleComplete} />
```

---

## Testing Strategy

### Philosophy

**For a personal project MVP:**
- Test **business logic**, not UI implementation
- Test **API routes**, not component rendering
- Test **critical paths**, not edge cases
- **No tests needed for:** simple components, pure UI, one-off scripts

### What to Test

**1. Utility Functions** (high priority)
```typescript
// lib/storage.test.ts
describe('localStorage utilities', () => {
  it('saves and loads deck correctly', () => {
    saveDeck(mockDeck);
    const loaded = loadDeck(mockDeck.id);
    expect(loaded).toEqual(mockDeck);
  });

  it('handles quota exceeded error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveDeck(mockDeck)).not.toThrow();
  });
});
```

**2. API Routes** (high priority)
```typescript
// app/api/generate/route.test.ts
describe('/api/generate', () => {
  it('returns 400 for empty input', async () => {
    const response = await POST({ json: () => ({ sourceText: '' }) });
    expect(response.status).toBe(400);
  });

  it('returns valid flashcards for valid input', async () => {
    const response = await POST({
      json: () => ({ sourceText: mockText })
    });
    const data = await response.json();
    expect(FlashcardSchema.array().safeParse(data.flashcards).success).toBe(true);
  });
});
```

**3. Critical User Flows** (medium priority)
```typescript
// tests/flow.test.ts
describe('Study flow', () => {
  it('completes full study session', async () => {
    render(<HomePage />);
    await userEvent.type(screen.getByRole('textbox'), mockText);
    await userEvent.click(screen.getByText('Generate'));
    // ... continue through flashcards, quiz, results
  });
});
```

### Testing Stack

**For this project:**
- **Framework:** Vitest (comes with Next.js)
- **E2E:** Playwright (optional, add later)
- **Testing library:** React Testing Library (for components)
- **Mocking:** Vitest built-in vi

### Test File Location

```
components/
├── flashcards/
│   ├── Flashcard.tsx
│   └── Flashcard.test.tsx       # Co-located with component
lib/
├── storage.ts
└── storage.test.ts              # Co-located with utility
app/
└── api/
    └── generate/
        ├── route.ts
        └── route.test.ts        # Co-located with route
tests/
└── flows/
    └── study-session.test.ts    # E2E/flow tests separate
```

---

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change without feature/fix
- `style`: CSS, formatting, whitespace
- `docs`: Documentation only
- `test`: Add/update tests
- `chore`: Build, deps, config

**Examples:**
```bash
feat(quiz): add score calculation and results display
fix(flashcards): prevent overflow on long card text
refactor(storage): extract localStorage logic to utility
style(button): increase padding on mobile
docs(readme): add setup instructions
test(api): add validation tests for /api/generate
chore(deps): upgrade Next.js to 14.1.0
```

### Commit Guidelines

**1. One atomic change per commit**
```bash
# Bad: Multiple unrelated changes
git commit -m "feat: add flashcards and fix home page styling"

# Good: Separate commits
git commit -m "feat(flashcards): add flip animation"
git commit -m "style(home): fix button alignment"
```

**2. Write subject in imperative mood**
```bash
# Bad
git commit -m "Added flip animation"

# Good
git commit -m "feat(flashcards): add flip animation"
```

**3. Reference roadmap items in body**
```bash
git commit -m "feat(flashcards): add CSS 3D flip animation

Implements: ROADMAP.md 2.9-2.16
Phase 2, items 9-16
"
```

### Branch Strategy

**For solo project:**
- `main` — stable, deployed code
- `dev` — active development (optional, can skip)
- Feature branches — one per phase or major feature

**Example:**
```bash
# Optional: Use feature branches for each phase
git checkout -b phase-2-ui-mock-data
# ... work on Phase 2
git checkout main
git merge phase-2-ui-mock-data

# Or: Commit directly to main (simpler for solo project)
```

---

## Environment Variables

### Naming Convention

```bash
# Format: NAMESPACE_<PURPOSE>
ANTHROPIC_API_KEY=sk-ant-...
USE_MOCK_DATA=true
```

### Required Variables

Create `.env.local` (gitignored):
```bash
# Required for production
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional: Development
USE_MOCK_DATA=true          # Return mock data instead of calling API
NODE_ENV=development
```

### Accessing in Code

```typescript
// Server-side only (API routes, Server Components)
const apiKey = process.env.ANTHROPIC_API_KEY;

// Client-side: Will be undefined (security)
// Never expose API keys to client
```

### Env Variable Template

Create `.env.example` (committed to git):
```bash
# Copy this to .env.local and fill in values
ANTHROPIC_API_KEY=your_api_key_here
USE_MOCK_DATA=false
```

---

## API Route Conventions

### Route Structure

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 1. Validation schema
const GenerateRequestSchema = z.object({
  sourceText: z.string().min(200).max(10000),
  topicName: z.string().max(100).optional(),
});

// 2. Main handler
export async function POST(request: NextRequest) {
  try {
    // 3. Parse and validate
    const body = await request.json();
    const validated = GenerateRequestSchema.parse(body);

    // 4. Business logic
    const result = await generateContent(validated);

    // 5. Return response
    return NextResponse.json(result);
  } catch (error) {
    // 6. Error handling
    return handleError(error);
  }
}
```

### Error Response Format

```typescript
// Consistent error structure
interface APIError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Example
return NextResponse.json(
  {
    error: {
      code: 'INVALID_INPUT',
      message: 'Source text must be between 200-10000 characters',
      details: zodError.errors,
    }
  },
  { status: 400 }
);
```

### Response Format

```typescript
// Success: Always return consistent shape
interface GenerateResponse {
  flashcards: Flashcard[];
  quiz: Question[];
  metadata?: {
    wordCount: number;
    generationTime: number;
  };
}

return NextResponse.json<GenerateResponse>({
  flashcards: [...],
  quiz: [...],
  metadata: { wordCount: 1234, generationTime: 2.3 }
});
```

---

## Code Review Checklist

Before committing/merging, verify:

- [ ] TypeScript: No `any` types, no `@ts-ignore`
- [ ] Components: Props typed, no unused props
- [ ] Styling: Responsive on mobile viewport
- [ ] Error handling: Try/catch around async operations
- [ ] Loading states: Show feedback during operations
- [ ] Accessibility: Keyboard navigation works
- [ ] Tests: Critical paths covered (if applicable)
- [ ] Console: No errors or warnings in dev tools

---

## Tools & Extensions

### Recommended VS Code Extensions

- **ESLint** — Linting
- **Prettier** — Formatting (if using)
- **Tailwind CSS IntelliSense** — Class autocomplete
- **TypeScript Importer** — Auto-import types
- **Error Lens** — Inline error display
- **GitLens** — Git blame and history

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Notes

- **Consistency > Perfection:** These are guidelines, not laws. Deviate when necessary, but document why.
- **Evolution:** Update this doc as we discover better patterns.
- **Questions:** When unsure, prefer the simpler option. You can always refactor later.

---

**Last Updated:** 2026-03-03
