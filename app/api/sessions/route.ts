import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pb = createServerClient();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const sessions = await pb.collection("sessions").getList(page, 20, {
    filter: `user_id = "${userId}"`,
    expand: "gym_id",
    sort: "-date",
  });
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const pb = createServerClient();
  const session = await pb.collection("sessions").create({
    user_id: userId,
    date: body.date,
    session_type: body.session_type,
    gym_id: body.gym_id || undefined,
    duration_minutes: body.duration_minutes ? Number(body.duration_minutes) : undefined,
    notes: body.notes || undefined,
  });
  return Response.json(session, { status: 201 });
}
