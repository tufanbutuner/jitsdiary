import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pb = createServerClient();
  const { items } = await pb.collection("session_techniques").getList(1, 200, {
    filter: `session_id = "${id}"`,
    expand: "technique_id",
  });
  return Response.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pb = createServerClient();

  // Verify session belongs to this user
  const session = await pb.collection("sessions").getOne(id);
  if (session.user_id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const techniqueIds: string[] = body.technique_ids;

  // Get already-logged techniques to avoid duplicates
  const { items: existing } = await pb.collection("session_techniques").getList(1, 200, {
    filter: `session_id = "${id}"`,
  });
  const existingIds = new Set(existing.map((e) => e.technique_id));

  const created = await Promise.all(
    techniqueIds
      .filter((tid) => !existingIds.has(tid))
      .map((tid) =>
        pb.collection("session_techniques").create({
          session_id: id,
          technique_id: tid,
        })
      )
  );

  return Response.json(created, { status: 201 });
}
