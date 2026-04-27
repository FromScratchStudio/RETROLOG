# RETROLOG

**Agile Retrospective & Project Diary** — A fully client-side SPA for capturing, analyzing and acting on team retrospectives and project events.

## Live App

Deployed to GitHub Pages at: **https://fromscratchstudio.github.io/RETROLOG/**

## Features

- **Dashboard** — Team health sliders, at-a-glance metrics, sprint health, recent activity
- **Projects** — Manage projects with methodology, status, color-coding, and cascade deletes
- **Sprints** — Track sprint velocity, mood, and goals
- **Logbook** — Date-grouped project diary entries
- **Events** — Capture and analyze project events (problems, successes, blockers, risks, decisions, ideas) with Board + List views
- **RetroBoard** — Sprint retrospective board with drag-assign event pool, action items, and auto-save
- **Actions** — Kanban + list view for action items with pipeline (open → in-progress → done)
- **Reports** — Read-only retrospective reports
- **Settings** — App whitelabel, user identity, JSON export/import (merge/overwrite), full reset

## Stack

- **React 19** + **TypeScript 5** + **Vite 8**
- **Zustand 5** with `persist` middleware → `localStorage` key `retrolog-store`
- Inline CSS-in-JS only (no CSS framework)
- Google Fonts: DM Serif Display + JetBrains Mono
- No backend — 100% local storage

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Lint
```

## Data Persistence

All data is stored in `localStorage` under the key `retrolog-store`. Use **Settings → Export** to back up your data as JSON and **Import** to restore or merge data across instances.
