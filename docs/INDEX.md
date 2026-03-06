# Chewit Documentation Index

> Quick access to all project documentation

## 📖 Core Documentation

| Document | Description | Last Updated |
|----------|-------------|--------------|
| **[PRD](PRD.md)** | Product Requirements Document — feature specs, technical architecture, success metrics | 2026-03-03 |
| **[ROADMAP](ROADMAP.md)** | Implementation plan with 153 atomic tasks across 12 phases | 2026-03-03 |
| **[STATUS](STATUS.md)** | Development progress, session log, decisions made, time tracking | 2026-03-03 |
| **[CONVENTIONS](CONVENTIONS.md)** | Code style, file organization, Git conventions, testing strategy | 2026-03-03 |
| **[DESIGN](DESIGN.md)** | Design system — colors, typography, components, Notion-like aesthetic | 2026-03-03 |

## 🚀 Quick Reference


### Project Status
- **Current Phase**: Phase 4: Ready to Test (Phases 0-3 Complete)
- **Progress**: 67/153 tasks (44%)
- **Total Time**: ~6.5 hours
- **Latest**: Phase 3 complete — Claude API integrated with real flashcard and quiz generation
### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Lucide React (icons)
- Claude API (Haiku)
- localStorage (MVP)

### Installed shadcn Components
- Button, Card, Input, Textarea, Progress
- Skeleton, Alert, Badge (added Phase 1)

### Folder Structure
```
chewit/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home page (✅ Phase 1 complete)
│   └── study/             # Study routes (Phase 2)
├── components/
│   ├── ui/                # shadcn components (9 installed)
│   └── shared/            # Shared components
├── lib/                   # Utilities
├── types/                 # TypeScript types
├── hooks/                 # Custom hooks
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🎯 Development Workflow

1. **Check STATUS.md** — See current progress and last session notes
2. **Reference ROADMAP.md** — Find next task to complete
3. **Follow CONVENTIONS.md** — Maintain code consistency
4. **Use DESIGN.md** — Match design system specifications

## 📝 Document Guide

- **New to the project?** Start with [PRD.md](PRD.md)
- **Want to contribute?** Read [CONVENTIONS.md](CONVENTIONS.md)
- **Building UI?** Reference [DESIGN.md](DESIGN.md)
- **Tracking progress?** Check [STATUS.md](STATUS.md)
- **Planning work?** See [ROADMAP.md](ROADMAP.md)

---

*Documentation last updated: 2026-03-03*
