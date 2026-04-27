# RETROLOG

**Agile Retrospective & Project Diary** — A fully client-side SPA for capturing, analysing and acting on team retrospectives and project events. No account, no backend, no data leaves your device.

## Live App

**https://fromscratchstudio.github.io/RETROLOG/**

---

## What is RETROLOG?

RETROLOG is a lightweight tool designed for agile teams and solo practitioners who want to:

- Keep a structured **diary of project events** (problems, wins, blockers, decisions, ideas) as they happen
- Run **sprint retrospectives** without needing an external SaaS tool
- Track **action items** through a simple Kanban pipeline
- Review **historical retrospective reports** at any time

All data is stored in the browser's `localStorage` under the key `retrolog-store`. Nothing is ever sent to a server.

---

## Features

| Page | Purpose |
|------|---------|
| **Dashboard** | Team health sliders (Energy, Focus, Satisfaction), sprint progress, recent activity |
| **Projects** | Create and manage projects with methodology, status, colour-coding and cascade deletes |
| **Sprints** | Plan sprints with goals, dates, and velocity targets; track actual velocity |
| **Logbook** | Free-form, date-grouped project diary entries |
| **Events** | Capture project events by type (Problem, Success, Blocker, Risk, Decision, Idea) — Board & List views |
| **RetroBoard** | Sprint retrospective board: drag events into columns, add action items, set team mood, auto-save |
| **Actions** | Kanban pipeline for action items: Open → In Progress → Done |
| **Reports** | Read-only archive of completed retrospectives |
| **User Guide** | In-app manual with quick-start steps, page descriptions, and tips |
| **Settings** | App whitelabel, user identity, JSON export/import (merge or overwrite), full reset |

---

## Stack

- **React 19** + **TypeScript 5** + **Vite 8**
- **Zustand 5** with `persist` middleware → `localStorage`
- Inline CSS-in-JS only (no CSS framework)
- Google Fonts: DM Serif Display + JetBrains Mono
- No backend — 100 % client-side

---

## Development

```bash
npm install
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run lint     # ESLint
```

---

## Data Management

| Action | How |
|--------|-----|
| **Backup** | Settings → Export → saves a `.json` file |
| **Restore** | Settings → Import → choose a previously exported file |
| **Merge** | Import with "Merge" to add imported records on top of existing data |
| **Overwrite** | Import with "Overwrite" to replace all local data |
| **Full reset** | Settings → Reset — erases everything from `localStorage` |

> **Important:** clearing browser data (cookies / site data) will erase all RETROLOG data. Export regularly.

---

## Project Structure

```
src/
├── components/
│   ├── layout/       # TopBar
│   ├── ui/           # Shared UI primitives (Card, Badge, etc.)
│   └── views/        # One file per page
├── store/            # Zustand store (useStore.ts)
├── types/            # Shared TypeScript types
├── theme.ts          # Colour palette & font constants
└── main.tsx          # App entry point
```

