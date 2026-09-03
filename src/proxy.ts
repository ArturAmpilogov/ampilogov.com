import { type NextRequest, NextResponse } from "next/server";
import { BACKUP_COOKIE, backupAccessCookieValue, backupAccessSecret, secretsMatch } from "@/lib/backup-access";

function privateHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function hiddenResponse() {
  return privateHeaders(new NextResponse(null, { status: 404 }));
}

export function proxy(request: NextRequest) {
  const secret = backupAccessSecret();
  if (!secret) return hiddenResponse();
  const cookieValue = backupAccessCookieValue(secret);

  const suppliedKey = request.nextUrl.searchParams.get("key");
  if (secretsMatch(suppliedKey, secret)) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("key");
    const response = privateHeaders(NextResponse.redirect(cleanUrl));
    response.cookies.set(BACKUP_COOKIE, cookieValue, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  if (!secretsMatch(request.cookies.get(BACKUP_COOKIE)?.value, cookieValue)) return hiddenResponse();
  return privateHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/archive/:path*",
    "/records/:sourceId/backup/:path*",
    "/people/:personId/backup/:path*",
  ],
};
