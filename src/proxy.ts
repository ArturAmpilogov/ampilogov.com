import { createHash, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

const BACKUP_COOKIE = "ampilogov_backup_access_v1";

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

function accessCookieValue(secret: string) {
  return createHash("sha256").update(`ampilogov-backup:${secret}`).digest("hex");
}

function secretsMatch(left: string | null | undefined, right: string) {
  if (!left) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function proxy(request: NextRequest) {
  const secret = process.env.BACKUP_ACCESS_TOKEN?.trim();
  if (!secret) return hiddenResponse();
  const cookieValue = accessCookieValue(secret);

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
