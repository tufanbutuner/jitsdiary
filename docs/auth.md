# Authentication Standards

## Auth Provider

**This app uses [PocketBase](https://pocketbase.io/) for authentication exclusively.**

- Do NOT use NextAuth, Clerk, Auth.js, Supabase Auth, or any other auth library
- Do NOT implement custom JWT handling or session management
- All authentication is handled through the PocketBase SDK
- No exceptions to this rule.

## PocketBase Client

**A single PocketBase client instance must be used across the app.**

- The client lives at `@/lib/pb` (i.e., `/lib/pb.ts`)
- Import `pb` from this module wherever PocketBase access is needed
- Do NOT instantiate `new PocketBase(...)` outside of `/lib/pb.ts`

```ts
// lib/pb.ts
import PocketBase from "pocketbase";

export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
```

## Reading the Current User

**Always read the authenticated user from the PocketBase auth store on the server.**

- Use `pb.authStore.model` to access the current user record
- Wrap this in a helper function at `@/lib/auth.ts` so all code goes through a single, consistent interface
- Never read auth state directly from cookies, headers, or request parameters

```ts
// lib/auth.ts
import { pb } from "@/lib/pb";

export function getCurrentUser() {
  return pb.authStore.isValid ? pb.authStore.model : null;
}
```

## Auth in Data Helpers

**Every data helper in `/data` must resolve the current user via `getCurrentUser()` from `@/lib/auth`.**

- Call `getCurrentUser()` at the top of every helper
- If the user is not authenticated, return an empty result or throw an appropriate error
- Never accept a user ID as a parameter — always derive it from the auth store

```ts
// data/sessions.ts
import { pb } from "@/lib/pb";
import { getCurrentUser } from "@/lib/auth";

export async function getSessions() {
  const user = getCurrentUser();
  if (!user) return [];

  return pb.collection("sessions").getFullList({
    filter: `userId = "${user.id}"`,
  });
}
```

## Sign In and Sign Out

**Auth actions (sign in, sign out) must only be triggered from client components or Server Actions.**

- Sign in via `pb.collection("users").authWithPassword(email, password)`
- Sign out via `pb.authStore.clear()`
- After sign-in or sign-out, redirect using Next.js `router.push()` (client) or `redirect()` (server action)

```ts
// Example sign-in (client component)
"use client";
import { pb } from "@/lib/pb";
import { useRouter } from "next/navigation";

const router = useRouter();

async function signIn(email: string, password: string) {
  await pb.collection("users").authWithPassword(email, password);
  router.push("/dashboard");
}

async function signOut() {
  pb.authStore.clear();
  router.push("/login");
}
```

## Route Protection

**Protect authenticated routes at the page level using server-side auth checks.**

- At the top of any page or layout that requires authentication, call `getCurrentUser()` and redirect unauthenticated users to `/login`
- Do NOT use middleware for route protection
- Do NOT rely on client-side redirects as the sole guard

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  // ...
}
```

## Environment Variables

| Variable                      | Description                        |
| ----------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_POCKETBASE_URL`  | Base URL of your PocketBase instance (e.g. `http://127.0.0.1:8090`) |

The `NEXT_PUBLIC_` prefix is required so the PocketBase SDK can function in both server and client contexts.
