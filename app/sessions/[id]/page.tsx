import { SessionsResponse, GymsResponse } from "@/types/pocketbase";
import { getSessionById, getRoundsForSession, getTechniquesForSession } from "@/lib/pocketbase-server";
import EditSessionModal from "@/components/EditSessionModal";
import LogTechniquesModal from "@/components/LogTechniquesModal";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

const SESSION_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  no_gi: "No-Gi",
  open_mat: "Open Mat",
};

const OUTCOME_LABELS: Record<string, string> = {
  won: "Win",
  lost: "Loss",
  draw: "Draw",
};

const OUTCOME_COLORS: Record<string, string> = {
  won: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  draw: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

async function getSession(id: string) {
  const [session, rounds, techniques] = await Promise.all([
    getSessionById(id) as Promise<SessionWithGym>,
    getRoundsForSession(id),
    getTechniquesForSession(id),
  ]);
  return { session, rounds, techniques };
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, rounds, techniques } = await getSession(id);
  const gym = session.expand?.gym_id;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-end gap-3">
          <LogTechniquesModal sessionId={id} />
          <EditSessionModal session={session} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <CardDescription>
              {gym?.name ?? "No gym"}
              {session.duration_minutes
                ? ` · ${session.duration_minutes} min`
                : ""}
              {session.coach ? ` · ${session.coach}` : ""}
            </CardDescription>
            <CardAction>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {SESSION_TYPE_LABELS[session.session_type] ?? session.session_type}
              </span>
            </CardAction>
          </CardHeader>
          {session.notes && (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {session.notes}
              </p>
            </CardContent>
          )}
        </Card>

        {techniques.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Techniques ({techniques.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {techniques.map((st) => {
                const technique = st.expand?.technique_id;
                if (!technique) return null;
                return (
                  <div key={st.id} className="flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{technique.name}</span>
                    {technique.category && (
                      <span className="text-xs text-muted-foreground">{technique.category}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Rolling Rounds ({rounds.length})
        </h2>

        {rounds.length === 0 ? (
          <p className="text-zinc-500 text-sm">No rolling rounds recorded.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="sm:hidden space-y-3">
              {rounds.map((round) => (
                <li key={round.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{round.partner_name || "Unknown partner"}</span>
                    {round.outcome && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[round.outcome] ?? ""}`}>
                        {OUTCOME_LABELS[round.outcome] ?? round.outcome}
                      </span>
                    )}
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400 capitalize">
                    {round.partner_belt
                      ? `${round.partner_belt}${round.partner_stripe ? ` · ${round.partner_stripe}s` : ""}`
                      : "Belt unknown"}
                    {round.duration_seconds
                      ? ` · ${Math.floor(round.duration_seconds / 60)}m ${round.duration_seconds % 60}s`
                      : ""}
                  </div>
                  {round.notes && <p className="text-zinc-500 dark:text-zinc-400">{round.notes}</p>}
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Partner</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Belt</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Outcome</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Duration</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                  {rounds.map((round) => (
                    <tr key={round.id}>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{round.partner_name || "—"}</td>
                      <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                        {round.partner_belt
                          ? `${round.partner_belt}${round.partner_stripe ? ` (${round.partner_stripe}s)` : ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {round.outcome ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[round.outcome] ?? ""}`}>
                            {OUTCOME_LABELS[round.outcome] ?? round.outcome}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {round.duration_seconds
                          ? `${Math.floor(round.duration_seconds / 60)}m ${round.duration_seconds % 60}s`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{round.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
