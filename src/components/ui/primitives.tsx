"use client";

import { PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
}) {
  const styles = {
    primary: "bg-panel text-white hover:bg-ink",
    secondary: "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-300 hover:bg-white/10 hover:text-white",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    accent: "bg-emerald text-white hover:bg-emerald-700"
  }[variant];
  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm"
  }[size];

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        sizes,
        className
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  muted = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { muted?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft",
        muted && "bg-slate-50",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  tone = "slate",
  className,
  children
}: PropsWithChildren<{ tone?: "emerald" | "cyan" | "gold" | "rose" | "orange" | "slate"; className?: string }>) {
  const palette = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    gold: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200"
  }[tone];

  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1", palette, className)}>{children}</span>;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">{eyebrow}</p> : null}
        <div>
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Label({ children, htmlFor }: PropsWithChildren<{ htmlFor?: string }>) {
  return <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</label>;
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      aria-label={props["aria-label"] ?? props.name ?? props.placeholder ?? "input field"}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & PropsWithChildren) {
  return (
    <select
      aria-label={props["aria-label"] ?? props.name ?? "select field"}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      aria-label={props["aria-label"] ?? props.name ?? props.placeholder ?? "text area"}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
        className
      )}
      {...props}
    />
  );
}

export function KpiCard({
  label,
  value,
  hint,
  accent = "cyan"
}: {
  label: string;
  value: string;
  hint: string;
  accent?: "cyan" | "emerald" | "gold" | "rose";
}) {
  const strip = {
    cyan: "from-cyan-500 to-blue-600",
    emerald: "from-emerald-500 to-green-600",
    gold: "from-amber-400 to-orange-500",
    rose: "from-rose-500 to-red-600"
  }[accent];

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", strip)} />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{hint}</p>
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/80", className)} />;
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed bg-slate-50 text-center">
      <div className="mx-auto max-w-lg space-y-3 py-10">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </Card>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
  footer
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Modal oynani yopish"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
