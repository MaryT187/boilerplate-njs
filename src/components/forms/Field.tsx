import { cn, filled } from "@/lib/utils";

const control =
  "block w-full rounded-lg border bg-white px-4 py-3 text-base text-ink placeholder:text-muted/60 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none";

type Base = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

function Wrapper({ name, label, error, hint, required, className, children }: Base & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {filled(hint) && !error && (
        <p id={`${name}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const a11y = (name: string, error?: string, hint?: string) => ({
  id: name,
  name,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${name}-error` : filled(hint) ? `${name}-hint` : undefined,
});

export function TextField({ type = "text", ...props }: Base & Omit<React.ComponentProps<"input">, "name">) {
  const { name, label, error, hint, required, className, ...input } = props;
  return (
    <Wrapper {...{ name, label, error, hint, required, className }}>
      <input
        type={type}
        required={required}
        className={cn(control, error ? "border-danger" : "border-line")}
        {...a11y(name, error, hint)}
        {...input}
      />
    </Wrapper>
  );
}

export function TextArea(props: Base & Omit<React.ComponentProps<"textarea">, "name">) {
  const { name, label, error, hint, required, className, rows = 5, ...input } = props;
  return (
    <Wrapper {...{ name, label, error, hint, required, className }}>
      <textarea
        rows={rows}
        required={required}
        className={cn(control, "resize-y", error ? "border-danger" : "border-line")}
        {...a11y(name, error, hint)}
        {...input}
      />
    </Wrapper>
  );
}

export function Select(
  props: Base & Omit<React.ComponentProps<"select">, "name"> & { options: readonly string[]; placeholder?: string },
) {
  const { name, label, error, hint, required, className, options, placeholder = "Select an option", ...input } = props;
  return (
    <Wrapper {...{ name, label, error, hint, required, className }}>
      <div className="relative">
        <select
          required={required}
          defaultValue=""
          className={cn(control, "appearance-none pr-10", error ? "border-danger" : "border-line")}
          {...a11y(name, error, hint)}
          {...input}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </Wrapper>
  );
}
