# Chewit

> Transform any content into interactive flashcards and quizzes powered by AI.

**Status:** 🚧 In Development (Phase 5/12 — 90% Complete)

## 📖 About

Chewit is a personal web application that turns text-based content (articles, transcripts, documentation) into engaging learning experiences. Paste content → get AI-generated flashcards and multiple-choice quizzes → study and retain more.

### Features

- 📝 **Simple Input**: Paste any text or transcript
- 🤖 **AI-Powered**: Auto-generates flashcards and quizzes using Claude
- 🎴 **Flashcard Mode**: Interactive flip-card study experience with 3D animations
- ❓ **Quiz Mode**: Multiple-choice questions with instant feedback
- 📊 **Score Tracking**: See your progress and review wrong answers
- 💾 **Cloud Storage**: Supabase integration for cross-device deck access
- ✏️ **Deck Management**: Edit deck titles, delete decks, organize your learning
- 🔄 **Smart Retry**: Re-quiz yourself on wrong answers

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
chewit/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── shared/      # Shared components
│   ├── flashcards/  # Flashcard components
│   └── quiz/        # Quiz components
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
├── docs/            # Documentation
└── public/          # Static assets
```

## 📚 Documentation

**📖 [Documentation Index](docs/INDEX.md)** — Complete guide to all project documentation

**Key Documents:**
- **[PRD](docs/PRD.md)** — Product Requirements Document
- **[Roadmap](docs/ROADMAP.md)** — Implementation plan with 153 atomic tasks
- **[Status](docs/STATUS.md)** — Development progress and session log
- **[Supabase Plan](docs/SUPABASE_PLAN.md)** — Database architecture and setup

**Quick Reference:**
- **[Conventions](docs/CONVENTIONS.md)** — Code style and workflow standards
- **[Design System](docs/DESIGN.md)** — UI/UX guidelines (Notion-like aesthetic)
- **[Supabase Roadmap](docs/SUPABASE_ROADMAP.md)** — Backend implementation tasks

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Claude API (Haiku model)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 🎯 Development Status

**Progress**: 137/153 tasks completed (90%)

**Current Phase**: Phase 5 — Deck Management Features

**Recent Updates**:
- ✅ Deck title editing implemented
- ✅ Supabase integration complete
- ✅ Error handling and loading states
- ✅ UI polish and animations
- ✅ Deployed to production

See [STATUS.md](docs/STATUS.md) for detailed progress.

## 🤝 Contributing

This is a personal project, but feel free to:
- Report bugs via issues
- Suggest features
- Fork for your own use

## 📄 License

MIT

---

**Built with ❤️ for personal learning**
