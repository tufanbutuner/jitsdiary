import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/sessions", "/profile"];

export function middleware(req: NextRequest) {
  const isProtected = protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r));
  if (isProtected && !req.cookies.get("pb_auth")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
