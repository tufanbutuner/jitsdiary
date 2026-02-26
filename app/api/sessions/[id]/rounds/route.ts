import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pb = createServerClient();
  const rounds = await pb.collection("rolling_rounds").getFullList({
    filter: `session_id = "${id}"`,
    sort: "created",
  });
  return Response.json(rounds);
}
