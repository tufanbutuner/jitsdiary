# Data Fetching Standards

## Server Components Only

**All data fetching must be done exclusively via React Server Components.**

- Do NOT fetch data in route handlers (`app/api/`)
- Do NOT fetch data in client components (`"use client"`)
- Do NOT use `useEffect`, `SWR`, `React Query`, or any other client-side fetching mechanism
- Do NOT fetch data in middleware
- No exceptions to this rule.

Data fetching happens at the page or layout level (or in server components they render), never on the client.

## Data Helper Functions

**All database queries must be implemented as helper functions in the `/data` directory.**

- Every query lives in a file under `/data` (e.g., `/data/sessions.ts`, `/data/users.ts`)
- Server components call these helpers — they never issue raw queries directly
- Helper functions are the single place where database access occurs

### Example structure

```
/data
  sessions.ts   # getSessionsByUser(), getSessionById(), etc.
  users.ts      # getUserById(), etc.
```

```ts
// data/sessions.ts
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getSessions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.sessions.findMany({
    where: (s, { eq }) => eq(s.userId, session.user.id),
  });
}
```

```tsx
// app/sessions/page.tsx (Server Component)
import { getSessions } from "@/data/sessions";

export default async function SessionsPage() {
  const sessions = await getSessions();
  // ...
}
```

## Authorization — Users Must Only Access Their Own Data

This is critical. Every data helper function **must** enforce that the currently authenticated user can only access their own data.

Rules:
1. Always resolve the current user inside the helper function via `auth()` (or equivalent)
2. Always filter queries by the authenticated user's ID — never accept a `userId` parameter from the caller
3. If the user is not authenticated, return an empty result or throw an appropriate error
4. Never expose another user's data under any circumstances

### Anti-patterns to avoid

```ts
// WRONG — accepts userId from caller, allows accessing any user's data
export async function getSessions(userId: string) {
  return db.query.sessions.findMany({
    where: (s, { eq }) => eq(s.userId, userId),
  });
}

// WRONG — no auth check, returns all data
export async function getSessions() {
  return db.query.sessions.findMany();
}
```

### Correct pattern

```ts
// CORRECT — resolves the current user internally, no external userId accepted
export async function getSessions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.sessions.findMany({
    where: (s, { eq }) => eq(s.userId, session.user.id),
  });
}
```

The authenticated user's ID must always come from the server-side auth session, never from request parameters, query strings, or caller arguments.
