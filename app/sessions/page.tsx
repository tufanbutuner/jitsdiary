import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SessionsResponse, GymsResponse } from "@/types/pocketbase";
import { createServerClient } from "@/lib/pocketbase-server";
import NewSessionModal from "@/components/NewSessionModal";

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

const SESSION_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open Mat",
};

async function getSessions(userId: string): Promise<SessionWithGym[]> {
  const pb = createServerClient();
  const result = await pb.collection("sessions").getList<SessionWithGym>(1, 50, {
    filter: `user_id = "${userId}"`,
    expand: "gym_id",
    sort: "-date",
  });
  return result.items;
}

export default async function SessionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const sessions = await getSessions(userId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sessions
          </h1>
          <NewSessionModal />
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-1 font-medium">
              No sessions yet
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Hit &ldquo;+ New Session&rdquo; above to log your first training session.
            </p>
          </div>
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
