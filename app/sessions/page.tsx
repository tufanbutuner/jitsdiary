import Link from "next/link";
import { SessionsResponse, GymsResponse } from "@/types/pocketbase";

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

const SESSION_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open Mat",
};

async function getSessions(): Promise<{ items: SessionWithGym[] }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/sessions`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export default async function SessionsPage() {
  const { items: sessions } = await getSessions();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sessions
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            &larr; Home
          </Link>
        </div>

        {sessions.length === 0 ? (
          <p className="text-zinc-500">
            No sessions yet. Add one via the{" "}
            <a
              href="http://127.0.0.1:8090/_/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              PocketBase admin
            </a>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => {
              const gym = session.expand?.gym_id;
              return (
                <li key={session.id}>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {gym?.name ?? "No gym"}
                        {session.duration_minutes
                          ? ` · ${session.duration_minutes} min`
                          : ""}
                      </span>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {SESSION_TYPE_LABELS[session.session_type] ??
                        session.session_type}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
