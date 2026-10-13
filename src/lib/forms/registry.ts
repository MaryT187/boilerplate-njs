import { z } from "zod";
import definitions from "./forms.json";

/**
 * Forms are defined in forms.json so the PHP handler (static/cPanel builds) and this
 * Next.js route validate with exactly the same rules. Add a form there, not here.
 */

export type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "checkbox";

export type FieldRule = {
  label: string;
  type?: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  /** Regex source (no slashes). Applied to non-empty values. */
  pattern?: string;
  message?: string;
};

export type FormDefinition = {
  /** "{field}" placeholders are replaced with submitted values. */
  subject: string;
  redirect: string;
  fields: Record<string, FieldRule>;
};

/** Must match PHONE_PATTERN in php/form.php. */
export const PHONE_PATTERN = "^[+()\\d\\s-]{8,20}$";

const forms = Object.fromEntries(Object.entries(definitions).filter(([key]) => key !== "$comment")) as Record<
  string,
  FormDefinition
>;

function fieldSchema(rule: FieldRule) {
  const msg = rule.message ?? `Check your ${rule.label.toLowerCase()}`;

  if (rule.type === "checkbox") {
    return rule.required ? z.literal("on", { error: msg }) : z.string();
  }

  let s = z.string({ error: msg }).trim();
  if (rule.max) s = s.max(rule.max, msg);

  const pattern = rule.pattern ?? (rule.type === "tel" ? PHONE_PATTERN : undefined);

  return s.superRefine((value, ctx) => {
    if (value === "") {
      if (rule.required) ctx.addIssue({ code: "custom", message: msg });
      return;
    }
    if (rule.min && value.length < rule.min) ctx.addIssue({ code: "custom", message: msg });
    if (rule.type === "email" && !z.email().safeParse(value).success) ctx.addIssue({ code: "custom", message: msg });
    if (pattern && !new RegExp(pattern).test(value)) ctx.addIssue({ code: "custom", message: msg });
  });
}

const schemaCache = new Map<string, z.ZodObject>();

export function getForm(key: string) {
  if (!Object.hasOwn(forms, key)) return null;
  const def = forms[key];

  let schema = schemaCache.get(key);
  if (!schema) {
    schema = z.object(
      Object.fromEntries(
        // Missing keys become "" first, so required checks still run on them.
        Object.entries(def.fields).map(([name, rule]) => [name, z.preprocess((v) => v ?? "", fieldSchema(rule))]),
      ),
    );
    schemaCache.set(key, schema);
  }

  const labels = Object.fromEntries(Object.entries(def.fields).map(([name, rule]) => [name, rule.label]));
  const subject = (data: Record<string, string>) => def.subject.replace(/\{(\w+)\}/g, (_, k: string) => data[k] ?? "");

  return { ...def, schema, labels, subject };
}

export type FormKey = Exclude<keyof typeof definitions, "$comment">;
