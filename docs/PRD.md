# Chewit — Product Requirements Document

> **Version:** 1.0 — Draft
> **Date:** March 2026
> **Author:** Personal Project
> **Status:** 🟡 In Review

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target User](#2-target-user)
3. [Feature Requirements](#3-feature-requirements)
4. [Functional Specifications](#4-functional-specifications)
5. [Technical Architecture](#5-technical-architecture)
6. [Build Milestones](#6-build-milestones)
7. [Risks & Mitigations](#7-risks--mitigations)
8. [Success Metrics](#8-success-metrics)
9. [Open Questions](#9-open-questions)

---

## 1. Product Overview

### 1.1 Problem Statement

Learning from long-form content — PDFs, video transcripts, articles — is passive and ineffective. Readers absorb only a fraction of what they read, with retention dropping sharply within 24 hours. There is no easy way to convert existing reference material into an engaging, active learning experience without significant manual effort.

### 1.2 Solution

Chewit is a personal web application that transforms any text-based content into an interactive learning experience. Users paste or upload source material, and the app automatically generates **Flashcards** and **Multiple-Choice Quizzes** powered by AI — making study sessions faster, more engaging, and more effective.

### 1.3 Vision Statement

> _"Upload anything. Learn like you're playing a game."_
> A personal tool that removes all friction between raw knowledge and genuine understanding.

### 1.4 Goals & Non-Goals

#### ✅ Goals (MVP Scope)

- Generate flashcards and MCQ quizzes automatically from pasted text or transcript
- Deliver a smooth, game-like study experience in the browser
- Track scores and basic learning progress locally (no backend required)
- Keep the app fast to build and genuinely useful for personal daily use

#### ❌ Non-Goals (Post-MVP)

- PDF file upload with parsing (deferred — adds complexity)
- User authentication and cloud sync
- Multi-user collaboration or sharing
- Native mobile app
- Spaced repetition algorithm (SM-2) — targeted for v2

---

## 2. Target User

**Primary Persona:** A frontend engineer who learns from articles, video transcripts, and documentation. They want a fast, personal tool to make studying more active — not another SaaS product to manage.

### 2.1 Pain Points

- Reading long content passively → poor retention
- Manually creating flashcards is time-consuming
- Existing quiz apps require content to be pre-formatted — they don't accept raw text
- Duolingo-like apps exist for language, not for custom subject matter

### 2.2 User Journey

```
1. User finds a great article or saves a YouTube transcript
2. Opens Chewit → pastes the content
3. Clicks "Generate" → AI creates flashcards and quiz questions
4. Studies via flashcard flip mode, then takes the MCQ quiz
5. Sees score, reviews wrong answers, optionally retries
```

---

## 3. Feature Requirements

### 3.1 Feature Priority Matrix

| Priority | Feature           | Description                                                              | Effort |
| -------- | ----------------- | ------------------------------------------------------------------------ | ------ |
| **P0**   | Text Input        | Paste any text/transcript into a textarea to use as source material      | Low    |
| **P0**   | AI Flashcard Gen  | Auto-generate 10 flashcards (front/back) from input using Claude API     | Medium |
| **P0**   | AI MCQ Gen        | Auto-generate 5 multiple-choice questions with 4 options each            | Medium |
| **P0**   | Flashcard Mode    | Flip-card UI to review concept → definition, with progress indicator     | Low    |
| **P0**   | Quiz Mode         | Answer MCQs one by one, get immediate right/wrong feedback               | Low    |
| **P0**   | Score Summary     | End-of-quiz screen showing score, time taken, review of wrong answers    | Low    |
| **P1**   | Local Storage     | Persist generated decks in localStorage so sessions survive page refresh | Low    |
| **P1**   | Multiple Decks    | Save and switch between multiple content sets (subjects/topics)          | Medium |
| **P1**   | Retry Mode        | Replay quiz with only the questions answered incorrectly                 | Low    |
| **P2**   | PDF Upload        | Parse uploaded PDF to extract text for AI generation                     | High   |
| **P2**   | Spaced Repetition | SM-2 algorithm to schedule flashcard reviews by difficulty               | High   |
| **P2**   | Streak & XP       | Gamification layer — daily streak, XP per session                        | Medium |

---

## 4. Functional Specifications

### 4.1 Input Module

- Large textarea accepts raw text (no formatting required)
- Character count indicator with recommended range: 500–5,000 words
- Clear button to reset input
- Optional: topic label field (e.g., "React Hooks") for deck naming

### 4.2 AI Generation

#### Flashcard Generation — Prompt Contract

```
System: You are a study assistant. Return ONLY valid JSON, no markdown, no preamble.

User: Given the following content, generate exactly 10 flashcards as a JSON array.
Each object must have:
- "front": the concept or question (max 15 words)
- "back": the explanation (max 50 words)

Content: {sourceText}
```

**Expected output:**

```json
[
  { "front": "What is a closure?", "back": "A function that retains access to its outer scope even after the outer function has returned." },
  ...
]
```

#### MCQ Generation — Prompt Contract

```
System: You are a study assistant. Return ONLY valid JSON, no markdown, no preamble.

User: Given the following content, generate exactly 5 multiple-choice questions as a JSON array.
Each object must have:
- "question": string
- "options": array of exactly 4 strings
- "answer": index of the correct option (0–3)

Content: {sourceText}
```

**Expected output:**

```json
[
  {
    "question": "What does useEffect do?",
    "options": ["Manages state", "Runs side effects", "Creates context", "Handles routing"],
    "answer": 1
  },
  ...
]
```

**Implementation notes:**

- Model: `claude-haiku-4-5-20251001` (fast and cost-effective)
- API call made from Next.js Route Handler (`/api/generate`) to protect API key
- Validate response against expected JSON schema before rendering
- Show error state if AI response is malformed or API fails
- Retry once automatically on parse failure

### 4.3 Flashcard Mode — Interaction Spec

- Cards displayed one at a time, centered on screen
- Click or press `Space` to flip card (CSS 3D flip animation)
- Arrow keys or buttons to navigate Previous / Next
- Progress indicator: "Card 3 of 10"
- Progress bar below navigation (fills as cards are visited)
- Shuffle button (Fisher-Yates algorithm)
- `isFlipped` resets to `false` on card change
- "Click to reveal" hint disappears after first flip
- Last card + flipped → show "Take the Quiz →" button

### 4.4 Quiz Mode — Interaction Spec

- One question displayed at a time
- 4 answer options as clickable buttons
- On selection: immediate visual feedback
  - ✅ Correct: green highlight
  - ❌ Wrong: red highlight + reveal correct answer
- "Next" button advances to following question
- No going back to previous questions
- Session timer runs (displayed, not enforced)

### 4.5 Score Summary Screen

- Score shown as X/5 with percentage
- Visual indicator based on score band:
  - 80–100%: 🏆 Excellent
  - 50–79%: 👍 Good — keep going
  - 0–49%: 🔄 Review recommended
- List of incorrect questions with correct answers shown
- Action buttons:
  - "Retry Wrong Answers"
  - "Back to Flashcards"
  - "New Content"

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer       | Technology                         | Rationale                                |
| ----------- | ---------------------------------- | ---------------------------------------- |
| Framework   | Next.js 14 (App Router)            | Full-stack in one repo, easy deployment  |
| Styling     | Tailwind CSS + shadcn/ui           | Rapid UI, no design from scratch         |
| AI          | Claude API — Haiku model           | Cheap, fast, great for structured output |
| Persistence | localStorage (MVP) → Supabase (v2) | No backend needed to ship MVP            |
| Deployment  | Vercel                             | Free tier, one-click deploy from GitHub  |

### 5.2 App Routes

```
/                     → Home / Content input page
/generate             → Loading state while AI runs
/study/flashcards     → Flashcard mode
/study/quiz           → Quiz mode
/study/results        → Score summary
/decks                → Saved decks list (P1)
```

### 5.3 API Routes

```
POST /api/generate
  body: { sourceText: string, topicName: string }
  response: { flashcards: Flashcard[], quiz: Question[] }
```

### 5.4 Data Model

```typescript
interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Question {
  id: string;
  question: string;
  options: string[]; // always length 4
  answer: number; // index 0–3
}

interface Deck {
  id: string;
  title: string;
  createdAt: string;
  sourceText: string;
  flashcards: Flashcard[];
  quiz: Question[];
  scores: ScoreRecord[];
}

interface ScoreRecord {
  date: string;
  score: number;
  total: number;
}
```

### 5.5 localStorage Schema

```typescript
// Key: "Chewit_decks"
// Value: JSON.stringify(Deck[])

const decks: Deck[] = JSON.parse(localStorage.getItem("Chewit_decks") ?? "[]");
```

### 5.6 Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 6. Build Milestones

| Phase   | Timeline | Deliverables                                                         | Status  |
| ------- | -------- | -------------------------------------------------------------------- | ------- |
| Phase 0 | Week 1   | Project setup, UI wireframe, Claude API integration proof-of-concept | 🔲 Todo |
| Phase 1 | Week 1–2 | Flashcard generation + flip UI fully functional                      | 🔲 Todo |
| Phase 2 | Week 2–3 | MCQ quiz mode + score summary screen                                 | 🔲 Todo |
| Phase 3 | Week 3–4 | localStorage persistence, saved decks, polish + deploy to Vercel     | 🔲 Todo |

### Phase 0 Checklist

- [ ] `npx create-next-app@latest Chewit --typescript --tailwind --app`
- [ ] Install shadcn/ui
- [ ] Add `ANTHROPIC_API_KEY` to `.env.local`
- [ ] Create `/api/generate` route handler
- [ ] Test Claude API call returns valid JSON flashcards

---

## 7. Risks & Mitigations

| Risk                          | Likelihood | Mitigation                                                                       |
| ----------------------------- | ---------- | -------------------------------------------------------------------------------- |
| AI returns malformed JSON     | Medium     | Strict system prompt + JSON schema validation + retry on parse failure           |
| Scope creep kills the project | High       | Strict P0 focus for MVP. Nothing ships in v1 that isn't on the feature matrix.   |
| API key exposed on client     | Low        | All API calls via Next.js Route Handler (server-side). Key in `.env.local` only. |
| API cost exceeds budget       | Low        | Haiku model is ~$0.002/session. At 10 sessions/day, monthly cost ~$0.60.         |

---

## 8. Success Metrics

Since this is a personal tool, success is measured by personal utility:

- ✅ Generates usable flashcards from any pasted text in under 10 seconds
- ✅ Can complete a full study session (flashcards + quiz) without bugs or crashes
- ✅ Used at least 3× per week for real learning (not just demo purposes)
- ✅ Deployed publicly on Vercel within 4 weeks of starting
- ✅ Score improves on retry — indicating the quiz is actually testing knowledge

---

## 9. Open Questions

- [ ] Should the app support YouTube URL input (auto-fetch transcript) instead of manual paste?
- [ ] Should difficulty of flashcards be adjustable (basic / deep dive)?
- [ ] Is a dark mode worth the implementation effort for v1?
- [ ] Should quiz questions always be randomized, or follow the source order?

---

_Chewit PRD — Personal Project — March 2026_
