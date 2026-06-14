import type { CookieOptions } from 'express';

/** Resolves whether the sid cookie requires HTTPS (Secure flag). */
function isSecureCookie(): boolean {
  const override = process.env.COOKIE_SECURE;
  if (override !== undefined) {
    return override === 'true' || override === '1';
  }
  return process.env.NODE_ENV === 'production';
}

/** Shared options for the httpOnly sid session cookie. */
export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'lax',
  };
}
