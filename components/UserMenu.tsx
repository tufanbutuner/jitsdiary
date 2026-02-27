"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface UserMenuProps {
  isLoggedIn: boolean;
  userEmail: string | null;
}

export default function UserMenu({ isLoggedIn, userEmail }: UserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <>
        <Link
          href="/sign-in"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign up
        </Link>
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {userEmail && (
        <span className="hidden sm:inline text-sm text-zinc-500 dark:text-zinc-400">
          {userEmail}
        </span>
      )}
      <Button onClick={handleSignOut}>Sign out</Button>
    </div>
  );
}
