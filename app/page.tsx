import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            JitsDiary
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Track your BJJ journey
          </p>
        </div>

        <nav className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/sessions"
            className="flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-700 transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View Sessions
          </Link>
        </nav>
      </main>
    </div>
  );
}
