import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getForm } from "@/lib/forms/registry";
import { deliver } from "@/lib/forms/deliver";
import type { FormResponse } from "@/lib/forms/types";
import {
  HONEYPOT_FIELD,
  TIMESTAMP_FIELD,
  TURNSTILE_FIELD,
  checkBotSignals,
  clientIp,
  rateLimited,
  verifyTurnstile,
} from "@/lib/forms/spam";

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function noJsErrorPage(body: Extract<FormResponse, { ok: false }>, referer: string | null) {
  const items = Object.values(body.errors ?? {})
    .map((e) => `<li>${esc(e)}</li>`)
    .join("");
  const back = referer && /^https?:\/\//.test(referer) ? esc(referer) : "/";
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Please check the form</title><body style="font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem"><h1 style="font-size:1.5rem">${esc(body.message)}</h1>${items ? `<ul>${items}</ul>` : ""}<p><a href="${back}">Go back to the form</a></p></body>`;
}

const INTERNAL_FIELDS = [HONEYPOT_FIELD, TIMESTAMP_FIELD, TURNSTILE_FIELD, "_page"];

async function readBody(req: NextRequest): Promise<{ data: Record<string, string>; isJson: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return { data: Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v ?? "")])), isJson: true };
  }
  const fd = await req.formData();
  const data: Record<string, string> = {};
  fd.forEach((v, k) => {
    if (typeof v === "string") data[k] = v;
  });
  return { data, isJson: false };
}

/**
 * Named route.dynamic.ts on purpose: next.config only registers the ".dynamic.ts" extension for
 * server targets (Vercel, Node). In static builds this file is ignored and php/form.php takes over.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ form: string }> }) {
  const { form: key } = await ctx.params;
  const form = getForm(key);
  if (!form) return NextResponse.json({ ok: false, message: "Unknown form" } satisfies FormResponse, { status: 404 });

  const { data, isJson } = await readBody(req);
  const ip = clientIp(req.headers);

  // Without JS the browser does a full-page POST: redirect on success, plain error page otherwise.
  const respond = (body: FormResponse, status: number) => {
    if (isJson) return NextResponse.json(body, { status });
    // Relative Location: behind Passenger/proxies req.url can carry the internal host (e.g. 0.0.0.0:3000).
    if (body.ok) return new NextResponse(null, { status: 303, headers: { Location: form.redirect } });
    return new NextResponse(noJsErrorPage(body, req.headers.get("referer")), {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };

  if (rateLimited(ip)) return respond({ ok: false, message: "Too many submissions. Please try again later." }, 429);

  const page = data._page || req.headers.get("referer");
  const fields = Object.fromEntries(Object.entries(data).filter(([k]) => !INTERNAL_FIELDS.includes(k)));
  const parsed = form.schema.safeParse(fields);

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>;
    const errors = Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid value"]));
    return respond({ ok: false, message: "Please check the highlighted fields.", errors }, 422);
  }

  // Validation runs first so real people always see field errors.
  // Pretend bot submissions succeeded so they don't retry or learn what tripped them.
  const bot = checkBotSignals(data, { requireTimestamp: isJson });
  if (bot) {
    console.warn(`[forms] ${key} blocked (${bot})`, ip);
    return respond({ ok: true, message: "Thanks, we'll be in touch soon." }, 200);
  }

  if (!(await verifyTurnstile(data[TURNSTILE_FIELD], ip))) {
    return respond({ ok: false, message: "Verification failed. Please try again." }, 400);
  }

  const clean = Object.fromEntries(
    Object.entries(parsed.data as Record<string, unknown>).map(([k, v]) => [k, v === undefined ? "" : String(v)]),
  );

  try {
    await deliver({
      form: key,
      subject: form.subject(clean),
      data: clean,
      labels: form.labels,
      meta: { ip, userAgent: req.headers.get("user-agent"), page },
    });
  } catch (err) {
    console.error(`[forms] ${key} delivery error`, err);
    return respond(
      { ok: false, message: "Sorry, something went wrong sending your message. Please call or email us instead." },
      502,
    );
  }

  return respond({ ok: true, message: "Thanks, we'll be in touch soon." }, 200);
}
