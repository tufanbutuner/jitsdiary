import { getAuthUser } from "@/lib/auth";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pb = createServerClient();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const sessions = await pb.collection("sessions").getList(page, 20, {
    filter: `user_id = "${authUser.userId}"`,
    expand: "gym_id",
    sort: "-date",
  });
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const pb = createServerClient();
    const session = await pb.collection("sessions").create({
      user_id: authUser.userId,
      date: body.date,
      session_type: body.session_type,
      gym_id: body.gym_id || undefined,
      duration_minutes: body.duration_minutes ? Number(body.duration_minutes) : undefined,
      notes: body.notes || undefined,
      coach: body.coach || undefined,
    });
    return Response.json(session, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create session";
    return Response.json({ error: message }, { status: 500 });
  }
}
