export type FormResponse =
  { ok: true; message: string } | { ok: false; message: string; errors?: Record<string, string> };
