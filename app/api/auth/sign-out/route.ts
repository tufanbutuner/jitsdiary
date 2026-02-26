import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("pb_auth");
  return Response.json({ ok: true });
}
