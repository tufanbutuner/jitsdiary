import { createServerClient } from "@/lib/pocketbase-server";
import { cookies } from "next/headers";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const pb = createServerClient();
  try {
    const authData = await pb.collection("users").authWithPassword(email, password);
    (await cookies()).set("pb_auth", authData.token, COOKIE_OPTS);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
}
