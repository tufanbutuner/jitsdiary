import { createServerClient } from "@/lib/pocketbase-server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const pb = createServerClient();
  const origin = request.nextUrl.origin;
  const redirectUrl = `${origin}/api/auth/callback`;

  try {
    const authMethods = await pb.collection("users").listAuthMethods();
    const oauthProvider = authMethods.oauth2.providers.find((p) => p.name === provider);
    if (!oauthProvider) {
      return NextResponse.json({ error: `Provider ${provider} not found` }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("pb_code_verifier", oauthProvider.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });
    cookieStore.set("pb_oauth_provider", provider, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });

    const authUrl = oauthProvider.authURL + redirectUrl;
    return NextResponse.redirect(authUrl);
  } catch (e) {
    const message = e instanceof Error ? e.message : "OAuth2 error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
