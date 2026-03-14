import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getAuthUser } from "@/lib/auth";
import { getCompetitions } from "@/data/competitions";
import NewCompetitionModal from "@/components/modals/NewCompetitionModal";
import { Card, CardContent } from "@/components/ui/card";
import {
  COMPETITION_RESULT_LABELS,
  COMPETITION_RESULT_COLORS,
  COMPETITION_DIVISION_LABELS,
} from "@/lib/constants";

export default async function CompetitionsPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const competitions = await getCompetitions();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Competitions</h1>
          <NewCompetitionModal />
        </div>

        {competitions.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <CardContent className="py-0">
              <p className="text-muted-foreground mb-1 font-medium">No competitions yet</p>
              <p className="text-sm text-muted-foreground">
                Hit &ldquo;+ New Competition&rdquo; above to log your first competition.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {competitions.map((competition) => {
              const dateStr = (competition.date ?? "").split(" ")[0];
              const date = new Date(dateStr + "T12:00:00");
              return (
                <li key={competition.id}>
                  <Link href={`/competitions/${competition.id}`}>
                    <Card className="py-4 transition hover:shadow-md">
                      <CardContent className="flex items-center justify-between py-0">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{competition.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(date, "do MMM yyyy")}
                            {competition.location ? ` · ${competition.location}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {competition.division && (
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {COMPETITION_DIVISION_LABELS[competition.division] ?? competition.division}
                            </span>
                          )}
                          {competition.result && (
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${COMPETITION_RESULT_COLORS[competition.result] ?? ""}`}>
                              {COMPETITION_RESULT_LABELS[competition.result] ?? competition.result}
                            </span>
                          )}
                        </div>
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
