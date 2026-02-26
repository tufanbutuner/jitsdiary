import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionsResponse, GymsResponse } from "@/types/pocketbase";
import { getSessionsForUser } from "@/lib/pocketbase-server";
import { getAuthUser } from "@/lib/auth";
import NewSessionModal from "@/components/NewSessionModal";
import { Card, CardContent } from "@/components/ui/card";

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

const SESSION_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open Mat",
};

async function getSessions(userId: string): Promise<SessionWithGym[]> {
  return getSessionsForUser(userId) as Promise<SessionWithGym[]>;
}

export default async function SessionsPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const sessions = await getSessions(authUser.userId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sessions
          </h1>
          <NewSessionModal />
        </div>

{sessions.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <CardContent className="py-0">
              <p className="text-muted-foreground mb-1 font-medium">
                No sessions yet
              </p>
              <p className="text-sm text-muted-foreground">
                Hit &ldquo;+ New Session&rdquo; above to log your first training session.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => {
              const gym = session.expand?.gym_id;
              return (
                <li key={session.id}>
                  <Link href={`/sessions/${session.id}`}>
                    <Card className="py-4 transition hover:shadow-md">
                      <CardContent className="flex items-center justify-between py-0">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {new Date(session.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
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
  );
}
