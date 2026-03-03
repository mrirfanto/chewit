# Chewit

> Transform any content into interactive flashcards and quizzes powered by AI.

**Status:** 🚧 In Development (Phase 1/12)

## 📖 About

Chewit is a personal web application that turns text-based content (articles, transcripts, documentation) into engaging learning experiences. Paste content → get AI-generated flashcards and multiple-choice quizzes → study and retain more.

### Features

- 📝 **Simple Input**: Paste any text or transcript
- 🤖 **AI-Powered**: Auto-generates flashcards and quizzes using Claude
- 🎴 **Flashcard Mode**: Interactive flip-card study experience
- ❓ **Quiz Mode**: Multiple-choice questions with instant feedback
- 📊 **Score Tracking**: See your progress and review wrong answers
- 💾 **Local Storage**: All data stored locally, no account needed

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

- **[PRD](docs/PRD.md)** — Product Requirements Document
- **[Roadmap](docs/ROADMAP.md)** — Implementation plan with 153 atomic tasks
- **[Status](docs/STATUS.md)** — Development progress and session log
- **[Conventions](docs/CONVENTIONS.md)** — Code style and workflow standards
- **[Design System](docs/DESIGN.md)** — UI/UX guidelines (Notion-like aesthetic)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Claude API (Haiku model)
- **Language**: TypeScript
- **Storage**: localStorage (MVP)

## 🎯 Development Status

**Current Phase**: Phase 1 — Home Page + Content Input

**Progress**: 8/153 tasks completed (5%)

**Recent Updates**:
- ✅ Project scaffolding complete
- ✅ shadcn/ui components installed
- ✅ TypeScript types defined
- ✅ Route structure created

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
