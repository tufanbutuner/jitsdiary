import { createServerClient } from "@/lib/pocketbase-server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pb = createServerClient();
  const { items: rounds } = await pb
    .collection("rolling_rounds")
    .getList(1, 200, {
      filter: `session_id = "${id}"`,
      sort: "created",
    });
  return Response.json(rounds);
}
