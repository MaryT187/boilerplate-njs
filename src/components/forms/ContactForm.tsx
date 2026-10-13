"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { FormResponse } from "@/lib/forms/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Select, TextArea, TextField } from "./Field";

declare global {
  interface Window {
    turnstile?: { reset: (el?: string | HTMLElement) => void };
  }
}

type Props = {
  /** Options for the service dropdown. Empty hides the field. */
  services?: string[];
  /** Key in src/lib/forms/forms.json. */
  form?: string;
  className?: string;
};

type Status = { state: "idle" | "submitting" } | { state: "success" | "error"; message: string };

const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Static (PHP-only cPanel) builds post to php/form.php; Vercel and Node use the Next.js route. */
export function formEndpoint(form: string) {
  return process.env.NEXT_PUBLIC_DEPLOY_TARGET === "static"
    ? `/api/form.php?form=${encodeURIComponent(form)}`
    : `/api/forms/${encodeURIComponent(form)}`;
}

export function ContactForm({ form: formKey = "contact", services = [], className }: Props) {
  const tsRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  // Render time for the bot timing check. Set on mount so it isn't baked in at build time.
  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ state: "submitting" });
    setErrors({});

    const payload = Object.fromEntries(new FormData(form).entries());
    payload._page = window.location.href;

    let result: FormResponse;
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      result = (await res.json()) as FormResponse;
    } catch {
      result = { ok: false, message: "Network error. Please check your connection and try again." };
    }

    if (result.ok) {
      form.reset();
      if (tsRef.current) tsRef.current.value = String(Date.now());
      setStatus({ state: "success", message: result.message });
    } else {
      setErrors(result.errors ?? {});
      setStatus({ state: "error", message: result.message });
    }
    window.turnstile?.reset();

    // Field errors: focus the first invalid field (the status message is still announced via aria-live).
    // Otherwise move focus to the status message so it's read out and visible.
    const firstInvalid = !result.ok && result.errors && Object.keys(result.errors)[0];
    requestAnimationFrame(() => {
      const target = firstInvalid ? form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`) : statusRef.current;
      target?.focus();
    });
  }

  const submitting = status.state === "submitting";

  return (
    <form
      action={formEndpoint(formKey)}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className={cn("relative grid gap-5 sm:grid-cols-2", className)}
    >
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={cn(
          "rounded-lg px-4 py-3 text-sm font-medium outline-none sm:col-span-2",
          status.state === "success" && "bg-success/10 text-success",
          status.state === "error" && "bg-danger/10 text-danger",
          (status.state === "idle" || status.state === "submitting") && "sr-only",
        )}
      >
        {"message" in status ? status.message : ""}
      </div>

      <TextField name="name" label="Name" autoComplete="name" required error={errors.name} />
      <TextField name="email" type="email" label="Email" autoComplete="email" required error={errors.email} />
      <TextField name="phone" type="tel" label="Phone" autoComplete="tel" inputMode="tel" error={errors.phone} />
      {services.length > 0 && <Select name="service" label="Service" options={services} error={errors.service} />}
      <TextArea name="message" label="Message" required error={errors.message} className="sm:col-span-2" />

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {/* No value/defaultValue prop: React re-applies defaultValue on every render, which would wipe the timestamp. */}
      <input ref={tsRef} type="hidden" name="_ts" />

      {turnstileKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile sm:col-span-2" data-sitekey={turnstileKey} />
        </>
      )}

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          <span className="text-danger">*</span> Required
        </p>
        <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Sending..." : "Send message"}
        </Button>
      </div>
    </form>
  );
}
