import { getAuthUser } from "@/lib/auth";
import {
  getCompetitionsForUser as _getCompetitionsForUser,
  getCompetitionById as _getCompetitionById,
} from "@/lib/pocketbase-server";
import type { CompetitionsResponse } from "@/types/pocketbase";

export async function getCompetitions(): Promise<CompetitionsResponse[]> {
  const authUser = await getAuthUser();
  if (!authUser) return [];
  return _getCompetitionsForUser(authUser.userId);
}

export async function getCompetition(id: string): Promise<CompetitionsResponse> {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  const competition = await _getCompetitionById(id);
  if (competition.user_id !== authUser.userId) throw new Error("Forbidden");
  return competition;
}
