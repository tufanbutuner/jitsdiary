import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { getAuthUser } from "@/lib/auth";
import { getCompetition } from "@/data/competitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COMPETITION_RESULT_LABELS,
  COMPETITION_RESULT_COLORS,
  COMPETITION_DIVISION_LABELS,
} from "@/lib/constants";
import EditCompetitionButton from "@/components/EditCompetitionButton";
import DeleteCompetitionButton from "@/components/DeleteCompetitionButton";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const { id } = await params;

  let competition;
  try {
    competition = await getCompetition(id);
  } catch (e) {
    console.error("getCompetition error:", e);
    notFound();
  }

  const dateStr = (competition.date ?? "").split(" ")[0];
  const date = new Date(dateStr + "T12:00:00");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-end gap-3">
          <DeleteCompetitionButton competitionId={id} />
          <EditCompetitionButton competition={competition} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{competition.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground mb-1">Date</dt>
                <dd className="font-medium">{format(date, "do MMM yyyy")}</dd>
              </div>
              {competition.location && (
                <div>
                  <dt className="text-muted-foreground mb-1">Location</dt>
                  <dd className="font-medium">{competition.location}</dd>
                </div>
              )}
              {competition.division && (
                <div>
                  <dt className="text-muted-foreground mb-1">Division</dt>
                  <dd>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {COMPETITION_DIVISION_LABELS[competition.division] ?? competition.division}
                    </span>
                  </dd>
                </div>
              )}
              {competition.weight_class && (
                <div>
                  <dt className="text-muted-foreground mb-1">Weight Class</dt>
                  <dd className="font-medium">{competition.weight_class}</dd>
                </div>
              )}
              {competition.result && (
                <div>
                  <dt className="text-muted-foreground mb-1">Result</dt>
                  <dd>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${COMPETITION_RESULT_COLORS[competition.result] ?? ""}`}>
                      {COMPETITION_RESULT_LABELS[competition.result] ?? competition.result}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
            {competition.notes && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{competition.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
