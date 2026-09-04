import { createHash, timingSafeEqual } from "node:crypto";

export const BACKUP_COOKIE = "ampilogov_backup_access_v1";

export function backupAccessSecret() {
  const secret = process.env.BACKUP_ACCESS_TOKEN?.trim();
  return secret ? secret : null;
}

export function backupAccessCookieValue(secret: string) {
  return createHash("sha256").update(`ampilogov-backup:${secret}`).digest("hex");
}

export function secretsMatch(left: string | null | undefined, right: string) {
  if (!left) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

type CookieReader = { cookies: { get(name: string): { value: string } | undefined } };

/**
 * True when the request carries the access cookie issued by `src/proxy.ts`.
 * Route handlers that stream private scans check this themselves instead of
 * trusting the proxy alone, so a matcher mistake cannot expose the store.
 */
export function hasBackupAccess(request: CookieReader) {
  const secret = backupAccessSecret();
  if (!secret) return false;
  return secretsMatch(request.cookies.get(BACKUP_COOKIE)?.value, backupAccessCookieValue(secret));
}
