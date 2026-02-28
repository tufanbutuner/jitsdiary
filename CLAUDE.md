# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs First

Before generating any code, always consult the relevant file(s) in the `/docs` directory. The docs define the standards and conventions for this project and must be followed without exception.

- `/docs/ui.md` — UI component and date formatting standards
- `/docs/data-fetching.md` — data fetching and database query standards

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)

## Architecture

This is a Next.js App Router project. All routes live under `app/`. The path alias `@/*` maps to the project root.

- `app/layout.tsx` — root layout with Geist font variables and global CSS
- `app/page.tsx` — home page (currently the default create-next-app template)
- `app/globals.css` — global styles

New pages go in `app/<route>/page.tsx`. Shared components should be placed in a `components/` directory at the root. Server components are the default; add `"use client"` only when browser APIs or React hooks are needed.
