import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSessionsForUser } from "@/lib/pocketbase-server";
import { GymsResponse, ProfilesResponse, SessionsResponse } from "@/types/pocketbase";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { createServerClient } from "@/lib/pocketbase-server";

type ProfileWithGym = ProfilesResponse<{ gym_id: GymsResponse }>;

const BELT_COLORS: Record<string, string> = {
  white: "bg-white border border-zinc-300",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  brown: "bg-amber-800",
  black: "bg-zinc-900 dark:bg-zinc-600",
};

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

const SESSION_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open Mat",
};

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Your BJJ training diary.
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mb-10">
            Log every session, track your rounds, and build your technique library — all in one place.
          </p>

          <div className="flex gap-3">
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Get started free
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Sign in
              </button>
            </SignInButton>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full text-left">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Track Sessions</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Log every training session with gym, coach, duration, and notes.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Log Rolling Rounds</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Record your sparring partners, belt levels, and round outcomes.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Technique Library</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tag techniques you drilled each session from a shared library.</p>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} JitsDiary
        </footer>
      </div>
    );
  }


  const pb = createServerClient();
  const [sessions, { items: profiles }] = await Promise.all([
    getSessionsForUser(userId) as Promise<SessionWithGym[]>,
    pb.collection("profiles").getList(1, 1, {
      filter: `user_id = "${userId}"`,
      expand: "gym_id",
    }),
  ]);
  const profile = (profiles[0] as ProfileWithGym) ?? null;

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
          {profile?.display_name ? `Welcome back, ${profile.display_name}` : "Dashboard"}
        </h1>

        {/* Profile summary */}
        {profile ? (
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              {profile.belt && (
                <div className={`h-8 w-8 rounded-full ${BELT_COLORS[profile.belt]}`} />
              )}
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {profile.display_name ?? "Your Profile"}
                </p>
                <p className="text-sm text-zinc-500">
                  {profile.belt
                    ? `${profile.belt.charAt(0).toUpperCase() + profile.belt.slice(1)} belt`
                    : "No belt set"}
                  {profile.stripes ? ` · ${profile.stripes} stripe${profile.stripes > 1 ? "s" : ""}` : ""}
                  {profile.expand?.gym_id ? ` · ${profile.expand.gym_id.name}` : ""}
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Edit &rarr;
            </Link>
          </div>
        ) : (
          <Link
            href="/profile"
            className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900 hover:border-zinc-400 transition"
          >
            <p className="text-sm text-zinc-500">Set up your profile — add your belt and home gym</p>
            <span className="text-sm text-zinc-400">&rarr;</span>
          </Link>
        )}

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
