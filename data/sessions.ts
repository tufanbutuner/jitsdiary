import { getAuthUser } from "@/lib/auth";
import {
  getSessionById as _getSessionById,
  getSessionsForUser as _getSessionsForUser,
  getRoundsForSession as _getRoundsForSession,
  getTechniquesForSession as _getTechniquesForSession,
} from "@/lib/pocketbase-server";
import type { SessionsResponse, GymsResponse } from "@/types/pocketbase";

type SessionWithGym = SessionsResponse<{ gym_id: GymsResponse }>;

export async function getSessions(): Promise<SessionWithGym[]> {
  const authUser = await getAuthUser();
  if (!authUser) return [];
  return _getSessionsForUser(authUser.userId) as Promise<SessionWithGym[]>;
}

export async function getSession(id: string): Promise<SessionWithGym> {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  const session = (await _getSessionById(id)) as SessionWithGym;
  if (session.user_id !== authUser.userId) throw new Error("Forbidden");
  return session;
}

export async function getRoundsForSession(sessionId: string) {
  const authUser = await getAuthUser();
  if (!authUser) return [];
  // Verify ownership via session lookup
  const session = await _getSessionById(sessionId);
  if (session.user_id !== authUser.userId) throw new Error("Forbidden");
  return _getRoundsForSession(sessionId);
}

export async function getTechniquesForSession(sessionId: string) {
  const authUser = await getAuthUser();
  if (!authUser) return [];
  const session = await _getSessionById(sessionId);
  if (session.user_id !== authUser.userId) throw new Error("Forbidden");
  return _getTechniquesForSession(sessionId);
}
