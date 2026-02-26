import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pb = createServerClient();
  const session = await pb.collection("sessions").getOne(id, {
    expand: "gym_id",
  });
  const { items: rounds } = await pb.collection("rolling_rounds").getList(1, 200, {
    filter: `session_id = "${id}"`,
    sort: "created",
  });
  return Response.json({ session, rounds });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pb = createServerClient();

  // Verify the session belongs to this user
  const existing = await pb.collection("sessions").getOne(id);
  if (existing.user_id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const session = await pb.collection("sessions").update(id, {
      date: body.date,
      session_type: body.session_type,
      gym_id: body.gym_id || null,
      duration_minutes: body.duration_minutes ? Number(body.duration_minutes) : null,
      notes: body.notes || null,
      coach: body.coach || null,
    });
    return Response.json(session);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update session";
    return Response.json({ error: message }, { status: 500 });
  }
}
