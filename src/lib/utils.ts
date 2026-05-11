import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("uz-UZ").format(value)} UZS`;
}

export function makeId(prefix: string, index: number) {
  return `${prefix}-${String(index).padStart(4, "0")}`;
}

export function randomPick<T>(items: readonly T[], index: number) {
  return items[index % items.length];
}

export function chunk<T>(items: T[], size: number) {
  return items.reduce<T[][]>((acc, item, index) => {
    if (index % size === 0) {
      acc.push([]);
    }

    acc[acc.length - 1]?.push(item);
    return acc;
  }, []);
}

export function downloadTextFile(name: string, content: string) {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
  URL.revokeObjectURL(href);
}

export function daysBetween(a: string, b: string) {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function safeContains(text: string, query: string) {
  return text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}
