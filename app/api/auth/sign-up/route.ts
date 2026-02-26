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
  const { email, password, name } = await request.json();
  const pb = createServerClient();
  try {
    await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name,
    });
    const authData = await pb.collection("users").authWithPassword(email, password);
    (await cookies()).set("pb_auth", authData.token, COOKIE_OPTS);
    return Response.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create account";
    return Response.json({ error: message }, { status: 400 });
  }
}
