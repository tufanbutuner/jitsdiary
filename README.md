# JitsDiary

A jiu-jitsu training diary built with Next.js and PocketBase.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **PocketBase** (database & authentication)
- **shadcn/ui** (components)

## Getting Started

### Prerequisites

- Node.js 18+
- A running [PocketBase](https://pocketbase.io/) instance

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Docs

Coding standards and conventions live in the `/docs` directory:

- [`/docs/ui.md`](./docs/ui.md) — UI component and date formatting standards
- [`/docs/data-fetching.md`](./docs/data-fetching.md) — data fetching and database query standards
- [`/docs/auth.md`](./docs/auth.md) — authentication standards (PocketBase)
