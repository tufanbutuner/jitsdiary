import SessionCalendar from "@/components/SessionCalendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth";
import {
  createServerClient,
  getSessionsForUser,
} from "@/lib/pocketbase-server";
import {
  GymsResponse,
  ProfilesResponse,
  SessionsResponse,
} from "@/types/pocketbase";
import Link from "next/link";

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
  const authUser = await getAuthUser();

  if (!authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Your BJJ training diary.
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mb-10">
            Log every session, track your rounds, and build your technique
            library — all in one place.
          </p>

          <div className="flex gap-3">
            <Link href="/sign-up">
              <button className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Get started free
              </button>
            </Link>
            <Link href="/sign-in">
              <button className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Sign in
              </button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full text-left">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Track Sessions</CardTitle>
                <CardDescription>
                  Log every training session with gym, coach, duration, and
                  notes.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Log Rolling Rounds</CardTitle>
                <CardDescription>
                  Record your sparring partners, belt levels, and round
                  outcomes.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Technique Library</CardTitle>
                <CardDescription>
                  Tag techniques you drilled each session from a shared library.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} JitsDiary
        </footer>
      </div>
    );
  }

  const { userId } = authUser;
  const pb = createServerClient();
  const [sessions, { items: profiles }] = await Promise.all([
    getSessionsForUser(userId) as Promise<SessionWithGym[]>,
    pb.collection("profiles").getList(1, 1, {
      filter: `user_id = "${userId}"`,
      expand: "gym_id",
    }),
  ]);
  const profile = (profiles[0] as ProfileWithGym) ?? null;
  const userName =
    (authUser.pb.authStore.record?.name as string | null) ?? null;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const sessionsThisWeek = sessions.filter(
    (s) => new Date(s.date) >= startOfWeek,
  );
  const totalMinutes = sessions.reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0),
    0,
  );
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {profile?.display_name
            ? `Welcome back, ${profile.display_name}`
            : "Dashboard"}
        </h1>

        {/* Profile summary */}
        {profile ? (
          <Card className="py-4">
            <CardContent className="flex items-center justify-between py-0">
              <div className="flex items-center gap-4">
                {profile.belt && (
                  <div
                    className={`h-8 w-8 rounded-full ${BELT_COLORS[profile.belt]}`}
                  />
                )}
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {userName ?? profile.display_name ?? "Your Profile"}
                  </p>
                  {profile.display_name && (
                    <p className="text-xs text-muted-foreground">
                      {profile.display_name}
                    </p>
                  )}
                  <p className="text-sm text-zinc-500">
                    {profile.belt
                      ? `${profile.belt.charAt(0).toUpperCase() + profile.belt.slice(1)} belt`
                      : "No belt set"}
                    {profile.stripes
                      ? ` · ${profile.stripes} stripe${profile.stripes > 1 ? "s" : ""}`
                      : ""}
                    {profile.expand?.gym_id
                      ? ` · ${profile.expand.gym_id.name}`
                      : ""}
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Edit &rarr;
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Link href="/profile">
            <Card className="border-dashed py-4 hover:border-zinc-400 transition mb-6">
              <CardContent className="flex items-center justify-between py-0">
                <p className="text-sm text-muted-foreground">
                  Set up your profile — add your belt and home gym
                </p>
                <span className="text-sm text-muted-foreground">&rarr;</span>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card className="py-4">
            <CardContent className="py-0">
              <p className="text-sm text-muted-foreground">
                Sessions this week
              </p>
              <p className="mt-1 text-3xl font-semibold">
                {sessionsThisWeek.length}
              </p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="py-0">
              <p className="text-sm text-muted-foreground">Total sessions</p>
              <p className="mt-1 text-3xl font-semibold">{sessions.length}</p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="py-0">
              <p className="text-sm text-muted-foreground">Hours trained</p>
              <p className="mt-1 text-3xl font-semibold">
                {Math.floor(totalMinutes / 60)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar + Recent sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Calendar */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Training Calendar
            </h2>
            <SessionCalendar sessionDates={sessions.map((s) => s.date)} />
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
              <Card className="border-dashed p-10 text-center">
                <CardContent className="py-0">
                  <p className="text-muted-foreground mb-1 font-medium">
                    No sessions yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Go to{" "}
                    <Link href="/sessions" className="underline">
                      Sessions
                    </Link>{" "}
                    to log your first training session.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-3">
                {recentSessions.map((session) => {
                  const gym = session.expand?.gym_id;
                  return (
                    <li key={session.id}>
                      <Link href={`/sessions/${session.id}`}>
                        <Card className="py-4 transition hover:shadow-md">
                          <CardContent className="flex items-center justify-between py-0">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {new Date(session.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                              <span className="text-sm text-muted-foreground">
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
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
