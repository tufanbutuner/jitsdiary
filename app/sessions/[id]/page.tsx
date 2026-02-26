import Link from "next/link";
import { SessionsResponse, GymsResponse } from "@/types/pocketbase";
import { createServerClient } from "@/lib/pocketbase-server";

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
  const pb = createServerClient();
  const session = await pb
    .collection("sessions")
    .getOne<SessionWithGym>(id, { expand: "gym_id" });
  const { items: rounds } = await pb
    .collection("rolling_rounds")
    .getList(1, 200, {
      filter: `session_id = "${id}"`,
      sort: "created",
    });
  return { session, rounds };
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, rounds } = await getSession(id);
  const gym = session.expand?.gym_id;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/sessions"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            &larr; Sessions
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {new Date(session.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {gym?.name ?? "No gym"}
                {session.duration_minutes
                  ? ` · ${session.duration_minutes} min`
                  : ""}
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {SESSION_TYPE_LABELS[session.session_type] ?? session.session_type}
            </span>
          </div>
          {session.notes && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {session.notes}
            </p>
          )}
        </div>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Rolling Rounds ({rounds.length})
        </h2>

        {rounds.length === 0 ? (
          <p className="text-zinc-500 text-sm">No rolling rounds recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Partner
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Belt
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Outcome
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {rounds.map((round) => (
                  <tr key={round.id}>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                      {round.partner_name || "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                      {round.partner_belt
                        ? `${round.partner_belt}${round.partner_stripe ? ` (${round.partner_stripe}s)` : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {round.outcome ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[round.outcome] ?? ""}`}
                        >
                          {OUTCOME_LABELS[round.outcome] ?? round.outcome}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {round.duration_seconds
                        ? `${Math.floor(round.duration_seconds / 60)}m ${round.duration_seconds % 60}s`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {round.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
