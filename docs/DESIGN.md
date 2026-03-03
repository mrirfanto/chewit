# Chewit — Design System

> **Version:** 1.0
> **Last Updated:** 2026-03-03
> **Aesthetic:** Minimalist, Notion-like, Calm, Focused

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography System](#typography-system)
4. [Spacing System](#spacing-system)
5. [Component Design Guidelines](#component-design-guidelines)
6. [Visual Hierarchy](#visual-hierarchy)
7. [Interaction States](#interaction-states)
8. [Animation Guidelines](#animation-guidelines)
9. [Layout Principles](#layout-principles)
10. [Accessibility Standards](#accessibility-standards)
11. [Do's and Don'ts](#dos-and-donts)

---

## Design Philosophy

Chewit's design creates a calm, focused study environment that feels like a clean workspace — not a game or a social app. The aesthetic is intentionally minimalist, drawing inspiration from Notion's refined simplicity.

### Core Principles

1. **Calm Over Stimulating**
   - Muted, neutral colors that don't compete with content
   - No aggressive gradients, glows, or attention-grabbing effects
   - Study material is the hero; UI recedes into background

2. **Whitespace as Breathing Room**
   - Generous padding and margins between elements
   - Content never feels cramped or cluttered
   - Space creates focus and reduces cognitive load

3. **Subtle Over Bold**
   - Borders are visible but never heavy (1px, light colors)
   - Shadows are minimal or nonexistent
   - Transitions are smooth but never distracting

4. **Clarity Over Decoration**
   - Every element serves a purpose
   - No ornamental details without function
   - Typography and spacing carry the design

5. **Feedback Without Friction**
   - Clear responses to user actions
   - Loading states that feel fast, not sluggish
   - Error states that are helpful, not alarming

---

## Color Palette

The color system uses neutral grays as the foundation, with semantic colors reserved for specific feedback states. All colors are designed to work well with both light and dark modes (future consideration).

### Neutral Colors (Foundation)

```css
/* Slate gray scale - cooler than pure gray, more modern */
--slate-50:  #f8fafc   /* Page background */
--slate-100: #f1f5f9   /* Subtle backgrounds, cards */
--slate-200: #e2e8f0   /* Borders, dividers */
--slate-300: #cbd5e1   /* Hover states, disabled borders */
--slate-400: #94a3b8   /* Placeholders, muted text */
--slate-500: #64748b   /* Secondary text */
--slate-600: #475569   /* Tertiary text */
--slate-700: #334155   /* Primary text on light backgrounds */
--slate-800: #1e293b   /* Headings, emphasized text */
--slate-900: #0f172a   /* Highest emphasis text */
```

### Semantic Colors

```css
/* Success - calm, not neon */
--success-50:  #f0fdf4
--success-500: #22c55e  /* Primary success (green-500) */
--success-600: #16a34a  /* Success text on light bg */
--success-700: #15803d  /* Success text on white */

/* Error - clear but not alarming */
--error-50:   #fef2f2
--error-500:  #ef4444  /* Primary error (red-500) */
--error-600:  #dc2626  /* Error text on light bg */
--error-700:  #b91c1c  /* Error text on white */

/* Warning - noticeable but calm */
--warning-50:  #fffbeb
--warning-500: #f59e0b  /* Primary warning (amber-500) */
--warning-600: #d97706  /* Warning text on light bg */
--warning-700: #b45309  /* Warning text on white */
```

### Color Usage Guidelines

| Element | Color | Tailwind Class | When to Use |
|---------|-------|----------------|-------------|
| Page background | slate-50 | `bg-slate-50` | Main app background |
| Card/container background | white | `bg-white` | Content cards, inputs |
| Primary text | slate-900 | `text-slate-900` | Headings, important content |
| Secondary text | slate-600 | `text-slate-600` | Body text, descriptions |
| Muted text | slate-400 | `text-slate-400` | Metadata, timestamps |
| Borders | slate-200 | `border-slate-200` | Default borders |
| Dividers | slate-200 | `border-t-slate-200` | Section separators |
| Focus ring | slate-400 | `focus:ring-slate-400` | Keyboard focus |
| Success state | green-500 | `text-green-500` | Correct answers, success messages |
| Error state | red-500 | `text-red-500` | Wrong answers, error messages |
| Warning state | amber-500 | `text-amber-500` | Warnings, caution states |

---

## Typography System

Chewit uses **Inter** as its primary typeface — the same font used by Notion. It's highly legible, neutral, and works beautifully at all sizes.

### Font Family

```css
/* Primary font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

/* Monospace (for code snippets) */
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Implementation:**
```html
<!-- In layout.tsx head -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Tailwind Class | Usage |
|------|------|--------|-------------|----------------|----------------|-------|
| Display | 48px | 600 | 1.1 | -0.02 | `text-5xl font-semibold leading-tight tracking-tight` | Hero title, main page heading |
| H1 | 36px | 600 | 1.2 | -0.015 | `text-4xl font-semibold leading-tight tracking-tight` | Page titles |
| H2 | 30px | 600 | 1.3 | -0.01 | `text-3xl font-semibold leading-tight tracking-tight` | Section headers |
| H3 | 24px | 600 | 1.4 | 0 | `text-2xl font-semibold leading-snug` | Subsection headers |
| H4 | 20px | 600 | 1.4 | 0 | `text-xl font-semibold leading-snug` | Card titles |
| Body Large | 18px | 400 | 1.6 | 0 | `text-lg leading-relaxed` | Important body text |
| Body | 16px | 400 | 1.6 | 0 | `text-base leading-relaxed` | Default body text |
| Body Small | 14px | 400 | 1.5 | 0 | `text-sm leading-relaxed` | Secondary text, captions |
| Caption | 12px | 400 | 1.4 | 0.01 | `text-xs leading-relaxed tracking-wide` | Metadata, labels |

### Font Weight Usage

| Weight | When to Use |
|--------|-------------|
| 400 (Regular) | Body text, descriptions, content |
| 500 (Medium) | Emphasized body text, button labels |
| 600 (Semi-bold) | All headings, important labels |
| 700 (Bold) | Rarely used — only for extreme emphasis |

### Text Color Mapping

```typescript
// Headings
<h1 className="text-4xl font-semibold text-slate-900">Page Title</h1>
<h2 className="text-2xl font-semibold text-slate-800">Section</h2>

// Body text
<p className="text-base text-slate-700">Body paragraph</p>
<p className="text-sm text-slate-600">Secondary text</p>

// Muted text
<span className="text-xs text-slate-400">Metadata</span>

// Semantic text
<p className="text-green-600">Correct answer</p>
<p className="text-red-500">Error message</p>
```

---

## Spacing System

Chewit uses a 4px base unit, following Tailwind's default spacing scale. Consistent spacing creates rhythm and makes the interface feel intentional.

### Spacing Scale

| Token | Value | Tailwind | Usage Example |
|-------|-------|----------|---------------|
| xs | 4px | `p-1` | Tight icon padding |
| sm | 8px | `p-2` | Small gaps between related items |
| md | 16px | `p-4` | Default padding for cards, buttons |
| lg | 24px | `p-6` | Section padding, larger cards |
| xl | 32px | `p-8` | Page sections, major spacing |
| 2xl | 48px | `p-12` | Hero sections, dramatic spacing |

### Component Padding Standards

```typescript
// Buttons
padding: 12px 24px;  // md, lg sizes
className="px-6 py-3"

// Input/Textarea
padding: 12px 16px;
className="px-4 py-3"

// Cards
padding: 24px;
className="p-6"

// Small cards (compact mode)
padding: 16px;
className="p-4"
```

### Gap Standards

```typescript
// Related items (label + input)
gap: 8px;
className="gap-2"

// Related elements in a group
gap: 16px;
className="gap-4"

// Sections, major breaks
gap: 24px;
className="gap-6"
```

### Container Widths

```typescript
// Max-width containers
max-width: 640px;  // md: focused content
max-width: 768px;  // lg: readable text
max-width: 1024px; // xl: wider layouts

// Usage
className="max-w-md mx-auto"  // Centered, focused
className="max-w-2xl mx-auto" // Wider content area
```

---

## Component Design Guidelines

### Buttons

Buttons use subtle backgrounds and borders, with clear hover states. No gradients or heavy shadows.

#### Primary Button

```tsx
// Base: white background, slate border, dark text
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  bg-white
  border border-slate-200
  text-slate-900 text-sm font-medium
  rounded-lg
  hover:bg-slate-50
  hover:border-slate-300
  active:bg-slate-100
  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
  transition-colors duration-150
">
  Generate Flashcards
</button>
```

#### Secondary Button (Ghost)

```tsx
// No background, transparent, only border
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  bg-transparent
  border border-slate-200
  text-slate-700 text-sm font-medium
  rounded-lg
  hover:bg-slate-50
  hover:border-slate-300
  active:bg-slate-100
  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
  transition-colors duration-150
">
  Cancel
</button>
```

#### Button Sizes

```typescript
// Small (compact)
className="px-4 py-2 text-sm"

// Default
className="px-6 py-3 text-sm"

// Large (prominent)
className="px-8 py-4 text-base"
```

#### Button States

| State | Background | Border | Text | Example |
|-------|-----------|--------|------|---------|
| Default | white | slate-200 | slate-900 | "Generate" |
| Hover | slate-50 | slate-300 | slate-900 | Mouse over |
| Active | slate-100 | slate-300 | slate-900 | Clicked |
| Focus | white | slate-200 | slate-900 | Ring: slate-400 |
| Disabled | white | slate-200 | slate-400 | Opacity: 50% |
| Loading | white | slate-200 | slate-400 | Spinner + opacity |

### Cards & Containers

Cards use subtle borders and clean backgrounds. No heavy shadows.

#### Default Card

```tsx
<div className="
  bg-white
  border border-slate-200
  rounded-xl
  p-6
">
  <h3 className="text-lg font-semibold text-slate-900 mb-2">
    Card Title
  </h3>
  <p className="text-sm text-slate-600">
    Card content goes here
  </p>
</div>
```

#### Hoverable Card

```tsx
<div className="
  bg-white
  border border-slate-200
  rounded-xl
  p-6
  cursor-pointer
  transition-all duration-200
  hover:shadow-sm
  hover:border-slate-300
">
  {/* Content */}
</div>
```

#### Card Variants

| Variant | Border | Shadow | Background | Usage |
|---------|--------|--------|------------|-------|
| Default | slate-200 | none | white | Standard cards |
| Elevated | slate-200 | sm | white | Hoverable, interactive |
| Subtle | slate-100 | none | slate-50 | Less prominent content |

### Inputs & Textarea

Clean, minimal inputs with subtle borders and clear focus states.

#### Text Input

```tsx
<input
  type="text"
  className="
    w-full
    px-4 py-3
    bg-white
    border border-slate-200
    rounded-lg
    text-slate-900
    placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
    disabled:bg-slate-50 disabled:text-slate-400
    transition-colors duration-150
  "
  placeholder="Enter text here..."
/>
```

#### Textarea (Main Content Input)

```tsx
<textarea
  className="
    w-full
    min-h-[400px]
    px-6 py-4
    bg-white
    border border-slate-200
    rounded-xl
    text-slate-900 text-base
    placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
    resize-none
    transition-colors duration-150
  "
  placeholder="Paste your article, transcript, or notes here..."
/>
```

### Flashcards

Flashcards use a clean flip animation with subtle borders.

```tsx
// Front/Back styling
<div className="
  relative
  w-full
  min-h-[300px]
  bg-white
  border border-slate-200
  rounded-2xl
  p-8
  flex items-center justify-center
  text-center
  cursor-pointer
  transition-all duration-300
  hover:shadow-sm
  hover:border-slate-300
">
  <p className="text-xl text-slate-800 leading-relaxed">
    {content}
  </p>
</div>

// Hint text
<p className="absolute bottom-6 text-sm text-slate-400">
  Click to flip
</p>
```

### Quiz Options

Quiz options are styled as button groups with clear selection states.

```tsx
// Default (unselected)
<button className="
  w-full
  px-6 py-4
  bg-white
  border border-slate-200
  rounded-lg
  text-left
  text-slate-700 text-base
  hover:bg-slate-50
  hover:border-slate-300
  transition-colors duration-150
">
  Option text
</button>

// Selected (correct)
className="
  bg-green-50
  border-green-500
  text-green-700
"

// Selected (incorrect)
className="
  bg-red-50
  border-red-500
  text-red-700
"

// Selected (user choice, waiting for feedback)
className="
  bg-slate-100
  border-slate-400
  text-slate-900
"
```

### Progress Indicators

#### Linear Progress Bar

```tsx
<div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
  <div
    className="h-full bg-slate-400 rounded-full transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>
```

#### Step Counter

```tsx
<p className="text-sm text-slate-600">
  Card <span className="font-medium text-slate-900">{current}</span> of {total}
</p>
```

### Status Badges

```tsx
// Success
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
  Correct
</span>

// Error
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
  Incorrect
</span>

// Neutral
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
  In Progress
</span>
```

---

## Visual Hierarchy

Visual hierarchy guides attention through size, color, weight, and placement. In Chewit's minimalist aesthetic, hierarchy is subtle — never shouting.

### Hierarchy Levels

| Level | Size | Weight | Color | Usage |
|-------|------|--------|-------|-------|
| 1 (Primary) | 36-48px | 600 | slate-900 | Page title, main heading |
| 2 (Secondary) | 24-30px | 600 | slate-800 | Section headers |
| 3 (Tertiary) | 18-20px | 600 | slate-700 | Card titles, question text |
| 4 (Body) | 16px | 400 | slate-700 | Main content, answers |
| 5 (Supporting) | 14px | 400 | slate-500 | Descriptions, hints |
| 6 (Muted) | 12px | 400 | slate-400 | Metadata, timestamps |

### When to Use Each Tool

**Use Size for:**
- Distinguishing page hierarchy (h1, h2, h3)
- Making the most important element prominent
- Creating clear levels of importance

**Use Color for:**
- Semantic states (success, error, warning)
- De-emphasizing supporting text (slate-400, slate-500)
- Drawing attention to interactive elements

**Use Weight for:**
- Headings vs body text
- Emphasized words within text
- Creating contrast without changing size

**Use Placement for:**
- Visual flow (top to bottom, left to right)
- Grouping related elements
- Creating focal points

### Hierarchy Example (Quiz Screen)

```tsx
<div className="max-w-2xl mx-auto p-6">
  {/* Level 2: Section header */}
  <h2 className="text-2xl font-semibold text-slate-800 mb-2">
    Quiz
  </h2>

  {/* Level 6: Muted metadata */}
  <p className="text-xs text-slate-400 mb-8">
    Question 3 of 5
  </p>

  {/* Level 3: Question text */}
  <p className="text-xl font-semibold text-slate-700 mb-6">
    What does useEffect do?
  </p>

  {/* Level 4: Options */}
  <div className="space-y-3">
    <button className="text-base text-slate-700">
      Manages state
    </button>
    {/* ... */}
  </div>
</div>
```

---

## Interaction States

All interactive elements need clear states for hover, focus, active, disabled, and loading.

### Hover States

Hover indicates interactivity. Changes should be subtle but noticeable.

```tsx
// Button hover
className="hover:bg-slate-50 hover:border-slate-300"

// Card hover
className="hover:shadow-sm hover:border-slate-300"

// Link hover
className="hover:text-slate-900 hover:underline"
```

**Timing:** 150ms transition
```tsx
className="transition-colors duration-150"
```

### Focus States

Focus is critical for accessibility and keyboard navigation.

```tsx
// Standard focus ring
className="focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"

// Focus ring without offset (for full-width elements)
className="focus:outline-none focus:ring-2 focus:ring-slate-400"
```

**Requirements:**
- Always use `focus:outline-none` to remove browser default
- Add `focus:ring-2` (minimum 2px for visibility)
- Ring color: slate-400 (visible but not aggressive)
- Ring offset: 2px (creates space from element)

### Active/Pressed States

Active shows the element is being clicked/pressed.

```tsx
// Button active
className="active:bg-slate-100 active:scale-[0.98]"

// Subtle scale for tactile feedback
className="transition-all duration-100 active:scale-[0.98]"
```

### Disabled States

Disabled indicates an element is not interactive.

```tsx
// Button disabled
className="
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:hover:bg-white
  disabled:pointer-events-none
"

// Input disabled
className="
  disabled:bg-slate-50
  disabled:text-slate-400
  disabled:cursor-not-allowed
"
```

### Loading States

Loading shows async operations are in progress.

```tsx
// Button with spinner
<button
  disabled
  className="disabled:opacity-70"
>
  {isLoading && (
    <svg className="animate-spin h-4 w-4 mr-2">...</svg>
  )}
  Generating...
</button>

// Full-page loading
<div className="flex items-center justify-center min-h-[400px]">
  <div className="flex flex-col items-center gap-4">
    <svg className="animate-spin h-8 w-8 text-slate-400">...</svg>
    <p className="text-sm text-slate-500">Generating flashcards...</p>
  </div>
</div>
```

---

## Animation Guidelines

Animations in Chewit are purposeful and subtle. They provide feedback and delight without distracting from the study experience.

### Duration Standards

| Speed | Duration | Usage |
|-------|----------|-------|
| Fast | 100-150ms | Hover states, button clicks |
| Medium | 200-300ms | Card reveals, simple transitions |
| Slow | 400-600ms | Page transitions, complex animations |

### Easing Functions

| Easing | Tailwind | Usage |
|--------|----------|-------|
| ease-out | `ease-out` | Most interactions (smooth finish) |
| ease-in | `ease-in` | Closing/hiding (smooth start) |
| ease-in-out | `ease-in-out` | Center-stage transitions |

### What Should Animate

**Do Animate:**
- Hover states on buttons/cards
- Focus rings appearing
- Flashcard flip (3D transform)
- Progress bar filling
- Quiz option selection
- Page route transitions
- Modal appearing/disappearing

**Don't Animate:**
- Text content (unless it's a counter)
- Layout shifts (use layout prop)
- Scroll position (let user control)
- Background colors on page load
- Multiple things simultaneously

### Flashcard Flip Animation

```tsx
// CSS approach (in globals.css)
.flashcard {
  perspective: 1000px;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}
```

### Respect Reduced Motion

Always respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In Tailwind:
```tsx
className="transition-colors duration-150 motion-reduce:duration-0"
```

---

## Layout Principles

Chewit uses centered, focused layouts that create a calm reading experience.

### Grid System

```tsx
// Mobile-first: single column
<div className="grid grid-cols-1 gap-4">
  {/* Stacked on mobile */}
</div>

// Tablet+: two columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Side by side on tablet and up */}
</div>
```

### Container Centering

```tsx
// Narrow content (flashcards, quiz)
<div className="max-w-md mx-auto px-4">
  {/* Centered, focused content */}
</div>

// Medium content (forms, text)
<div className="max-w-2xl mx-auto px-4">
  {/* Wider but still focused */}
</div>

// Wide content (cards, lists)
<div className="max-w-4xl mx-auto px-4">
  {/* Fuller width */}
</div>
```

### Vertical Rhythm

```tsx
// Section spacing
<section className="space-y-6">
  <h2>Section Title</h2>
  <p>Section content</p>
</section>

// Component spacing
<div className="space-y-4">
  {items.map(item => (
    <Card key={item.id} />
  ))}
</div>
```

### Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Small adjustments |
| md | 768px | Tablet layout changes |
| lg | 1024px | Laptop/desktop |
| xl | 1280px | Large screens |
| 2xl | 1536px | Extra large screens |

**Mobile-First:**
```tsx
// Default (mobile)
<div className="px-4 py-6">

// Tablet+
<div className="md:px-8 md:py-12">

// Desktop+
<div className="lg:px-12 lg:py-16">
```

---

## Accessibility Standards

Accessibility is non-negotiable. Chewit must be usable by everyone.

### Color Contrast

All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Verified Contrast Ratios:**
| Foreground | Background | Ratio | Pass? |
|------------|------------|-------|-------|
| slate-900 | white | 15.6:1 | Yes |
| slate-700 | white | 8.4:1 | Yes |
| slate-500 | white | 4.6:1 | Yes (barely) |
| slate-400 | white | 2.8:1 | No — use for large text only |
| green-600 | white | 4.6:1 | Yes |
| red-500 | white | 4.5:1 | Yes (barely) |
| amber-500 | white | 4.2:1 | No — use amber-600 |

**Rule:** Use slate-500 or darker for body text. Use slate-400 only for large text (18px+) or decorative elements.

### Focus Indicators

All interactive elements must have visible focus indicators:

```tsx
// Minimum: 2px ring
className="focus:ring-2 focus:ring-slate-400"

// Better: 2px ring + offset
className="focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
```

### Touch Target Sizes

All interactive elements must be at least 44x44px:

```tsx
// Buttons
className="min-h-[44px] min-w-[44px] px-6 py-3"

// Small buttons (icon-only)
className="h-11 w-11 flex items-center justify-center"
```

### ARIA Labels

Interactive elements without visible text need ARIA labels:

```tsx
// Icon button
<button aria-label="Flip card">
  <FlipIcon />
</button>

// Close button
<button aria-label="Close modal">
  <XIcon />
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Semantic HTML

Use proper semantic elements:

```tsx
// Use heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>

// Use proper list semantics
<ul role="list">
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>

// Use buttons for actions, links for navigation
<button onClick={handleSubmit}>Submit</button>
<Link href="/study">Start Studying</Link>
```

### Keyboard Navigation

All functionality must be accessible via keyboard:

```tsx
// Common keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case ' ':
    case 'Enter':
      flipCard();
      break;
    case 'ArrowRight':
      nextCard();
      break;
    case 'ArrowLeft':
      previousCard();
      break;
    case 'Escape':
      closeModal();
      break;
  }
};
```

---

## Do's and Don'ts

### Visual Design

**DO:**
- Use generous whitespace between elements
- Keep borders subtle (slate-200, 1px)
- Use slate-900/800/700 for text hierarchy
- Round corners moderately (lg: 8px, xl: 12px, 2xl: 16px)
- Keep shadows minimal or nonexistent

**DON'T:**
- Use heavy shadows (shadow-lg, shadow-xl)
- Add gradients or glows
- Use bright, saturated colors
- Make borders thicker than 1px
- Over-round corners (3xl+)

### Colors

**DO:**
- Use slate grays for neutral UI
- Reserve green/red for semantic feedback
- Keep backgrounds white or very light (slate-50)
- Use opacity for disabled states

**DON'T:**
- Use color as the only indicator (add icons/text too)
- Use bright red for errors (use red-500, not red-600)
- Use pure black (#000) — use slate-900 instead
- Add colored backgrounds to large areas

### Typography

**DO:**
- Use Inter for all text
- Stick to the type scale (don't use arbitrary sizes)
- Use font-weight 600 for headings, 400 for body
- Keep line height relaxed (1.5-1.6)

**DON'T:**
- Use font-weight 700+ (too heavy)
- Use tight line height (< 1.4)
- Mix multiple typefaces
- Use all caps (unless very small labels)

### Spacing

**DO:**
- Use Tailwind spacing scale (4px base)
- Add consistent padding (16-24px) to cards
- Use gap utilities instead of margins in flex/grid
- Center content with max-width utilities

**DON'T:**
- Use arbitrary spacing values
- Cramp content with tight padding (< 12px)
- Mix margins and padding inconsistently
- Let content get too wide (> 1000px for text)

### Animations

**DO:**
- Animate opacity and transform (GPU-accelerated)
- Use fast durations (150-300ms)
- Respect prefers-reduced-motion
- Animate on hover/focus/active

**DON'T:**
- Animate layout properties (width, height, top, left)
- Use slow, sluggish animations (> 400ms)
- Animate multiple things simultaneously
- Add animations that don't serve a purpose

### Components

**DO:**
- Keep button styles consistent
- Use borders to define containers
- Add subtle hover states
- Make touch targets at least 44px

**DON'T:**
- Mix button styles arbitrarily
- Add heavy shadows to cards
- Remove borders from inputs
- Make clickable elements too small

### Accessibility

**DO:**
- Ensure 4.5:1 contrast ratio for text
- Add visible focus indicators
- Include ARIA labels for icon-only buttons
- Support keyboard navigation

**DON'T:**
- Rely on color alone to convey meaning
- Remove focus outlines without replacement
- Use tiny touch targets
- Ignore screen reader users

---

## Examples: Good vs Bad

### Button Styling

**GOOD:**
```tsx
<button className="
  px-6 py-3
  bg-white
  border border-slate-200
  text-slate-900 font-medium
  rounded-lg
  hover:bg-slate-50
  focus:ring-2 focus:ring-slate-400
">
  Generate
</button>
```

**BAD:**
```tsx
<button className="
  px-4 py-2
  bg-gradient-to-r from-blue-500 to-purple-600
  text-white font-bold
  rounded-full
  shadow-lg
  hover:scale-110
">
  Generate
</button>
```

### Card Styling

**GOOD:**
```tsx
<div className="
  bg-white
  border border-slate-200
  rounded-xl
  p-6
">
  Content here
</div>
```

**BAD:**
```tsx
<div className="
  bg-gradient-to-br from-slate-50 to-slate-100
  border-2 border-slate-300
  rounded-3xl
  p-8
  shadow-xl
">
  Content here
</div>
```

### Text Hierarchy

**GOOD:**
```tsx
<h1 className="text-4xl font-semibold text-slate-900">
  Flashcards
</h1>
<p className="text-sm text-slate-500 mt-2">
  Review your key concepts
</p>
```

**BAD:**
```tsx
<h1 className="text-5xl font-bold text-blue-600">
  FLASHCARDS!!!
</h1>
<p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
  Review Your Key Concepts
</p>
```

---

## Implementation Checklist

Before considering a component complete, verify:

- [ ] Uses correct color from palette (no arbitrary colors)
- [ ] Follows typography scale (no arbitrary sizes)
- [ ] Has proper hover, focus, active, disabled states
- [ ] Includes focus indicators (ring-2 minimum)
- [ ] Touch targets are at least 44x44px
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Uses semantic HTML (button, not div)
- [ ] Has ARIA labels where needed (icon buttons)
- [ ] Animations respect prefers-reduced-motion
- [ ] Responsive on mobile viewport (375px+)
- [ ] Spacing uses Tailwind scale (no arbitrary px values)
- [ ] Borders are subtle (slate-200, 1px)
- [ ] No heavy shadows (shadow-lg or higher)

---

## Resources

### Design Inspiration
- [Notion](https://notion.so) — Primary inspiration for aesthetic
- [Linear](https://linear.app) — Interaction patterns
- [Arc Browser](https://arc.net) — Minimalist UI approach

### Tools
- [Tailwind CSS](https://tailwindcss.com) — Utility framework
- [shadcn/ui](https://ui.shadcn.com) — Component base
- [Radix UI](https://www.radix-ui.com) — Accessible primitives
- [Framer Motion](https://www.framer.com/motion) — Animation library (optional)

### Color Tools
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Typography
- [Inter Font](https://rsms.me/inter/)
- [Type Scale Calculator](https://type-scale.com/)

---

**Last Updated:** 2026-03-03
**Maintained By:** Design System (update as patterns evolve)
