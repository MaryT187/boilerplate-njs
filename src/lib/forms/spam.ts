import "server-only";

/** Field names shared with the client form component. */
export const HONEYPOT_FIELD = "company_website";
export const TIMESTAMP_FIELD = "_ts";
export const TURNSTILE_FIELD = "cf-turnstile-response";

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 1000 * 60 * 60 * 6;

/** Bots fill hidden fields and submit instantly. Returns a reason string when it looks like spam. */
export function checkBotSignals(data: Record<string, string>, { requireTimestamp }: { requireTimestamp: boolean }) {
  if (data[HONEYPOT_FIELD]) return "honeypot";

  // The timestamp is set by JS on mount. No-JS posts can't send it, so it's only required for fetch submissions.
  const ts = Number(data[TIMESTAMP_FIELD]);
  if (!ts) return requireTimestamp ? "missing-timestamp" : null;
  const age = Date.now() - ts;
  if (age < MIN_FILL_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "stale";

  return null;
}

/** Cloudflare Turnstile. Skipped entirely unless TURNSTILE_SECRET_KEY is set. */
export async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

/**
 * Simple fixed-window limiter per IP. In-memory, so it is per server instance:
 * fine for a single Node process, best-effort on serverless. Swap for Upstash/Redis if needed.
 */
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export function rateLimited(ip: string | null) {
  if (!ip) return false;
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export function clientIp(headers: Headers) {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}
