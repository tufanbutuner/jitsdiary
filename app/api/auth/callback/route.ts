import { createServerClient } from "@/lib/pocketbase-server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("pb_code_verifier")?.value;
  const provider = cookieStore.get("pb_oauth_provider")?.value;

  if (!code || !state || !codeVerifier || !provider) {
    return NextResponse.json({ error: "Invalid OAuth2 callback" }, { status: 400 });
  }

  const pb = createServerClient();
  const origin = request.nextUrl.origin;
  const redirectUrl = `${origin}/api/auth/callback`;

  try {
    const authData = await pb.collection("users").authWithOAuth2Code(
      provider,
      code,
      codeVerifier,
      redirectUrl
    );
    cookieStore.set("pb_auth", authData.token, COOKIE_OPTS);
    cookieStore.delete("pb_code_verifier");
    cookieStore.delete("pb_oauth_provider");
    return NextResponse.redirect(new URL("/", request.nextUrl));
  } catch (e) {
    const message = e instanceof Error ? e.message : "OAuth2 callback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
