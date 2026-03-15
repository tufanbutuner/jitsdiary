import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getSessions } from "@/data/sessions";
import { getGyms } from "@/data/gyms";
import { getProfile } from "@/data/profile";
import { getAuthUser } from "@/lib/auth";
import NewSessionModal from "@/components/modals/NewSessionModal";
import { Card, CardContent } from "@/components/ui/card";
import { SESSION_TYPE_LABELS } from "@/lib/constants";

function getMonthKey(date: string) {
  // date is "YYYY-MM-DD..." — take the local date parts directly to avoid UTC shift
  const [year, month] = date.split("T")[0].split("-");
  return `${year}-${month}`;
}

function formatMonthKey(key: string) {
  const [year, month] = key.split("-");
  return format(new Date(Number(year), Number(month) - 1, 1), "MMMM yyyy");
}

export default async function SessionsPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const [sessions, gyms, profile] = await Promise.all([
    getSessions(),
    getGyms(),
    getProfile(),
  ]);

  // Group sessions by month, preserving sort order (already -date from server)
  type SessionWithGym = (typeof sessions)[number];
  const groups: { key: string; sessions: SessionWithGym[] }[] = [];
  for (const session of sessions) {
    const key = getMonthKey(session.date);
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.sessions.push(session);
    } else {
      groups.push({ key, sessions: [session] });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sessions</h1>
          <NewSessionModal gyms={gyms} defaultGymId={profile?.gym_id ?? ""} />
        </div>

        {sessions.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <CardContent className="py-0">
              <p className="text-muted-foreground mb-1 font-medium">No sessions yet</p>
              <p className="text-sm text-muted-foreground">
                Hit &ldquo;+ New Session&rdquo; above to log your first training session.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {groups.map(({ key, sessions: monthSessions }) => (
              <section key={key}>
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                  {formatMonthKey(key)}
                  <span className="ml-2 font-normal normal-case tracking-normal">
                    · {monthSessions.length} session{monthSessions.length !== 1 ? "s" : ""}
                  </span>
                </h2>
                <ul className="space-y-3">
                  {monthSessions.map((session) => {
                    const gym = session.expand?.gym_id;
                    return (
                      <li key={session.id}>
                        <Link href={`/sessions/${session.id}`}>
                          <Card className="py-4 transition hover:shadow-md">
                            <CardContent className="flex items-center justify-between py-0">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">
                                  {format(new Date(session.date), "EEEE do MMMM yyyy")}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {gym?.name ?? "No gym"}
                                  {session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {session.notes && (
                                  <span title="Has notes" className="text-zinc-400 dark:text-zinc-500 text-base leading-none">
                                    📝
                                  </span>
                                )}
                                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  {SESSION_TYPE_LABELS[session.session_type] ?? session.session_type}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
