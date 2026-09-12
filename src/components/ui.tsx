import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`space-y-5 rounded-[20px] border border-line bg-ink-2 p-6 text-left lg:space-y-4 lg:p-8 ${className}`}
    >
      {title ? <h2 className="text-base font-semibold tracking-tight">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[0.95rem] leading-6 text-paper">{label}</legend>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      <div className="mt-2.5">{children}</div>
    </fieldset>
  );
}

export function Choice({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
        checked ? "border-lime bg-selected text-paper" : "border-line text-muted hover:border-lime/40"
      }`}
    >
      <span className="flex items-center gap-2">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-lime" />
        {label}
      </span>
      {hint ? <span className="pl-6 text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
