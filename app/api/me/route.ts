import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const authUser = await getAuthUser();
  return Response.json({ userId: authUser?.userId ?? null });
}
