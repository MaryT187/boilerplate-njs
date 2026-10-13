import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/lib/site";

type Submission = {
  form: string;
  subject: string;
  data: Record<string, string>;
  labels: Record<string, string>;
  meta: { ip: string | null; userAgent: string | null; page: string | null };
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function rows(sub: Submission) {
  return Object.entries(sub.data)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => ({ label: sub.labels[k] ?? k, value: v }));
}

function renderEmail(sub: Submission) {
  const list = rows(sub);
  const text = list.map((r) => `${r.label}: ${r.value}`).join("\n") + `\n\nSent from ${sub.meta.page ?? site.url}`;
  const html = `
    <table cellpadding="8" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
      ${list
        .map(
          (r) => `<tr>
            <td style="border-bottom:1px solid #eee;font-weight:bold;vertical-align:top;white-space:nowrap">${escapeHtml(r.label)}</td>
            <td style="border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(r.value)}</td>
          </tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#666">Sent from ${escapeHtml(sub.meta.page ?? site.url)}</p>`;
  return { text, html };
}

let transporter: Transporter | null = null;

function getTransport() {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT ?? 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

async function sendEmail(sub: Submission) {
  const to = process.env.FORM_TO_EMAIL;
  if (!to) throw new Error("FORM_TO_EMAIL is not set");
  const { text, html } = renderEmail(sub);

  await getTransport().sendMail({
    from: process.env.FORM_FROM_EMAIL ?? process.env.SMTP_USER,
    to: to.split(",").map((s) => s.trim()),
    replyTo: sub.data.email || undefined,
    subject: sub.subject,
    text,
    html,
  });
}

/** POSTs JSON to a CRM/automation webhook (GoHighLevel, Zapier, Make, n8n...). */
async function sendWebhook(sub: Submission) {
  const url = process.env.FORM_WEBHOOK_URL!;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.FORM_WEBHOOK_SECRET && { Authorization: `Bearer ${process.env.FORM_WEBHOOK_SECRET}` }),
    },
    body: JSON.stringify({ form: sub.form, ...sub.data, source: sub.meta.page, submittedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

/**
 * Sends to every configured channel. Succeeds if at least one channel succeeds,
 * so a webhook outage doesn't lose an enquiry that was emailed (and vice versa).
 */
export async function deliver(sub: Submission) {
  const channels: Array<[string, () => Promise<void>]> = [];
  if (process.env.SMTP_HOST) channels.push(["email", () => sendEmail(sub)]);
  if (process.env.FORM_WEBHOOK_URL) channels.push(["webhook", () => sendWebhook(sub)]);

  if (channels.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[forms] No delivery configured. "${sub.form}" submission:`, sub.data);
      return;
    }
    throw new Error("No form delivery channel configured (set SMTP_* and/or FORM_WEBHOOK_URL)");
  }

  const results = await Promise.allSettled(channels.map(([, fn]) => fn()));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[forms] ${channels[i][0]} delivery failed:`, r.reason);
  });
  if (results.every((r) => r.status === "rejected")) throw new Error("All delivery channels failed");
}
