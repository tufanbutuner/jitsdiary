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
