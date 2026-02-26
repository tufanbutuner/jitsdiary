import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSessionsForUser } from "@/lib/pocketbase-server";
import { GymsResponse, SessionsResponse } from "@/types/pocketbase";

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

const SESSION_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open Mat",
};

export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const sessions = (await getSessionsForUser(userId)) as SessionWithGym[];

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const sessionsThisWeek = sessions.filter(
    (s) => new Date(s.date) >= startOfWeek
  );
  const totalMinutes = sessions.reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0),
    0
  );
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Sessions this week</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {sessionsThisWeek.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total sessions</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {sessions.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Hours trained</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.floor(totalMinutes / 60)}
            </p>
          </div>
        </div>

        {/* Recent sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Recent Sessions
            </h2>
            <Link
              href="/sessions"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View all &rarr;
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center">
              <p className="text-zinc-500 dark:text-zinc-400 mb-1 font-medium">No sessions yet</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Go to{" "}
                <Link href="/sessions" className="underline">
                  Sessions
                </Link>{" "}
                to log your first training session.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentSessions.map((session) => {
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
                        {SESSION_TYPE_LABELS[session.session_type] ?? session.session_type}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
